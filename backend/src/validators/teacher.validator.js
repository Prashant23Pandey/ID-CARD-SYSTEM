const { body, query, param } = require('express-validator');
const { GENDER_TYPES, STATUS_TYPES, DESIGNATION_TYPES } = require('../models/Teacher');

const validateTeacherCreate = [
  body('employeeId')
    .notEmpty().withMessage('Employee ID is required')
    .isString().withMessage('Employee ID must be a string')
    .trim(),
  body('teacherCode')
    .notEmpty().withMessage('Teacher Code is required')
    .isString().withMessage('Teacher Code must be a string')
    .trim(),
  body('fullName')
    .notEmpty().withMessage('Full Name is required')
    .isString().withMessage('Full Name must be a string')
    .isLength({ max: 100 }).withMessage('Full Name cannot exceed 100 characters')
    .trim(),
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(GENDER_TYPES).withMessage('Invalid gender type'),
  body('dateOfBirth')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      if (new Date(value) > new Date()) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  body('email')
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('mobile')
    .notEmpty().withMessage('Mobile number is required')
    .matches(/^[0-9+\-\s()]{10,15}$/).withMessage('Invalid mobile number'),
  body('alternateMobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{10,15}$/).withMessage('Invalid alternate mobile number'),
  body('aadhaarNumber')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{12}$/).withMessage('Aadhaar number must be exactly 12 digits'),
  body('panNumber')
    .optional({ checkFalsy: true })
    .matches(/[A-Z]{5}[0-9]{4}[A-Z]{1}/).withMessage('Invalid PAN format'),
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isString(),
  body('qualification')
    .optional({ checkFalsy: true })
    .isString(),
  body('designation')
    .optional({ checkFalsy: true })
    .isIn(DESIGNATION_TYPES).withMessage('Invalid designation type'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(STATUS_TYPES).withMessage('Invalid status type'),
];

const validateTeacherUpdate = [
  ...validateTeacherCreate.map(validation => validation.optional({ checkFalsy: true })),
];

const validateTeacherQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('status').optional().isIn(STATUS_TYPES).withMessage('Invalid status type'),
  query('designation').optional().isIn(DESIGNATION_TYPES).withMessage('Invalid designation type'),
  query('department').optional().isString().trim(),
];

const validateTeacherIdParam = [
  param('id').isMongoId().withMessage('Invalid Teacher ID format'),
];

const validateClassAssignment = [
  body('classId')
    .notEmpty().withMessage('Class ID is required')
    .isMongoId().withMessage('Invalid Class ID format'),
];

const validatePasswordReset = [
  body('newPassword')
    .notEmpty().withMessage('New Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
];

module.exports = {
  validateTeacherCreate,
  validateTeacherUpdate,
  validateTeacherQuery,
  validateTeacherIdParam,
  validateClassAssignment,
  validatePasswordReset,
};
