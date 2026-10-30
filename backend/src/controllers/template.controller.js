const { validationResult } = require('express-validator');
const templateService = require('../services/template.service');
const { walkBind, DYNAMIC_FIELDS } = require('../services/template.binding.service');

const reqMeta = (req) => ({ ip: req.ip, userAgent: req.get('user-agent') || null });

const throwValidation = (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400).json({ success: false, message: 'Validation failed', errors: errors.array() });
    return true;
  }
  return false;
};

const createTemplate = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.createTemplate(req.body, req.user, reqMeta(req));
    res.status(201).json({ success: true, data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to create template' });
  }
};

const getTemplates = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.getTemplates(req.user.schoolId, req.query);
    res.status(200).json({ success: true, ...data });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch templates' });
  }
};

const getTemplateById = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.getById(req.params.id, req.user.schoolId);
    if (!data) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch template' });
  }
};

const updateTemplate = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.updateTemplate(req.params.id, req.body, req.user, reqMeta(req));
    if (!data) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update template' });
  }
};

const deleteTemplate = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.deleteTemplate(req.params.id, req.user, reqMeta(req));
    if (!data) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(200).json({ success: true, message: 'Template deleted successfully' });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to delete template' });
  }
};

const publishArchiveTemplate = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.updateStatus(req.body.id, req.body.status, req.user, reqMeta(req));
    if (!data) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to update status' });
  }
};

const duplicateTemplate = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.duplicateTemplate(req.body.id, req.body, req.user, reqMeta(req));
    if (!data) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to duplicate template' });
  }
};

const getVersionHistory = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.getVersionHistory(req.user.schoolId, req.query.templateId, req.query.page, req.query.limit);
    return res.status(200).json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to fetch version history' });
  }
};

const compareVersions = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.compareVersions(
      req.user.schoolId,
      req.query.templateId,
      req.query.fromVersion,
      req.query.toVersion
    );
    if (!data) return res.status(404).json({ success: false, message: 'Version pair not found' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to compare versions' });
  }
};

const restoreVersion = async (req, res) => {
  try {
    if (throwValidation(req, res)) return;
    const data = await templateService.restoreVersion(req.user.schoolId, req.body.templateId, req.body.version, req.user, reqMeta(req));
    if (!data) return res.status(404).json({ success: false, message: 'Version or template not found' });
    return res.status(200).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Failed to restore version' });
  }
};

const importTemplate = async (req, res) => {
  try {
    const data = await templateService.createTemplate(req.body, req.user, reqMeta(req));
    return res.status(201).json({ success: true, data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Import failed' });
  }
};

const exportTemplate = async (req, res) => {
  try {
    const template = await templateService.getById(req.query.id, req.user.schoolId);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    return res.status(200).json({ success: true, data: template });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Export failed' });
  }
};

const previewTemplate = async (req, res) => {
  try {
    const template = await templateService.getById(req.params.id, req.user.schoolId);
    if (!template) return res.status(404).json({ success: false, message: 'Template not found' });
    const payload = req.body?.data || {};
    const boundFront = walkBind(template.templateJson.front, payload);
    const boundBack = template.templateJson.back ? walkBind(template.templateJson.back, payload) : null;
    return res.status(200).json({
      success: true,
      data: {
        templateId: template._id,
        front: boundFront,
        back: boundBack,
        supportedDynamicFields: DYNAMIC_FIELDS,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message || 'Preview failed' });
  }
};

module.exports = {
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
};
