const { check, validationResult } = require('express-validator');

exports.validateCreateSession = [
  check('sessionName').notEmpty().withMessage('Session Name is required').trim(),
  check('sessionCode').notEmpty().withMessage('Session Code is required').trim(),
  check('startDate').isISO8601().toDate().withMessage('Valid Start Date is required'),
  check('endDate').isISO8601().toDate().withMessage('Valid End Date is required'),
  check('academicYear').notEmpty().withMessage('Academic Year is required').trim(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateUpdateSession = [
  check('sessionName').optional().trim().notEmpty().withMessage('Session Name cannot be empty'),
  check('sessionCode').optional().trim().notEmpty().withMessage('Session Code cannot be empty'),
  check('startDate').optional().isISO8601().toDate(),
  check('endDate').optional().isISO8601().toDate(),
  check('academicYear').optional().trim().notEmpty(),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
