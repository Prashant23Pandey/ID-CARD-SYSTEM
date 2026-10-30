const mongoose = require('mongoose');

const photoUploadSchema = new mongoose.Schema(
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
    module: {
      type: String,
      enum: ['STUDENT', 'TEACHER'],
      required: true,
    },
    batchId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    fileName: String,
    fileType: {
      type: String,
      enum: ['zip', 'folder'],
      default: 'zip',
    },
    totalPhotos: {
      type: Number,
      default: 0,
    },
    successfulMappings: {
      type: Number,
      default: 0,
    },
    failedMappings: {
      type: Number,
      default: 0,
    },
    unmappedPhotos: {
      type: Number,
      default: 0,
    },
    status: {
      type: String,
      enum: ['UPLOADED', 'PROCESSING', 'COMPLETED', 'FAILED', 'PARTIAL'],
      default: 'UPLOADED',
    },
    uploadedAt: {
      type: Date,
      default: Date.now,
    },
    processingStartedAt: Date,
    processingCompletedAt: Date,
    photoMappings: [
      {
        photoPath: String,
        fileName: String,
        linkedTo: {
          type: String,
          enum: ['STUDENT', 'TEACHER'],
        },
        linkedToId: mongoose.Schema.Types.ObjectId,
        linkedToIdentifier: String,
        matchType: {
          type: String,
          enum: ['ADMISSION_NUMBER', 'TEACHER_CODE', 'EMPLOYEE_ID', 'MANUAL', 'AUTO'],
        },
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
        photoS3Url: String,
        photoCloudinaryUrl: String,
        thumbnailUrl: String,
        originalSize: Number,
        compressedSize: Number,
        metadata: {
          width: Number,
          height: Number,
          format: String,
          quality: Number,
        },
      },
    ],
    unmappedPhotos: [
      {
        fileName: String,
        filePath: String,
        reason: String,
        suggestedMatch: String,
      },
    ],
    errors: [
      {
        fileName: String,
        errorType: String,
        errorMessage: String,
        suggestedFix: String,
      },
    ],
    storageProvider: {
      type: String,
      enum: ['LOCAL', 'AWS_S3', 'CLOUDINARY'],
      default: 'LOCAL',
    },
    storagePath: String,
    zipFilePath: String,
    extractedFolderPath: String,
    mappingRules: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
    collection: 'photouploads',
  }
);

photoUploadSchema.index({ schoolId: 1, createdAt: -1 });
photoUploadSchema.index({ schoolId: 1, module: 1 });
photoUploadSchema.index({ batchId: 1 });
photoUploadSchema.index({ status: 1 });

photoUploadSchema.methods.getMappingSummary = function () {
  return {
    totalPhotos: this.totalPhotos,
    successfulMappings: this.successfulMappings,
    failedMappings: this.failedMappings,
    unmappedPhotos: this.unmappedPhotos.length,
    mappingSuccessRate: ((this.successfulMappings / this.totalPhotos) * 100).toFixed(2) + '%',
    totalErrors: this.errors.length,
  };
};

photoUploadSchema.methods.getStorageStats = function () {
  const mappings = this.photoMappings || [];
  const totalOriginalSize = mappings.reduce((sum, m) => sum + (m.originalSize || 0), 0);
  const totalCompressedSize = mappings.reduce((sum, m) => sum + (m.compressedSize || 0), 0);
  const compressionRatio = (
    ((totalOriginalSize - totalCompressedSize) / totalOriginalSize) *
    100
  ).toFixed(2);

  return {
    totalOriginalSize: totalOriginalSize,
    totalCompressedSize: totalCompressedSize,
    spaceSaved: totalOriginalSize - totalCompressedSize,
    compressionRatio: compressionRatio + '%',
  };
};

const PhotoUpload = mongoose.model('PhotoUpload', photoUploadSchema);

module.exports = PhotoUpload;
