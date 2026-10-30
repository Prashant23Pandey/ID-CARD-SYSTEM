const crypto = require('crypto');
const { Template } = require('../models/Template');
const { TemplateVersion } = require('../models/TemplateVersion');
const { TemplateAuditLog } = require('../models/TemplateAuditLog');

class TemplateService {
  async writeAudit(templateId, schoolId, actorId, action, reqMeta = {}, previousData = null, newData = null) {
    return TemplateAuditLog.create({
      templateId,
      schoolId,
      actorId,
      action,
      previousData,
      newData,
      ipAddress: reqMeta.ip,
      userAgent: reqMeta.userAgent,
    });
  }

  async createVersion(template, actorId, changeSummary) {
    return TemplateVersion.create({
      templateId: template._id,
      schoolId: template.schoolId,
      version: template.version,
      snapshot: template.toObject(),
      changedBy: actorId,
      changeSummary,
    });
  }

  normalizeCode(code) {
    return String(code).trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '_');
  }

  async createTemplate(payload, user, reqMeta) {
    const schoolId = user.schoolId || payload.schoolId;
    if (!schoolId) {
      throw new Error('schoolId is required for template creation');
    }
    const templateCode = this.normalizeCode(payload.templateCode || crypto.randomUUID().slice(0, 8));
    const template = await Template.create({
      ...payload,
      templateCode,
      schoolId,
      createdBy: user._id,
      updatedBy: user._id,
    });

    await this.createVersion(template, user._id, 'Initial template creation');
    await this.writeAudit(template._id, template.schoolId, user._id, 'CREATE', reqMeta, null, template);
    return template;
  }

  async getTemplates(schoolId, query) {
    const scopedSchoolId = schoolId || query.schoolId;
    if (!scopedSchoolId) {
      throw new Error('schoolId is required to fetch templates');
    }
    const { page = 1, limit = 20, search, templateType, status } = query;
    const filter = { schoolId: scopedSchoolId };
    if (templateType) filter.templateType = templateType;
    if (status) filter.status = status;
    if (search) {
      filter.$or = [
        { templateName: { $regex: search, $options: 'i' } },
        { templateCode: { $regex: search, $options: 'i' } },
      ];
    }

    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      Template.find(filter).sort({ updatedAt: -1 }).skip(skip).limit(Number(limit)),
      Template.countDocuments(filter),
    ]);

    return {
      data,
      page: Number(page),
      limit: Number(limit),
      total,
      totalPages: Math.ceil(total / Number(limit)),
    };
  }

  async getById(id, schoolId) {
    return Template.findOne({ _id: id, schoolId });
  }

  async updateTemplate(id, payload, user, reqMeta) {
    const existing = await this.getById(id, user.schoolId);
    if (!existing) return null;

    const previous = existing.toObject();
    if (payload.templateCode) payload.templateCode = this.normalizeCode(payload.templateCode);
    Object.assign(existing, payload, { updatedBy: user._id, version: existing.version + 1 });
    await existing.save();
    await this.createVersion(existing, user._id, 'Template updated');
    await this.writeAudit(existing._id, existing.schoolId, user._id, 'UPDATE', reqMeta, previous, existing);
    return existing;
  }

  async updateStatus(id, status, user, reqMeta) {
    const existing = await this.getById(id, user.schoolId);
    if (!existing) return null;
    const previous = existing.toObject();
    existing.status = status;
    existing.updatedBy = user._id;
    existing.version += 1;
    await existing.save();
    await this.createVersion(existing, user._id, `Status changed to ${status}`);
    await this.writeAudit(existing._id, existing.schoolId, user._id, status === 'PUBLISHED' ? 'PUBLISH' : 'ARCHIVE', reqMeta, previous, existing);
    return existing;
  }

  async deleteTemplate(id, user, reqMeta) {
    const existing = await this.getById(id, user.schoolId);
    if (!existing) return null;
    const previous = existing.toObject();
    await existing.softDelete(user._id);
    await this.writeAudit(existing._id, existing.schoolId, user._id, 'DELETE', reqMeta, previous, existing);
    return existing;
  }

  async duplicateTemplate(id, payload, user, reqMeta) {
    const existing = await this.getById(id, user.schoolId);
    if (!existing) return null;

    const duplicateCode = this.normalizeCode(payload.templateCode || `${existing.templateCode}_COPY_${Date.now()}`);
    const duplicateName = payload.templateName || `${existing.templateName} Copy`;
    const cloned = await Template.create({
      ...existing.toObject(),
      _id: undefined,
      isNew: true,
      templateName: duplicateName,
      templateCode: duplicateCode,
      status: 'DRAFT',
      version: 1,
      createdBy: user._id,
      updatedBy: user._id,
      createdAt: undefined,
      updatedAt: undefined,
      deletedAt: null,
    });
    await this.createVersion(cloned, user._id, 'Template duplicated');
    await this.writeAudit(cloned._id, cloned.schoolId, user._id, 'DUPLICATE', reqMeta, existing, cloned);
    return cloned;
  }

  async getVersionHistory(schoolId, templateId, page = 1, limit = 20) {
    const skip = (Number(page) - 1) * Number(limit);
    const [data, total] = await Promise.all([
      TemplateVersion.find({ schoolId, templateId }).sort({ version: -1 }).skip(skip).limit(Number(limit)),
      TemplateVersion.countDocuments({ schoolId, templateId }),
    ]);
    return { data, total, page: Number(page), limit: Number(limit), totalPages: Math.ceil(total / Number(limit)) };
  }

  async compareVersions(schoolId, templateId, fromVersion, toVersion) {
    const [fromDoc, toDoc] = await Promise.all([
      TemplateVersion.findOne({ schoolId, templateId, version: Number(fromVersion) }),
      TemplateVersion.findOne({ schoolId, templateId, version: Number(toVersion) }),
    ]);
    if (!fromDoc || !toDoc) return null;

    const from = fromDoc.snapshot || {};
    const to = toDoc.snapshot || {};
    const changedFields = [];
    const keys = new Set([...Object.keys(from), ...Object.keys(to)]);
    keys.forEach((key) => {
      const before = JSON.stringify(from[key]);
      const after = JSON.stringify(to[key]);
      if (before !== after) changedFields.push(key);
    });

    return {
      fromVersion: Number(fromVersion),
      toVersion: Number(toVersion),
      changedFields,
      fromSnapshot: from,
      toSnapshot: to,
    };
  }

  async restoreVersion(schoolId, templateId, version, user, reqMeta) {
    const [template, versionDoc] = await Promise.all([
      Template.findOne({ _id: templateId, schoolId }),
      TemplateVersion.findOne({ templateId, schoolId, version }),
    ]);
    if (!template || !versionDoc) return null;

    const previous = template.toObject();
    const snapshot = versionDoc.snapshot;
    template.templateName = snapshot.templateName;
    template.templateType = snapshot.templateType;
    template.canvasWidth = snapshot.canvasWidth;
    template.canvasHeight = snapshot.canvasHeight;
    template.orientation = snapshot.orientation;
    template.backgroundImage = snapshot.backgroundImage;
    template.templateJson = snapshot.templateJson;
    template.previewImage = snapshot.previewImage;
    template.status = 'DRAFT';
    template.updatedBy = user._id;
    template.version += 1;
    await template.save();

    await this.createVersion(template, user._id, `Restored from version ${version}`);
    await this.writeAudit(template._id, schoolId, user._id, 'RESTORE_VERSION', reqMeta, previous, template);
    return template;
  }
}

module.exports = new TemplateService();
