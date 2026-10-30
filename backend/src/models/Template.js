const mongoose = require('mongoose');

const TEMPLATE_TYPES = ['STUDENT_ID_CARD', 'TEACHER_ID_CARD', 'STAFF_ID_CARD', 'VISITOR_PASS', 'CUSTOM_TEMPLATE'];
const ORIENTATIONS = ['PORTRAIT', 'LANDSCAPE'];
const TEMPLATE_STATUS = ['DRAFT', 'PUBLISHED', 'ARCHIVED', 'DELETED'];
const CARD_SIDES = ['FRONT', 'BACK'];

const templateSideSchema = new mongoose.Schema(
  {
    side: { type: String, enum: CARD_SIDES, required: true },
    canvasJson: { type: mongoose.Schema.Types.Mixed, required: true },
    previewImage: { type: String, default: null },
  },
  { _id: false }
);

const templateSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    templateName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    templateCode: {
      type: String,
      required: true,
      trim: true,
      uppercase: true,
      maxlength: 60,
    },
    templateType: {
      type: String,
      enum: TEMPLATE_TYPES,
      required: true,
      index: true,
    },
    canvasWidth: {
      type: Number,
      required: true,
      min: 100,
      max: 5000,
    },
    canvasHeight: {
      type: Number,
      required: true,
      min: 100,
      max: 5000,
    },
    orientation: {
      type: String,
      enum: ORIENTATIONS,
      required: true,
    },
    backgroundImage: { type: String, default: null },
    templateJson: {
      front: { type: mongoose.Schema.Types.Mixed, required: true },
      back: { type: mongoose.Schema.Types.Mixed, default: null },
    },
    previewImage: {
      front: { type: String, default: null },
      back: { type: String, default: null },
    },
    sides: {
      type: [templateSideSchema],
      default: [],
    },
    version: {
      type: Number,
      default: 1,
      min: 1,
    },
    status: {
      type: String,
      enum: TEMPLATE_STATUS,
      default: 'DRAFT',
      index: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    deletedAt: {
      type: Date,
      default: null,
      index: true,
    },
  },
  { timestamps: true }
);

templateSchema.index({ schoolId: 1, templateCode: 1 }, { unique: true });
templateSchema.index({ schoolId: 1, templateName: 1 });
templateSchema.index({ schoolId: 1, status: 1, templateType: 1 });

templateSchema.pre(/^find/, function preFind(next) {
  if (!this.getOptions().includeDeleted) {
    this.where({ deletedAt: null, status: { $ne: 'DELETED' } });
  }
  next();
});

templateSchema.methods.softDelete = function softDelete(userId) {
  this.status = 'DELETED';
  this.deletedAt = new Date();
  this.updatedBy = userId;
  return this.save();
};

const Template = mongoose.model('Template', templateSchema);

module.exports = {
  Template,
  TEMPLATE_TYPES,
  ORIENTATIONS,
  TEMPLATE_STATUS,
  CARD_SIDES,
};
