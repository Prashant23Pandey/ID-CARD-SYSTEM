const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const logger = require('./logger');

const TOKEN_TYPES = {
  ACCESS: 'access',
  REFRESH: 'refresh',
  EMAIL_VERIFY: 'email_verify',
  PASSWORD_RESET: 'password_reset',
};

const getSecretAndExpiry = (tokenType) => {
  switch (tokenType) {
    case TOKEN_TYPES.ACCESS:
      return {
        secret: process.env.JWT_ACCESS_SECRET,
        expiry: process.env.JWT_ACCESS_EXPIRY || '15m',
      };
    case TOKEN_TYPES.REFRESH:
      return {
        secret: process.env.JWT_REFRESH_SECRET,
        expiry: process.env.JWT_REFRESH_EXPIRY || '7d',
      };
    case TOKEN_TYPES.EMAIL_VERIFY:
      return {
        secret: process.env.JWT_EMAIL_VERIFY_SECRET,
        expiry: process.env.JWT_EMAIL_VERIFY_EXPIRY || '24h',
      };
    case TOKEN_TYPES.PASSWORD_RESET:
      return {
        secret: process.env.JWT_PASSWORD_RESET_SECRET,
        expiry: process.env.JWT_PASSWORD_RESET_EXPIRY || '1h',
      };
    default:
      throw new Error(`Unknown token type: ${tokenType}`);
  }
};

const generateToken = (payload, tokenType) => {
  const { secret, expiry } = getSecretAndExpiry(tokenType);

  const tokenPayload = {
    ...payload,
    type: tokenType,
    jti: crypto.randomUUID(),
  };

  return jwt.sign(tokenPayload, secret, {
    expiresIn: expiry,
    issuer: 'multischool-idcard',
    audience: 'multischool-idcard-client',
  });
};

const verifyToken = (token, tokenType) => {
  const { secret } = getSecretAndExpiry(tokenType);

  try {
    const decoded = jwt.verify(token, secret, {
      issuer: 'multischool-idcard',
      audience: 'multischool-idcard-client',
    });

    if (decoded.type !== tokenType) {
      throw new Error(`Invalid token type. Expected ${tokenType}, got ${decoded.type}`);
    }

    return { valid: true, decoded };
  } catch (error) {
    logger.warn('Token verification failed:', {
      type: tokenType,
      error: error.message,
    });

    return {
      valid: false,
      error: getTokenErrorMessage(error),
      code: getTokenErrorCode(error),
    };
  }
};

const decodeToken = (token) => {
  try {
    return jwt.decode(token, { complete: true });
  } catch (error) {
    return null;
  }
};

const generateAccessToken = (user) => {
  return generateToken(
    {
      sub: user._id.toString(),
      email: user.email,
      role: user.role,
      schoolId: user.schoolId ? user.schoolId.toString() : null,
    },
    TOKEN_TYPES.ACCESS
  );
};

const generateRefreshToken = (user) => {
  return generateToken(
    {
      sub: user._id.toString(),
    },
    TOKEN_TYPES.REFRESH
  );
};

const generateEmailVerifyToken = (user) => {
  return generateToken(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    TOKEN_TYPES.EMAIL_VERIFY
  );
};

const generatePasswordResetToken = (user) => {
  return generateToken(
    {
      sub: user._id.toString(),
      email: user.email,
    },
    TOKEN_TYPES.PASSWORD_RESET
  );
};

const generateTokenPair = (user) => {
  return {
    accessToken: generateAccessToken(user),
    refreshToken: generateRefreshToken(user),
  };
};

const getTokenErrorMessage = (error) => {
  if (error.name === 'TokenExpiredError') {
    return 'Token has expired';
  }
  if (error.name === 'JsonWebTokenError') {
    return 'Invalid token';
  }
  if (error.name === 'NotBeforeError') {
    return 'Token is not yet active';
  }
  return error.message || 'Token verification failed';
};

const getTokenErrorCode = (error) => {
  if (error.name === 'TokenExpiredError') return 'TOKEN_EXPIRED';
  if (error.name === 'JsonWebTokenError') return 'TOKEN_INVALID';
  if (error.name === 'NotBeforeError') return 'TOKEN_NOT_ACTIVE';
  return 'TOKEN_ERROR';
};

module.exports = {
  TOKEN_TYPES,
  generateToken,
  verifyToken,
  decodeToken,
  generateAccessToken,
  generateRefreshToken,
  generateEmailVerifyToken,
  generatePasswordResetToken,
  generateTokenPair,
};
