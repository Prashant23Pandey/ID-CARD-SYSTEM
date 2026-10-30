const express = require('express');
const passport = require('passport');
const authController = require('../controllers/auth.controller');
const { requireAuth } = require('../middlewares/auth.middleware');
const validateRequest = require('../middlewares/validation.middleware');
const { authLimiter } = require('../middlewares/rateLimit.middleware');
const {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
} = require('../validators/auth.validator');

const router = express.Router();

// Local Auth Routes
router.post('/register', authLimiter, registerValidator, validateRequest, authController.register);
router.post('/login', authLimiter, loginValidator, validateRequest, authController.login);
router.post('/logout', authController.logout);
router.post('/refresh-token', authController.refreshToken);

// Password Recovery
router.post('/forgot-password', authLimiter, forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/reset-password', authLimiter, resetPasswordValidator, validateRequest, authController.resetPassword);

// Email Verification
router.get('/verify-email', verifyEmailValidator, validateRequest, authController.verifyEmail);

// Google OAuth Routes
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false, failureRedirect: '/login?error=true' }),
  (req, res) => {
    // On success, issue tokens
    const { generateToken, TOKEN_TYPES } = require('../utils/jwt');
    const authService = require('../services/auth.service');
    
    const user = req.user;
    const accessToken = generateToken({ id: user._id }, TOKEN_TYPES.ACCESS);
    const refreshToken = generateToken({ id: user._id }, TOKEN_TYPES.REFRESH);
    
    // Store refresh token
    const refreshExpiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    authService.storeToken(user._id, refreshToken, 'REFRESH', req, refreshExpiresAt).catch(console.error);

    // Send cookie & redirect to frontend
    res.cookie('refreshToken', refreshToken, { httpOnly: true, secure: process.env.NODE_ENV === 'production', sameSite: 'strict', maxAge: 7 * 24 * 60 * 60 * 1000 });
    res.redirect(`${process.env.FRONTEND_URL}/auth/success?token=${accessToken}`);
  }
);

// Protected Routes
router.get('/me', requireAuth, authController.getMe);

module.exports = router;
