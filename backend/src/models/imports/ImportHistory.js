const mongoose = require('mongoose');

const importHistorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileType: {
      type: String,
      enum: ['xlsx', 'xls', 'csv'],
      required: true,
    },
    module: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'CLASS', 'SECTION', 'SESSION'],
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'],
      default: 'PENDING',
      index: true,
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    successfulRecords: {
      type: Number,
      default: 0,
    },
    failedRecords: {
      type: Number,
      default: 0,
    },
    skippedRecords: {
      type: Number,
      default: 0,
    },
    filePath: {
      type: String,
      required: true,
    },
    errorFileUrl: {
      type: String,
      default: null,
    },
    errorFileName: {
      type: String,
      default: null,
    },
    errorFileType: {
      type: String,
      enum: ['xlsx', 'csv', 'pdf'],
      default: 'xlsx',
    },
    processedRecordIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
      },
    ],
    validationErrors: [
      {
        rowNumber: Number,
        fieldName: String,
        errorType: String,
        errorMessage: String,
        suggestedFix: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    duplicateRecords: [
      {
        rowNumber: Number,
        duplicateOf: String,
        field: String,
        value: mongoose.Schema.Types.Mixed,
      },
    ],
    warnings: [
      {
        rowNumber: Number,
        message: String,
        type: String,
      },
    ],
    importMappings: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    startedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: {
      type: Date,
      default: null,
    },
    rollbackRequestedAt: {
      type: Date,
      default: null,
    },
    rollbackCompletedAt: {
      type: Date,
      default: null,
    },
    rollbackReason: String,
    rollbackRequestedBy: mongoose.Schema.Types.ObjectId,
    importStats: {
      processingTimeMs: Number,
      averageTimePerRecord: Number,
      duplicatesDetected: Number,
      validationErrorsCount: Number,
      warningsCount: Number,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
    collection: 'importhistories',
  }
);

importHistorySchema.index({ schoolId: 1, createdAt: -1 });
importHistorySchema.index({ schoolId: 1, status: 1 });
importHistorySchema.index({ schoolId: 1, module: 1, createdAt: -1 });
importHistorySchema.index({ uploadedBy: 1, createdAt: -1 });

importHistorySchema.methods.getErrorSummary = function () {
  return {
    totalErrors: this.validationErrors.length,
    totalDuplicates: this.duplicateRecords.length,
    totalWarnings: this.warnings.length,
    errorsByType: this.validationErrors.reduce((acc, err) => {
      acc[err.errorType] = (acc[err.errorType] || 0) + 1;
      return acc;
    }, {}),
    failureRate: ((this.failedRecords / this.totalRecords) * 100).toFixed(2) + '%',
  };
};

importHistorySchema.methods.getSuccessRate = function () {
  if (this.totalRecords === 0) return 0;
  return ((this.successfulRecords / this.totalRecords) * 100).toFixed(2);
};

importHistorySchema.methods.canRollback = function () {
  return (
    this.status === 'COMPLETED' &&
    this.successfulRecords > 0 &&
    !this.rollbackCompletedAt &&
    this.processedRecordIds.length > 0
  );
};

const ImportHistory = mongoose.model('ImportHistory', importHistorySchema);

module.exports = ImportHistory;
