const { check, validationResult } = require('express-validator');

exports.validateCreateClass = [
  check('sessionId').isMongoId().withMessage('Valid Session ID is required'),
  check('className').notEmpty().withMessage('Class Name is required').trim(),
  check('classCode').notEmpty().withMessage('Class Code is required').trim(),
  check('classNumericValue').isNumeric().withMessage('Numeric value is required for sorting'),
  check('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateUpdateClass = [
  check('className').optional().trim().notEmpty().withMessage('Class Name cannot be empty'),
  check('classCode').optional().trim().notEmpty().withMessage('Class Code cannot be empty'),
  check('classNumericValue').optional().isNumeric(),
  check('capacity').optional().isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateAssignTeacher = [
  check('teacherId').isMongoId().withMessage('Valid Teacher ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
