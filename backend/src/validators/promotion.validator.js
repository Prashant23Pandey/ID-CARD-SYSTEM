const { body, param, query } = require('express-validator');
const mongoose = require('mongoose');
const Session = require('../models/Session');
const PromotionHistory = require('../models/PromotionHistory');

/**
 * Validation middleware for promoting a single student
 */
const validatePromoteStudent = [
  body('studentId')
    .notEmpty()
    .withMessage('Student ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid student ID'),

  body('fromSessionId')
    .notEmpty()
    .withMessage('From session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from session ID'),

  body('toSessionId')
    .notEmpty()
    .withMessage('To session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to session ID')
    .custom((value, { req }) => {
      if (value === req.body.fromSessionId) {
        throw new Error('From session and to session cannot be the same');
      }
      return true;
    }),

  body('fromClassId')
    .notEmpty()
    .withMessage('From class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from class ID'),

  body('toClassId')
    .notEmpty()
    .withMessage('To class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to class ID'),

  body('fromSectionId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid from section ID');
      }
      return true;
    }),

  body('toSectionId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid to section ID');
      }
      return true;
    }),

  body('promotionStatus')
    .notEmpty()
    .withMessage('Promotion status is required')
    .isIn(['PROMOTED', 'DETAINED', 'GRADUATED', 'TRANSFERRED'])
    .withMessage('Invalid promotion status'),

  body('remarks')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Remarks must not exceed 500 characters'),

  body('performanceMetrics')
    .optional()
    .custom((value) => {
      if (value && typeof value !== 'object') {
        throw new Error('Performance metrics must be an object');
      }
      if (value?.attendancePercentage !== undefined) {
        if (typeof value.attendancePercentage !== 'number' || value.attendancePercentage < 0 || value.attendancePercentage > 100) {
          throw new Error('Attendance percentage must be between 0 and 100');
        }
      }
      if (value?.academicPerformance) {
        if (!['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR'].includes(value.academicPerformance)) {
          throw new Error('Invalid academic performance value');
        }
      }
      if (value?.conductRating) {
        if (!['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_IMPROVEMENT'].includes(value.conductRating)) {
          throw new Error('Invalid conduct rating value');
        }
      }
      return true;
    }),
];

/**
 * Validation middleware for bulk promoting students
 */
const validateBulkPromoteStudents = [
  body('fromSessionId')
    .notEmpty()
    .withMessage('From session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from session ID'),

  body('toSessionId')
    .notEmpty()
    .withMessage('To session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to session ID')
    .custom((value, { req }) => {
      if (value === req.body.fromSessionId) {
        throw new Error('From session and to session cannot be the same');
      }
      return true;
    }),

  body('promotions')
    .notEmpty()
    .withMessage('Promotions array is required')
    .isArray({ min: 1 })
    .withMessage('Promotions must be an array with at least one item')
    .custom((value) => {
      if (value.length > 1000) {
        throw new Error('Cannot promote more than 1000 students at once');
      }
      return true;
    }),

  body('promotions.*.studentId')
    .notEmpty()
    .withMessage('Student ID is required for each promotion')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid student ID'),

  body('promotions.*.fromClassId')
    .notEmpty()
    .withMessage('From class ID is required for each promotion')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from class ID'),

  body('promotions.*.toClassId')
    .notEmpty()
    .withMessage('To class ID is required for each promotion')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to class ID'),

  body('promotions.*.promotionStatus')
    .notEmpty()
    .withMessage('Promotion status is required for each promotion')
    .isIn(['PROMOTED', 'DETAINED', 'GRADUATED', 'TRANSFERRED'])
    .withMessage('Invalid promotion status'),

  body('promotions.*.fromSectionId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid from section ID');
      }
      return true;
    }),

  body('promotions.*.toSectionId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid to section ID');
      }
      return true;
    }),
];

/**
 * Validation middleware for bulk promoting by class
 */
const validateBulkPromoteClass = [
  body('fromSessionId')
    .notEmpty()
    .withMessage('From session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from session ID'),

  body('toSessionId')
    .notEmpty()
    .withMessage('To session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to session ID'),

  body('fromClassId')
    .notEmpty()
    .withMessage('From class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from class ID'),

  body('toClassId')
    .notEmpty()
    .withMessage('To class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to class ID'),

  body('fromSectionId')
    .optional()
    .custom((value) => {
      if (value && !mongoose.Types.ObjectId.isValid(value)) {
        throw new Error('Invalid from section ID');
      }
      return true;
    }),

  body('promotionStatus')
    .optional()
    .isIn(['PROMOTED', 'DETAINED'])
    .withMessage('Invalid promotion status'),
];

/**
 * Validation middleware for promoting entire school
 */
const validateBulkPromoteSchool = [
  body('fromSessionId')
    .notEmpty()
    .withMessage('From session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from session ID'),

  body('toSessionId')
    .notEmpty()
    .withMessage('To session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to session ID'),

  body('classPromotionMap')
    .notEmpty()
    .withMessage('Class promotion map is required')
    .isArray({ min: 1 })
    .withMessage('Class promotion map must be an array'),

  body('classPromotionMap.*.fromClassId')
    .notEmpty()
    .withMessage('From class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from class ID'),

  body('classPromotionMap.*.toClassId')
    .notEmpty()
    .withMessage('To class ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to class ID'),
];

/**
 * Validation middleware for getting promotion history
 */
const validateGetPromotionHistory = [
  query('studentId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid student ID'),

  query('sessionId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),

  query('promotionStatus')
    .optional()
    .isIn(['PROMOTED', 'DETAINED', 'GRADUATED', 'TRANSFERRED'])
    .withMessage('Invalid promotion status'),

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
    .isIn(['promotionDate', 'studentName', 'createdAt'])
    .withMessage('Invalid sortBy parameter'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),
];

/**
 * Validation middleware for getting promotion report
 */
const validateGetPromotionReport = [
  query('sessionId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),

  query('classId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid class ID'),

  query('reportType')
    .optional()
    .isIn(['SUMMARY', 'DETAILED', 'BY_CLASS', 'BY_SECTION', 'BY_STATUS'])
    .withMessage('Invalid report type'),
];

/**
 * Validation middleware for rollback promotion
 */
const validateRollbackPromotion = [
  param('id')
    .notEmpty()
    .withMessage('Promotion history ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid promotion history ID'),

  body('reason')
    .notEmpty()
    .withMessage('Rollback reason is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
];

/**
 * Validation middleware for rollback batch promotion
 */
const validateRollbackBatchPromotion = [
  body('batchPromotionId')
    .notEmpty()
    .withMessage('Batch promotion ID is required')
    .trim(),

  body('reason')
    .notEmpty()
    .withMessage('Rollback reason is required')
    .trim()
    .isLength({ min: 5, max: 500 })
    .withMessage('Reason must be between 5 and 500 characters'),
];

/**
 * Validation middleware for getting promotion preview
 */
const validateGetPromotionPreview = [
  query('fromSessionId')
    .notEmpty()
    .withMessage('From session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid from session ID'),

  query('toSessionId')
    .notEmpty()
    .withMessage('To session ID is required')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid to session ID'),

  query('classId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid class ID'),

  query('sectionId')
    .optional()
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid section ID'),
];

module.exports = {
  validatePromoteStudent,
  validateBulkPromoteStudents,
  validateBulkPromoteClass,
  validateBulkPromoteSchool,
  validateGetPromotionHistory,
  validateGetPromotionReport,
  validateRollbackPromotion,
  validateRollbackBatchPromotion,
  validateGetPromotionPreview,
};