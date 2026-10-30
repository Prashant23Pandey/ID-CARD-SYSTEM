const { body, param, query, validationResult } = require('express-validator');
const Session = require('../models/Session');
const mongoose = require('mongoose');

/**
 * Validation middleware for creating a new session
 */
const validateCreateSession = [
  body('sessionName')
    .trim()
    .notEmpty()
    .withMessage('Session name is required')
    .isLength({ min: 3, max: 50 })
    .withMessage('Session name must be between 3 and 50 characters'),

  body('sessionCode')
    .trim()
    .notEmpty()
    .withMessage('Session code is required')
    .isLength({ min: 2, max: 20 })
    .withMessage('Session code must be between 2 and 20 characters')
    .matches(/^[A-Z0-9-]+$/)
    .withMessage('Session code must contain only uppercase letters, numbers, and hyphens'),

  body('academicYear')
    .trim()
    .notEmpty()
    .withMessage('Academic year is required')
    .matches(/^\d{4}-\d{2}$|^\d{4}$/)
    .withMessage('Academic year must be in format YYYY-YY or YYYY (e.g., 2024-25 or 2024)'),

  body('startDate')
    .notEmpty()
    .withMessage('Start date is required')
    .isISO8601()
    .withMessage('Start date must be a valid date')
    .custom((value) => {
      if (new Date(value) < new Date()) {
        // Allow past dates for flexibility
      }
      return true;
    }),

  body('endDate')
    .notEmpty()
    .withMessage('End date is required')
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

/**
 * Validation middleware for updating a session
 */
const validateUpdateSession = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),

  body('sessionName')
    .optional()
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage('Session name must be between 3 and 50 characters'),

  body('startDate')
    .optional()
    .isISO8601()
    .withMessage('Start date must be a valid date'),

  body('endDate')
    .optional()
    .isISO8601()
    .withMessage('End date must be a valid date')
    .custom((value, { req }) => {
      if (req.body.startDate && new Date(value) <= new Date(req.body.startDate)) {
        throw new Error('End date must be after start date');
      }
      return true;
    }),

  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must not exceed 500 characters'),
];

/**
 * Validation middleware for activating a session
 */
const validateActivateSession = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),
];

/**
 * Validation middleware for archiving a session
 */
const validateArchiveSession = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),

  body('archiveReason')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Archive reason must not exceed 500 characters'),
];

/**
 * Validation middleware for deleting a session
 */
const validateDeleteSession = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),
];

/**
 * Validation middleware for fetching sessions
 */
const validateGetSessions = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),

  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),

  query('status')
    .optional()
    .isIn(['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'])
    .withMessage('Invalid status value'),

  query('sortBy')
    .optional()
    .isIn(['sessionName', 'startDate', 'endDate', 'createdAt'])
    .withMessage('Invalid sortBy parameter'),

  query('sortOrder')
    .optional()
    .isIn(['asc', 'desc'])
    .withMessage('Sort order must be asc or desc'),

  query('search')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Search term must not exceed 100 characters'),

  query('academicYear')
    .optional()
    .trim(),

  query('isArchived')
    .optional()
    .isIn(['true', 'false'])
    .withMessage('isArchived must be true or false'),
];

/**
 * Validation middleware for fetching a single session
 */
const validateGetSessionById = [
  param('id')
    .custom((value) => mongoose.Types.ObjectId.isValid(value))
    .withMessage('Invalid session ID'),
];

/**
 * Custom validation to check for overlapping sessions
 */
const validateNoOverlapSessions = [
  body().custom(async (value, { req }) => {
    const { schoolId } = req.user;
    const { startDate, endDate } = req.body;
    const sessionId = req.params?.id;

    if (!startDate || !endDate) return true;

    const query = {
      schoolId,
      deletedAt: null,
      $or: [
        {
          startDate: { $lt: new Date(endDate) },
          endDate: { $gt: new Date(startDate) },
        },
      ],
    };

    if (sessionId) {
      query._id = { $ne: sessionId };
    }

    const overlappingSessions = await Session.findOne(query);
    if (overlappingSessions) {
      throw new Error('Session dates overlap with an existing session');
    }

    return true;
  }),
];

/**
 * Custom validation to ensure unique session code per school
 */
const validateUniqueSessionCode = [
  body('sessionCode').custom(async (value, { req }) => {
    const { schoolId } = req.user;
    const sessionId = req.params?.id;

    const query = {
      schoolId,
      sessionCode: value.toUpperCase(),
      deletedAt: null,
    };

    if (sessionId) {
      query._id = { $ne: sessionId };
    }

    const existing = await Session.findOne(query);
    if (existing) {
      throw new Error('Session code already exists for this school');
    }

    return true;
  }),
];

/**
 * Custom validation to prevent modification of archived sessions
 */
const validateNotArchivedSession = [
  param('id').custom(async (value, { req }) => {
    const { schoolId } = req.user;
    const session = await Session.findOne({
      _id: value,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.isArchived) {
      throw new Error('Cannot modify archived session');
    }

    return true;
  }),
];

/**
 * Custom validation to prevent deletion of active session
 */
const validateNotActiveSession = [
  param('id').custom(async (value, { req }) => {
    const { schoolId } = req.user;
    const session = await Session.findOne({
      _id: value,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.isActive) {
      throw new Error('Cannot delete an active session. Deactivate it first.');
    }

    return true;
  }),
];

module.exports = {
  validateCreateSession,
  validateUpdateSession,
  validateActivateSession,
  validateArchiveSession,
  validateDeleteSession,
  validateGetSessions,
  validateGetSessionById,
  validateNoOverlapSessions,
  validateUniqueSessionCode,
  validateNotArchivedSession,
  validateNotActiveSession,
};