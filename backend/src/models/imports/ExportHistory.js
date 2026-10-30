const mongoose = require('mongoose');

const exportHistorySchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    exportedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    module: {
      type: String,
      enum: ['STUDENT', 'TEACHER', 'CLASS', 'SECTION', 'SESSION'],
      required: true,
    },
    format: {
      type: String,
      enum: ['xlsx', 'csv', 'pdf'],
      required: true,
    },
    status: {
      type: String,
      enum: ['INITIATED', 'PROCESSING', 'COMPLETED', 'FAILED'],
      default: 'INITIATED',
    },
    totalRecords: {
      type: Number,
      default: 0,
    },
    exportedRecords: {
      type: Number,
      default: 0,
    },
    filters: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    selectedFields: [String],
    fileName: String,
    fileUrl: String,
    filePath: String,
    fileSize: Number,
    downloadUrl: String,
    expiresAt: Date,
    includePhotos: {
      type: Boolean,
      default: false,
    },
    includeArchived: {
      type: Boolean,
      default: false,
    },
    dateRange: {
      startDate: Date,
      endDate: Date,
    },
    generatedAt: {
      type: Date,
      default: Date.now,
    },
    completedAt: Date,
    processingTimeMs: Number,
    recordsPerSecond: Number,
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'exporthistories',
  }
);

exportHistorySchema.index({ schoolId: 1, createdAt: -1 });
exportHistorySchema.index({ schoolId: 1, module: 1, createdAt: -1 });
exportHistorySchema.index({ exportedBy: 1, createdAt: -1 });
exportHistorySchema.index({ status: 1 });

exportHistorySchema.methods.getExportStats = function () {
  return {
    module: this.module,
    format: this.format,
    totalRecords: this.totalRecords,
    exportedRecords: this.exportedRecords,
    successRate: ((this.exportedRecords / this.totalRecords) * 100).toFixed(2) + '%',
    fileSize: this.fileSize,
    processingTimeMs: this.processingTimeMs,
    recordsPerSecond: this.recordsPerSecond,
  };
};

const ExportHistory = mongoose.model('ExportHistory', exportHistorySchema);

module.exports = ExportHistory;
