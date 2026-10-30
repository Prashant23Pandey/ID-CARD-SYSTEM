const mongoose = require('mongoose');

const templateVersionSchema = new mongoose.Schema(
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
    version: {
      type: Number,
      required: true,
      min: 1,
      index: true,
    },
    snapshot: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    changeSummary: {
      type: String,
      trim: true,
      maxlength: 500,
      default: 'Template version update',
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
  },
  { timestamps: true }
);

templateVersionSchema.index({ templateId: 1, version: -1 }, { unique: true });

const TemplateVersion = mongoose.model('TemplateVersion', templateVersionSchema);

module.exports = { TemplateVersion };
