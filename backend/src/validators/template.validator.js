const { body, param, query } = require('express-validator');
const { TEMPLATE_TYPES, ORIENTATIONS } = require('../models/Template');

const TEMPLATE_STATUSES = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED'];

const validateCreateTemplate = [
  body('templateName').isString().trim().isLength({ min: 3, max: 120 }),
  body('templateCode').isString().trim().isLength({ min: 3, max: 60 }),
  body('templateType').isIn(TEMPLATE_TYPES),
  body('canvasWidth').isFloat({ min: 100, max: 5000 }),
  body('canvasHeight').isFloat({ min: 100, max: 5000 }),
  body('orientation').isIn(ORIENTATIONS),
  body('templateJson.front').notEmpty().withMessage('Front template JSON is required'),
  body('templateJson.back').optional({ nullable: true }),
  body('backgroundImage').optional({ nullable: true }).isString(),
];

const validateUpdateTemplate = [
  body('templateName').optional().isString().trim().isLength({ min: 3, max: 120 }),
  body('templateCode').optional().isString().trim().isLength({ min: 3, max: 60 }),
  body('templateType').optional().isIn(TEMPLATE_TYPES),
  body('canvasWidth').optional().isFloat({ min: 100, max: 5000 }),
  body('canvasHeight').optional().isFloat({ min: 100, max: 5000 }),
  body('orientation').optional().isIn(ORIENTATIONS),
  body('templateJson.front').optional(),
  body('templateJson.back').optional({ nullable: true }),
  body('previewImage.front').optional({ nullable: true }).isString(),
  body('previewImage.back').optional({ nullable: true }).isString(),
];

const validateTemplateId = [param('id').isMongoId().withMessage('Invalid template id')];

const validatePublishArchive = [
  body('id').isMongoId(),
  body('status').isIn(['PUBLISHED', 'ARCHIVED']),
];

const validateDuplicate = [
  body('id').isMongoId(),
  body('templateName').optional().isString().trim().isLength({ min: 3, max: 120 }),
  body('templateCode').optional().isString().trim().isLength({ min: 3, max: 60 }),
];

const validateRestoreVersion = [
  body('templateId').isMongoId(),
  body('version').isInt({ min: 1 }),
];

const validateVersionHistoryQuery = [
  query('templateId').isMongoId(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

const validateCompareVersions = [
  query('templateId').isMongoId(),
  query('fromVersion').isInt({ min: 1 }),
  query('toVersion').isInt({ min: 1 }),
];

const validateTemplateListQuery = [
  query('templateType').optional().isIn(TEMPLATE_TYPES),
  query('status').optional().isIn(TEMPLATE_STATUSES),
  query('search').optional().isString().trim(),
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
];

module.exports = {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateTemplateId,
  validatePublishArchive,
  validateDuplicate,
  validateRestoreVersion,
  validateVersionHistoryQuery,
  validateCompareVersions,
  validateTemplateListQuery,
};
