const express = require('express');
const { requireAuth } = require('../middlewares/auth.middleware');
const { requireRole } = require('../middlewares/role.middleware');
const { ROLES } = require('../models/User');
const validateRequest = require('../middlewares/validation.middleware');
const {
  validateCreateTemplate,
  validateUpdateTemplate,
  validateTemplateId,
  validatePublishArchive,
  validateDuplicate,
  validateRestoreVersion,
  validateVersionHistoryQuery,
  validateCompareVersions,
  validateTemplateListQuery,
} = require('../validators/template.validator');
const {
  createTemplate,
  getTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  publishArchiveTemplate,
  duplicateTemplate,
  getVersionHistory,
  compareVersions,
  restoreVersion,
  importTemplate,
  exportTemplate,
  previewTemplate,
} = require('../controllers/template.controller');

const router = express.Router();

router.use(requireAuth);
router.use(requireRole(ROLES.SUPERADMIN, ROLES.SCHOOLADMIN));

router.post('/', validateCreateTemplate, validateRequest, createTemplate);
router.get('/', validateTemplateListQuery, validateRequest, getTemplates);
router.patch('/publish', validatePublishArchive, validateRequest, publishArchiveTemplate);
router.patch('/archive', validatePublishArchive, validateRequest, publishArchiveTemplate);
router.post('/duplicate', validateDuplicate, validateRequest, duplicateTemplate);
router.get('/version-history', validateVersionHistoryQuery, validateRequest, getVersionHistory);
router.get('/compare-versions', validateCompareVersions, validateRequest, compareVersions);
router.post('/restore-version', validateRestoreVersion, validateRequest, restoreVersion);
router.post('/import', validateCreateTemplate, validateRequest, importTemplate);
router.get('/export', exportTemplate);
router.get('/:id', validateTemplateId, validateRequest, getTemplateById);
router.put('/:id', [...validateTemplateId, ...validateUpdateTemplate], validateRequest, updateTemplate);
router.delete('/:id', validateTemplateId, validateRequest, deleteTemplate);
router.post('/:id/preview', validateTemplateId, validateRequest, previewTemplate);

module.exports = router;
