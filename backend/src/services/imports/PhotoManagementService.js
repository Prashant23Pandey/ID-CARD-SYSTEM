const sharp = require('sharp');
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const { v4: uuidv4 } = require('uuid');
const mongoose = require('mongoose');
const PhotoUpload = require('../models/imports/PhotoUpload');
const { Student } = require('../models/Student');
const Teacher = require('../models/Teacher');
const logger = require('../utils/logger');

class PhotoManagementService {
  static imageFormats = ['jpg', 'jpeg', 'png', 'webp'];
  static maxPhotoSize = 5 * 1024 * 1024; // 5MB
  static maxZipSize = 500 * 1024 * 1024; // 500MB
  static compressedQuality = 80;
  static thumbnailSize = { width: 200, height: 250 };

  static async extractZipFile(zipFilePath) {
    const extractPath = path.join(
      process.env.UPLOAD_DIR || './uploads',
      'photos_extracted_' + uuidv4()
    );

    try {
      await new Promise((resolve, reject) => {
        fs.createReadStream(zipFilePath)
          .pipe(unzipper.Extract({ path: extractPath }))
          .on('close', resolve)
          .on('error', reject);
      });

      const files = [];
      const walkDir = (dir) => {
        const items = fs.readdirSync(dir);
        for (const item of items) {
          const fullPath = path.join(dir, item);
          const stat = fs.statSync(fullPath);
          if (stat.isDirectory()) {
            walkDir(fullPath);
          } else if (stat.isFile()) {
            const ext = path.extname(item).toLowerCase().slice(1);
            if (this.imageFormats.includes(ext)) {
              files.push({
                fileName: item,
                filePath: fullPath,
                size: stat.size,
              });
            }
          }
        }
      };

      walkDir(extractPath);
      return {
        success: true,
        extractPath,
        files,
      };
    } catch (error) {
      logger.error('Zip extraction error:', error);
      throw error;
    }
  }

  static async compressAndOptimizePhoto(filePath, fileName) {
    const ext = path.extname(fileName).toLowerCase().slice(1);
    const baseName = path.basename(fileName, path.extname(fileName));
    const outputPath = path.join(
      process.env.UPLOAD_DIR || './uploads',
      `compressed_${uuidv4()}.webp`
    );
    const thumbnailPath = path.join(
      process.env.UPLOAD_DIR || './uploads',
      `thumbnail_${uuidv4()}.webp`
    );

    try {
      // Get original image metadata
      const metadata = await sharp(filePath).metadata();

      // Compress main image
      await sharp(filePath)
        .resize(1200, 1500, {
          fit: 'inside',
          withoutEnlargement: true,
        })
        .webp({ quality: this.compressedQuality })
        .toFile(outputPath);

      // Create thumbnail
      await sharp(filePath)
        .resize(this.thumbnailSize.width, this.thumbnailSize.height, {
          fit: 'cover',
        })
        .webp({ quality: 70 })
        .toFile(thumbnailPath);

      const originalSize = fs.statSync(filePath).size;
      const compressedSize = fs.statSync(outputPath).size;

      return {
        success: true,
        originalPath: filePath,
        compressedPath: outputPath,
        thumbnailPath,
        originalSize,
        compressedSize,
        metadata: {
          width: metadata.width,
          height: metadata.height,
          format: metadata.format,
          quality: this.compressedQuality,
        },
      };
    } catch (error) {
      logger.error('Photo compression error:', error);
      throw error;
    }
  }

  static async autoMapPhotos(photoFiles, module, schoolId) {
    const mappings = [];
    const unmapped = [];
    const errors = [];

    for (const photo of photoFiles) {
      const fileName = photo.fileName;
      const baseName = path.basename(fileName, path.extname(fileName));

      try {
        let linked = null;

        // Try admission/employee number mapping
        if (module === 'STUDENT') {
          linked = await Student.findOne({
            schoolId,
            admissionNumber: baseName,
            deletedAt: null,
          });
        } else if (module === 'TEACHER') {
          linked = await Teacher.findOne({
            schoolId,
            teacherCode: baseName,
            deletedAt: null,
          });

          if (!linked) {
            linked = await Teacher.findOne({
              schoolId,
              employeeId: baseName,
              deletedAt: null,
            });
          }
        }

        if (linked) {
          mappings.push({
            fileName,
            filePath: photo.filePath,
            linkedToId: linked._id,
            linkedToIdentifier: module === 'STUDENT' ? linked.admissionNumber : linked.teacherCode,
            matchType: 'AUTO',
          });
        } else {
          unmapped.push({
            fileName,
            reason: 'No matching record found',
            suggestedMatch: baseName,
          });
        }
      } catch (error) {
        errors.push({
          fileName,
          errorType: 'MAPPING_ERROR',
          errorMessage: error.message,
        });
      }
    }

    return {
      mappings,
      unmapped,
      errors,
      mappingSuccessRate: ((mappings.length / photoFiles.length) * 100).toFixed(2),
    };
  }

  static async processPhotoUpload(zipFilePath, schoolId, userId, module, mappingType = 'AUTO') {
    const session = await mongoose.startSession();
    session.startTransaction();
    const batchId = uuidv4();

    try {
      // Extract zip
      const extractResult = await this.extractZipFile(zipFilePath);
      if (!extractResult.success) {
        throw new Error('Failed to extract zip file');
      }

      // Create photo upload record
      const photoUpload = await PhotoUpload.create(
        [
          {
            schoolId,
            uploadedBy: userId,
            module,
            batchId,
            fileName: path.basename(zipFilePath),
            totalPhotos: extractResult.files.length,
            status: 'PROCESSING',
            uploadedAt: new Date(),
            processingStartedAt: new Date(),
            zipFilePath,
            extractedFolderPath: extractResult.extractPath,
            mappingRules: { mappingType },
          },
        ],
        { session }
      );

      const photoRecord = photoUpload[0];

      // Auto-map photos
      const autoMapResult = await this.autoMapPhotos(
        extractResult.files,
        module,
        schoolId
      );

      const photoMappings = [];
      let successfulMappings = 0;
      let failedMappings = 0;

      // Process each mapped photo
      for (const mapping of autoMapResult.mappings) {
        try {
          const compressionResult = await this.compressAndOptimizePhoto(
            mapping.filePath,
            mapping.fileName
          );

          photoMappings.push({
            photoPath: mapping.filePath,
            fileName: mapping.fileName,
            linkedTo: module,
            linkedToId: mapping.linkedToId,
            linkedToIdentifier: mapping.linkedToIdentifier,
            matchType: mapping.matchType,
            uploadedAt: new Date(),
            originalSize: compressionResult.originalSize,
            compressedSize: compressionResult.compressedSize,
            metadata: compressionResult.metadata,
          });

          // Update student/teacher with photo reference
          if (module === 'STUDENT') {
            await Student.findByIdAndUpdate(
              mapping.linkedToId,
              {
                photoPath: compressionResult.compressedPath,
                photoName: mapping.fileName,
                updatedBy: userId,
              },
              { session }
            );
          } else if (module === 'TEACHER') {
            await Teacher.findByIdAndUpdate(
              mapping.linkedToId,
              {
                photoPath: compressionResult.compressedPath,
                photoName: mapping.fileName,
                updatedBy: userId,
              },
              { session }
            );
          }

          successfulMappings++;
        } catch (error) {
          logger.error(`Error processing photo ${mapping.fileName}:`, error);
          failedMappings++;
        }
      }

      // Update photo upload record
      photoRecord.photoMappings = photoMappings;
      photoRecord.unmappedPhotos = autoMapResult.unmapped;
      photoRecord.errors = autoMapResult.errors;
      photoRecord.successfulMappings = successfulMappings;
      photoRecord.failedMappings = failedMappings;
      photoRecord.unmappedPhotos = autoMapResult.unmapped.length;
      photoRecord.status =
        failedMappings === 0 ? 'COMPLETED' : successfulMappings > 0 ? 'PARTIAL' : 'FAILED';
      photoRecord.processingCompletedAt = new Date();

      await photoRecord.save({ session });
      await session.commitTransaction();

      return {
        success: true,
        batchId,
        totalPhotos: extractResult.files.length,
        successfulMappings,
        failedMappings,
        unmappedCount: autoMapResult.unmapped.length,
        mappingSuccessRate: autoMapResult.mappingSuccessRate,
        photoUploadId: photoRecord._id,
      };
    } catch (error) {
      await session.abortTransaction();
      logger.error('Photo upload processing error:', error);
      throw error;
    } finally {
      session.endSession();
    }
  }

  static async manualMapPhoto(photoUploadId, photoFileName, linkedToId, matchType = 'MANUAL') {
    try {
      const photoUpload = await PhotoUpload.findById(photoUploadId);
      if (!photoUpload) {
        throw new Error('Photo upload record not found');
      }

      const photoMapping = photoUpload.photoMappings.find((p) => p.fileName === photoFileName);
      if (!photoMapping) {
        throw new Error('Photo not found in upload');
      }

      // Find the entity to link
      let entity;
      if (photoUpload.module === 'STUDENT') {
        entity = await Student.findById(linkedToId);
      } else {
        entity = await Teacher.findById(linkedToId);
      }

      if (!entity) {
        throw new Error(`${photoUpload.module} not found`);
      }

      photoMapping.linkedToId = linkedToId;
      photoMapping.linkedToIdentifier = photoUpload.module === 'STUDENT'
        ? entity.admissionNumber
        : entity.teacherCode;
      photoMapping.matchType = matchType;

      await photoUpload.save();

      return {
        success: true,
        message: 'Photo mapped successfully',
      };
    } catch (error) {
      logger.error('Manual photo mapping error:', error);
      throw error;
    }
  }

  static async getPhotoGallery(schoolId, module, filters = {}) {
    const query = {
      schoolId,
      module,
      status: { $in: ['COMPLETED', 'PARTIAL'] },
    };

    const page = filters.page || 1;
    const limit = Math.min(filters.limit || 20, 100);
    const skip = (page - 1) * limit;

    const total = await PhotoUpload.countDocuments(query);
    const uploads = await PhotoUpload.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('uploadedBy', 'email name')
      .lean();

    return {
      data: uploads,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  static async getPhotos(schoolId, module, entityId = null) {
    const query = {
      schoolId,
      module,
      'photoMappings.linkedToId': entityId || { $exists: true },
    };

    const photos = await PhotoUpload.findOne(query)
      .select('photoMappings')
      .lean();

    if (!photos) {
      return [];
    }

    if (entityId) {
      return photos.photoMappings.filter(
        (p) => p.linkedToId.toString() === entityId.toString()
      );
    }

    return photos.photoMappings;
  }

  static async deletePhoto(photoUploadId, photoFileName) {
    try {
      const photoUpload = await PhotoUpload.findById(photoUploadId);
      if (!photoUpload) {
        throw new Error('Photo upload not found');
      }

      const photoIndex = photoUpload.photoMappings.findIndex((p) => p.fileName === photoFileName);
      if (photoIndex === -1) {
        throw new Error('Photo not found');
      }

      // Delete physical files
      const photo = photoUpload.photoMappings[photoIndex];
      if (fs.existsSync(photo.photoPath)) {
        fs.unlinkSync(photo.photoPath);
      }
      if (fs.existsSync(photo.thumbnailUrl)) {
        fs.unlinkSync(photo.thumbnailUrl);
      }

      // Remove from mapping
      photoUpload.photoMappings.splice(photoIndex, 1);
      await photoUpload.save();

      return {
        success: true,
        message: 'Photo deleted successfully',
      };
    } catch (error) {
      logger.error('Photo deletion error:', error);
      throw error;
    }
  }

  static async getUploadSummary(batchId) {
    try {
      const upload = await PhotoUpload.findOne({ batchId })
        .populate('uploadedBy', 'email name')
        .lean();

      if (!upload) {
        throw new Error('Upload not found');
      }

      return {
        ...upload,
        summary: upload.getMappingSummary(),
        storageStats: upload.getStorageStats(),
      };
    } catch (error) {
      logger.error('Get upload summary error:', error);
      throw error;
    }
  }
}

module.exports = PhotoManagementService;
