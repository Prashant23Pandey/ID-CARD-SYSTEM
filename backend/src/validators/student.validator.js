const { body, query, param } = require('express-validator');
const { GENDER_TYPES, STATUS_TYPES, BLOOD_GROUPS } = require('../models/Student');

const validateStudentCreate = [
  body('admissionNumber')
    .notEmpty().withMessage('Admission number is required')
    .isString().withMessage('Admission number must be a string')
    .trim(),
  body('studentName')
    .notEmpty().withMessage('Student name is required')
    .isString().withMessage('Student name must be a string')
    .isLength({ max: 100 }).withMessage('Student name cannot exceed 100 characters')
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
  body('bloodGroup')
    .optional({ checkFalsy: true })
    .isIn(BLOOD_GROUPS).withMessage('Invalid blood group'),
  body('aadhaarNumber')
    .optional({ checkFalsy: true })
    .matches(/^[0-9]{12}$/).withMessage('Aadhaar number must be exactly 12 digits'),
  body('studentMobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{10,15}$/).withMessage('Invalid student mobile number'),
  body('fatherMobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{10,15}$/).withMessage('Invalid father mobile number'),
  body('motherMobile')
    .optional({ checkFalsy: true })
    .matches(/^[0-9+\-\s()]{10,15}$/).withMessage('Invalid mother mobile number'),
  body('email')
    .optional({ checkFalsy: true })
    .isEmail().withMessage('Invalid email address'),
  body('classId')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('Invalid Class ID'),
  body('sessionId')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('Invalid Session ID'),
  body('status')
    .optional({ checkFalsy: true })
    .isIn(STATUS_TYPES).withMessage('Invalid status type'),
];

const validateStudentUpdate = [
  ...validateStudentCreate.map(validation => validation.optional({ checkFalsy: true })),
];

const validateBulkPromote = [
  body('studentIds')
    .isArray({ min: 1 }).withMessage('Must provide an array of student IDs')
    .custom((arr) => arr.every(id => id.match(/^[0-9a-fA-F]{24}$/)))
    .withMessage('All student IDs must be valid Mongo IDs'),
  body('newSessionId')
    .notEmpty().withMessage('Target Session ID is required')
    .isMongoId().withMessage('Invalid Session ID'),
  body('newClassId')
    .optional({ checkFalsy: true })
    .isMongoId().withMessage('Invalid Class ID'),
];

const validateStudentQuery = [
  query('page').optional().isInt({ min: 1 }).withMessage('Page must be greater than 0'),
  query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  query('search').optional().isString().trim(),
  query('classId').optional().isMongoId().withMessage('Invalid Class ID'),
  query('sectionId').optional().isMongoId().withMessage('Invalid Section ID'),
  query('sessionId').optional().isMongoId().withMessage('Invalid Session ID'),
  query('gender').optional().isIn(GENDER_TYPES).withMessage('Invalid gender type'),
  query('status').optional().isIn(STATUS_TYPES).withMessage('Invalid status type'),
];

const validateStudentIdParam = [
  param('id').isMongoId().withMessage('Invalid Student ID format'),
];

module.exports = {
  validateStudentCreate,
  validateStudentUpdate,
  validateBulkPromote,
  validateStudentQuery,
  validateStudentIdParam,
};
