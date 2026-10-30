const { check, validationResult } = require('express-validator');

exports.validateStudentPromotion = [
  check('studentId').isMongoId().withMessage('Valid Student ID is required'),
  check('previousSessionId').isMongoId().withMessage('Valid Previous Session ID is required'),
  check('nextSessionId').isMongoId().withMessage('Valid Next Session ID is required'),
  check('previousClassId').isMongoId().withMessage('Valid Previous Class ID is required'),
  check('nextClassId').isMongoId().withMessage('Valid Next Class ID is required'),
  check('promotionStatus').isIn(['PROMOTED', 'DETAINED', 'GRADUATED']).withMessage('Invalid promotion status'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];

exports.validateBatchPromotion = [
  check('previousSessionId').isMongoId().withMessage('Valid Previous Session ID is required'),
  check('nextSessionId').isMongoId().withMessage('Valid Next Session ID is required'),
  check('students').isArray({ min: 1 }).withMessage('Students array is required and must not be empty'),
  check('students.*.studentId').isMongoId().withMessage('Valid Student ID is required in array'),
  check('students.*.nextClassId').isMongoId().withMessage('Valid Next Class ID is required in array'),
  check('students.*.promotionStatus').isIn(['PROMOTED', 'DETAINED', 'GRADUATED']),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }
    next();
  },
];
