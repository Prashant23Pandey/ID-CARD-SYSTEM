const mongoose = require('mongoose');

const templateAuditLogSchema = new mongoose.Schema(
  {
    templateId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Template',
      required: true,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    action: {
      type: String,
      required: true,
      enum: [
        'CREATE',
        'UPDATE',
        'DELETE',
        'ARCHIVE',
        'PUBLISH',
        'DUPLICATE',
        'RESTORE_VERSION',
        'IMPORT',
        'EXPORT',
        'PREVIEW',
      ],
    },
    actorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    previousData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    newData: {
      type: mongoose.Schema.Types.Mixed,
      default: null,
    },
    ipAddress: { type: String, default: null },
    userAgent: { type: String, default: null },
  },
  { timestamps: true }
);

templateAuditLogSchema.index({ templateId: 1, createdAt: -1 });

const TemplateAuditLog = mongoose.model('TemplateAuditLog', templateAuditLogSchema);

module.exports = { TemplateAuditLog };
