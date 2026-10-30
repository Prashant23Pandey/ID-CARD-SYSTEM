const { check, validationResult } = require('express-validator');

exports.validateCreateSection = [
  check('sessionId').isMongoId().withMessage('Valid Session ID is required'),
  check('classId').isMongoId().withMessage('Valid Class ID is required'),
  check('sectionName').notEmpty().withMessage('Section Name is required').trim(),
  check('sectionCode').notEmpty().withMessage('Section Code is required').trim(),
  check('capacity').optional().isInt({ min: 1 }).withMessage('Capacity must be at least 1'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateUpdateSection = [
  check('sectionName').optional().trim().notEmpty().withMessage('Section Name cannot be empty'),
  check('sectionCode').optional().trim().notEmpty().withMessage('Section Code cannot be empty'),
  check('capacity').optional().isInt({ min: 1 }),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
