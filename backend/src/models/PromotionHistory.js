const mongoose = require('mongoose');

const promotionHistorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    previousSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    nextSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    previousClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    previousSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    nextClassId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    nextSectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    promotionStatus: {
      type: String,
      enum: ['PROMOTED', 'DETAINED', 'GRADUATED', 'TRANSFERRED'],
      required: true,
      index: true,
    },
    remarks: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    promotedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    batchPromotionId: {
      type: String,
      index: true,
      default: null,
    },
    promotionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    isRolledBack: {
      type: Boolean,
      default: false,
      index: true,
    },
    rollbackDate: {
      type: Date,
      default: null,
    },
    rollbackBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    rollbackReason: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    performanceMetrics: {
      attendancePercentage: {
        type: Number,
        default: null,
        min: 0,
        max: 100,
      },
      academicPerformance: {
        type: String,
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'POOR', null],
        default: null,
      },
      conductRating: {
        type: String,
        enum: ['EXCELLENT', 'GOOD', 'AVERAGE', 'NEEDS_IMPROVEMENT', null],
        default: null,
      },
    },
  },
  {
    timestamps: true,
  }
);

// Compound indexes for efficient queries
promotionHistorySchema.index({ schoolId: 1, previousSessionId: 1, nextSessionId: 1 });
promotionHistorySchema.index({ schoolId: 1, studentId: 1, promotionDate: -1 });
promotionHistorySchema.index({ batchPromotionId: 1, isRolledBack: 1 });

// Static method to get promotion history for a student
promotionHistorySchema.statics.getStudentPromotionHistory = function (studentId, schoolId) {
  return this.find({ studentId, schoolId })
    .sort({ promotionDate: -1 })
    .populate('previousSessionId', 'sessionName')
    .populate('nextSessionId', 'sessionName')
    .populate('previousClassId', 'className')
    .populate('nextClassId', 'className')
    .populate('previousSectionId', 'sectionName')
    .populate('nextSectionId', 'sectionName')
    .populate('promotedBy', 'firstName lastName');
};

// Static method to get batch promotion details
promotionHistorySchema.statics.getBatchPromotionDetails = function (batchPromotionId, schoolId) {
  return this.find({ batchPromotionId, schoolId, isRolledBack: false })
    .populate('studentId', 'firstName lastName admissionNumber')
    .populate('nextClassId', 'className')
    .populate('nextSectionId', 'sectionName');
};

// Instance method to rollback promotion
promotionHistorySchema.methods.rollbackPromotion = function (userId, reason) {
  this.isRolledBack = true;
  this.rollbackDate = new Date();
  this.rollbackBy = userId;
  this.rollbackReason = reason;
  return this.save();
};

const PromotionHistory = mongoose.model('PromotionHistory', promotionHistorySchema);

module.exports = PromotionHistory;
