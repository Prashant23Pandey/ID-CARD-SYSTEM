const { body, param } = require('express-validator');
const { ROLES, STATUS } = require('../models/User');

const userIdValidator = [
  param('id').isMongoId().withMessage('Invalid User ID format'),
];

const updateUserValidator = [
  param('id').isMongoId().withMessage('Invalid User ID format'),
  body('name').optional().trim().isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  body('mobile').optional().trim().matches(/^[0-9]{10}$/).withMessage('Mobile must be exactly 10 digits'),
  body('role').optional().isIn(Object.values(ROLES)).withMessage('Invalid role provided'),
  body('schoolId').optional().isMongoId().withMessage('Invalid schoolId format'),
  body('profilePhoto').optional().isString().withMessage('Profile photo must be a valid string URL'),
];

const updateStatusValidator = [
  body('userId').isMongoId().withMessage('Invalid User ID format'),
  body('status').notEmpty().withMessage('Status is required').isIn(Object.values(STATUS)).withMessage('Invalid status provided'),
];

module.exports = {
  userIdValidator,
  updateUserValidator,
  updateStatusValidator,
};
