const { body, query } = require('express-validator');
const { ROLES } = require('../models/User');

const registerValidator = [
  body('name').trim().notEmpty().withMessage('Name is required').isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('username').trim().notEmpty().withMessage('Username is required').isLength({ min: 4, max: 50 }).withMessage('Username must be between 4 and 50 characters').matches(/^[a-zA-Z0-9_]+$/).withMessage('Username can only contain letters, numbers, and underscores'),
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
  body('mobile').trim().notEmpty().withMessage('Mobile is required').matches(/^[0-9]{10}$/).withMessage('Mobile must be exactly 10 digits'),
  body('password').notEmpty().withMessage('Password is required'),
  // Complex password validation is handled at the controller/service level using password.js utility
  body('role').notEmpty().withMessage('Role is required').isIn(Object.values(ROLES)).withMessage('Invalid role provided'),
  body('schoolId').optional().isMongoId().withMessage('Invalid schoolId format'),
];

const loginValidator = [
  body('identifier').trim().notEmpty().withMessage('Email or Username is required'),
  body('password').notEmpty().withMessage('Password is required'),
];

const forgotPasswordValidator = [
  body('email').trim().notEmpty().withMessage('Email is required').isEmail().withMessage('Must be a valid email address').normalizeEmail(),
];

const resetPasswordValidator = [
  body('token').trim().notEmpty().withMessage('Token is required'),
  body('newPassword').notEmpty().withMessage('New password is required'),
];

const verifyEmailValidator = [
  query('token').trim().notEmpty().withMessage('Verification token is required in query parameters'),
];

module.exports = {
  registerValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  verifyEmailValidator,
};
