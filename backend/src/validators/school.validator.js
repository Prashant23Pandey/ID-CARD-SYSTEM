const { body, param, query } = require('express-validator');
const { SCHOOL_TYPES, BOARD_TYPES, STATUS, SUBSCRIPTION_PLANS } = require('../models/School');

// ─── Create School Validator ────────────────────────────────
const createSchoolValidator = [
  body('schoolName')
    .trim()
    .notEmpty()
    .withMessage('School name is required')
    .isLength({ min: 3, max: 200 })
    .withMessage('School name must be between 3 and 200 characters'),

  body('schoolShortName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Short name cannot exceed 50 characters'),

  body('schoolCode')
    .optional()
    .trim()
    .isAlphanumeric('en-US', { ignore: '-' })
    .withMessage('School code must contain only letters, numbers, and hyphens'),

  body('boardType')
    .notEmpty()
    .withMessage('Board type is required')
    .isIn(BOARD_TYPES)
    .withMessage(`Board type must be one of: ${BOARD_TYPES.join(', ')}`),

  body('schoolType')
    .notEmpty()
    .withMessage('School type is required')
    .isIn(SCHOOL_TYPES)
    .withMessage(`School type must be one of: ${SCHOOL_TYPES.join(', ')}`),

  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Registration number must be between 3 and 50 characters'),

  body('principalName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Principal name cannot exceed 100 characters'),

  body('email')
    .notEmpty()
    .withMessage('Email is required')
    .isEmail()
    .withMessage('Please provide a valid email address')
    .normalizeEmail(),

  body('phone')
    .notEmpty()
    .withMessage('Phone number is required')
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Please provide a valid phone number (10-15 digits)'),

  body('alternatePhone')
    .optional()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Alternate phone must be a valid number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL'),

  body('addressLine1')
    .notEmpty()
    .withMessage('Address Line 1 is required')
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('addressLine2')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('city')
    .notEmpty()
    .withMessage('City is required')
    .trim(),

  body('district')
    .optional()
    .trim(),

  body('state')
    .notEmpty()
    .withMessage('State is required')
    .trim(),

  body('country')
    .optional()
    .trim(),

  body('postalCode')
    .notEmpty()
    .withMessage('Postal code is required')
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Please provide a valid postal code (5-10 digits)'),

  body('establishedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Established year must be between 1800 and ${new Date().getFullYear()}`),

  body('studentCapacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Student capacity must be a non-negative number'),

  body('subscriptionPlan')
    .optional()
    .isIn(SUBSCRIPTION_PLANS)
    .withMessage(`Subscription plan must be one of: ${SUBSCRIPTION_PLANS.join(', ')}`),

  body('timezone')
    .optional()
    .trim(),

  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters'),
];

// ─── Update School Validator ────────────────────────────────
const updateSchoolValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid school ID'),

  body('schoolName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('School name must be between 3 and 200 characters'),

  body('schoolShortName')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Short name cannot exceed 50 characters'),

  body('boardType')
    .optional()
    .isIn(BOARD_TYPES)
    .withMessage(`Board type must be one of: ${BOARD_TYPES.join(', ')}`),

  body('schoolType')
    .optional()
    .isIn(SCHOOL_TYPES)
    .withMessage(`School type must be one of: ${SCHOOL_TYPES.join(', ')}`),

  body('registrationNumber')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Registration number must be between 3 and 50 characters'),

  body('principalName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Principal name cannot exceed 100 characters'),

  body('email')
    .optional()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),

  body('phone')
    .optional()
    .matches(/^[0-9+\-\s()]{10,15}$/)
    .withMessage('Please provide a valid phone number'),

  body('website')
    .optional()
    .trim()
    .isURL()
    .withMessage('Please provide a valid URL'),

  body('addressLine1')
    .optional()
    .isLength({ max: 200 })
    .withMessage('Address cannot exceed 200 characters'),

  body('city')
    .optional()
    .trim(),

  body('state')
    .optional()
    .trim(),

  body('postalCode')
    .optional()
    .matches(/^[0-9]{5,10}$/)
    .withMessage('Please provide a valid postal code'),

  body('establishedYear')
    .optional()
    .isInt({ min: 1800, max: new Date().getFullYear() })
    .withMessage(`Established year must be between 1800 and ${new Date().getFullYear()}`),

  body('studentCapacity')
    .optional()
    .isInt({ min: 0 })
    .withMessage('Student capacity must be a non-negative number'),

  body('subscriptionPlan')
    .optional()
    .isIn(SUBSCRIPTION_PLANS)
    .withMessage(`Subscription plan must be one of: ${SUBSCRIPTION_PLANS.join(', ')}`),

  body('timezone')
    .optional()
    .trim(),

  body('language')
    .optional()
    .trim()
    .isLength({ min: 2, max: 5 })
    .withMessage('Language code must be 2-5 characters'),
];

// ─── School ID Validator ────────────────────────────────────
const schoolIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid school ID format'),
];

// ─── Update Status Validator ────────────────────────────────
const updateStatusValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid school ID'),
  body('status')
    .notEmpty()
    .withMessage('Status is required')
    .isIn(STATUS)
    .withMessage(`Status must be one of: ${STATUS.join(', ')}`),
];

// ─── Assign Admin Validator ─────────────────────────────────
const assignAdminValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid school ID'),
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isMongoId()
    .withMessage('Invalid user ID format'),
];

// ─── Search Validator ───────────────────────────────────────
const searchValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  query('sortBy')
    .optional()
    .isIn(['schoolName', 'schoolCode', 'createdAt', 'status', 'city', 'state', 'subscriptionPlan'])
    .withMessage('Invalid sort field'),
  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
  query('status')
    .optional()
    .isIn(STATUS)
    .withMessage(`Status must be one of: ${STATUS.join(', ')}`),
  query('boardType')
    .optional()
    .isIn(BOARD_TYPES)
    .withMessage(`Board type must be one of: ${BOARD_TYPES.join(', ')}`),
  query('schoolType')
    .optional()
    .isIn(SCHOOL_TYPES)
    .withMessage(`School type must be one of: ${SCHOOL_TYPES.join(', ')}`),
  query('subscriptionPlan')
    .optional()
    .isIn(SUBSCRIPTION_PLANS)
    .withMessage(`Subscription plan must be one of: ${SUBSCRIPTION_PLANS.join(', ')}`),
];

module.exports = {
  createSchoolValidator,
  updateSchoolValidator,
  schoolIdValidator,
  updateStatusValidator,
  assignAdminValidator,
  searchValidator,
};
