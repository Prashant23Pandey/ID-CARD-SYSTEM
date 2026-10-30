const crypto = require('crypto');
const { User, STATUS, ROLES } = require('../models/User');
const { AppError } = require('../middlewares/error.middleware');
const { hashPassword, comparePassword } = require('../utils/password');
const { generateToken, verifyToken, TOKEN_TYPES } = require('../utils/jwt');
const authService = require('../services/auth.service');
const emailService = require('../services/email.service');

// Utility to set HTTP-Only cookie for refresh token
const sendRefreshTokenCookie = (res, refreshToken) => {
  res.cookie('refreshToken', refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const sendAccessTokenCookie = (res, accessToken) => {
  res.cookie('accessToken', accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    maxAge: 15 * 60 * 1000, // 15 mins
  });
};

exports.register = async (req, res, next) => {
  try {
    const { username, name, email, mobile, password, role, schoolId } = req.body;

    // Check for duplicate username or email
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return next(new AppError('Username or email already exists', 400));
    }

    const hashedPassword = await hashPassword(password);

    const user = await User.create({
      username,
      name,
      email,
      mobile,
      passwordHash: hashedPassword,
      role,
      schoolId: role === ROLES.SUPERADMIN ? undefined : schoolId,
      status: STATUS.ACTIVE, // Assuming auto-activation for now, can be changed to INACTIVE
    });

    // Generate Verification Token
    const verifyTokenStr = generateToken({ id: user._id }, TOKEN_TYPES.EMAIL_VERIFY);
    const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
    
    await authService.storeToken(user._id, verifyTokenStr, 'EMAIL_VERIFY', req, expiresAt);
    
    // Send email asynchronously
    emailService.sendVerificationEmail(user.email, user.name, verifyTokenStr).catch(err => console.error(err));

    res.status(201).json({
      success: true,
      message: 'Registration successful. Please check your email to verify your account.',
      data: {
        userId: user._id,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.login = async (req, res, next) => {
  try {
    const { identifier, password } = req.body;

    const user = await User.findOne({ 
      $or: [{ email: identifier.toLowerCase() }, { username: identifier }] 
    }).select('+passwordHash');

    if (!user) {
      return next(new AppError('Invalid credentials', 401));
    }

    // Check status
    if (user.status !== STATUS.ACTIVE) {
      await authService.logLoginAttempt(user._id, user.username, user.role, user.schoolId, req, 'FAILED', 'Account inactive');
      return next(new AppError(`Account is ${user.status.toLowerCase()}. Please contact support.`, 403));
    }

    const isMatch = await comparePassword(password, user.passwordHash);
    if (!isMatch) {
      await authService.logLoginAttempt(user._id, user.username, user.role, user.schoolId, req, 'FAILED', 'Invalid password');
      return next(new AppError('Invalid credentials', 401));
    }

    // Generate tokens
    const accessToken = generateToken({ id: user._id }, TOKEN_TYPES.ACCESS);
    const refreshToken = generateToken({ id: user._id }, TOKEN_TYPES.REFRESH);

    // Store refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    await authService.storeToken(user._id, refreshToken, 'REFRESH', req, refreshExpiresAt);

    // Update last login & log attempt
    user.lastLogin = Date.now();
    await user.save({ validateBeforeSave: false });
    await authService.logLoginAttempt(user._id, user.username, user.role, user.schoolId, req, 'SUCCESS');

    sendRefreshTokenCookie(res, refreshToken);
    sendAccessTokenCookie(res, accessToken); // Optional, if using cookies for access token

    const userObj = user.toObject();
    delete userObj.passwordHash;

    res.status(200).json({
      success: true,
      message: 'Login successful',
      data: {
        user: userObj,
        accessToken, // Send in payload for frontend memory storage
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.refreshToken = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken || req.body.refreshToken;

    if (!refreshToken) {
      return next(new AppError('Refresh token missing', 401));
    }

    // Verify JWT signature
    let decoded;
    try {
      decoded = verifyToken(refreshToken, TOKEN_TYPES.REFRESH);
    } catch (err) {
      return next(new AppError('Invalid or expired refresh token', 401));
    }

    // Verify token exists and is not revoked in DB
    const isValidInDb = await authService.validateStoredToken(refreshToken, 'REFRESH');
    if (!isValidInDb) {
      return next(new AppError('Refresh token revoked or invalid', 401));
    }

    const user = await User.findById(decoded.id);
    if (!user || user.status !== STATUS.ACTIVE) {
      return next(new AppError('User not found or inactive', 401));
    }

    // Issue new access token
    const newAccessToken = generateToken({ id: user._id }, TOKEN_TYPES.ACCESS);
    sendAccessTokenCookie(res, newAccessToken);

    // Optional: Rotate refresh token here (issue a new one, revoke the old one) for tighter security
    // For simplicity, we keep the original refresh token until it expires.

    res.status(200).json({
      success: true,
      message: 'Token refreshed',
      data: {
        accessToken: newAccessToken,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.logout = async (req, res, next) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      await authService.revokeToken(refreshToken, 'REFRESH');
    }

    // Log logout event if user was authenticated
    if (req.user) {
      await authService.logLoginAttempt(req.user._id, req.user.username, req.user.role, req.user.schoolId, req, 'LOGOUT');
    }

    res.clearCookie('refreshToken');
    res.clearCookie('accessToken');

    res.status(200).json({
      success: true,
      message: 'Logged out successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.getMe = async (req, res, next) => {
  try {
    // req.user is populated by auth.middleware
    res.status(200).json({
      success: true,
      data: req.user,
    });
  } catch (error) {
    next(error);
  }
};

exports.forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      // Return 200 anyway to prevent email enumeration
      return res.status(200).json({
        success: true,
        message: 'If an account matches that email, a password reset link has been sent.',
      });
    }

    const resetToken = generateToken({ id: user._id }, TOKEN_TYPES.PASSWORD_RESET);
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 mins
    
    await authService.storeToken(user._id, resetToken, 'PASSWORD_RESET', req, expiresAt);
    
    emailService.sendPasswordResetEmail(user.email, user.name, resetToken).catch(err => console.error(err));

    res.status(200).json({
      success: true,
      message: 'If an account matches that email, a password reset link has been sent.',
    });
  } catch (error) {
    next(error);
  }
};

exports.resetPassword = async (req, res, next) => {
  try {
    const { token, newPassword } = req.body;

    let decoded;
    try {
      decoded = verifyToken(token, TOKEN_TYPES.PASSWORD_RESET);
    } catch (err) {
      return next(new AppError('Invalid or expired reset token', 400));
    }

    const isValidInDb = await authService.validateStoredToken(token, 'PASSWORD_RESET');
    if (!isValidInDb) {
      return next(new AppError('Token has already been used or revoked', 400));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    // Revoke the token so it can't be used again
    await authService.revokeToken(token, 'PASSWORD_RESET');
    // Revoke all existing refresh tokens forcing re-login everywhere
    await authService.revokeAllUserTokens(user._id, 'REFRESH');

    res.status(200).json({
      success: true,
      message: 'Password reset successful. Please log in with your new password.',
    });
  } catch (error) {
    next(error);
  }
};

exports.verifyEmail = async (req, res, next) => {
  try {
    const { token } = req.query;

    let decoded;
    try {
      decoded = verifyToken(token, TOKEN_TYPES.EMAIL_VERIFY);
    } catch (err) {
      return next(new AppError('Invalid or expired verification token', 400));
    }

    const isValidInDb = await authService.validateStoredToken(token, 'EMAIL_VERIFY');
    if (!isValidInDb) {
      return next(new AppError('Token has already been used', 400));
    }

    const user = await User.findById(decoded.id);
    if (!user) {
      return next(new AppError('User not found', 404));
    }

    user.emailVerified = true;
    await user.save({ validateBeforeSave: false });
    await authService.revokeToken(token, 'EMAIL_VERIFY');

    res.status(200).json({
      success: true,
      message: 'Email successfully verified',
    });
  } catch (error) {
    next(error);
  }
};
