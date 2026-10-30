const PhotoManagementService = require('../services/imports/PhotoManagementService');
const PhotoUpload = require('../models/imports/PhotoUpload');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class PhotoController {
  static async uploadPhotos(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      if (!req.file) {
        return res.status(400).json({ success: false, message: 'No file uploaded' });
      }

      const schoolId = req.user.schoolId;
      const userId = req.user._id;
      const { module, mappingType } = req.body;
      const zipFilePath = req.file.path;

      const result = await PhotoManagementService.processPhotoUpload(
        zipFilePath,
        schoolId,
        userId,
        module,
        mappingType || 'AUTO'
      );

      res.json({
        success: true,
        message: 'Photos uploaded and processed successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Photo upload error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadBulkPhotos(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ success: false, message: 'No files uploaded' });
      }

      const schoolId = req.user.schoolId;
      const userId = req.user._id;
      const { module, mappings } = req.body;

      const results = [];

      for (const file of req.files) {
        try {
          const result = await PhotoManagementService.processPhotoUpload(
            file.path,
            schoolId,
            userId,
            module,
            'MANUAL'
          );
          results.push(result);
        } catch (error) {
          logger.error(`Error processing file ${file.originalname}:`, error);
          results.push({
            success: false,
            fileName: file.originalname,
            error: error.message,
          });
        }
      }

      res.json({
        success: true,
        message: 'Bulk photos processed',
        data: {
          totalProcessed: results.length,
          results,
        },
      });
    } catch (error) {
      logger.error('Bulk photo upload error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async mapPhoto(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { photoId } = req.params;
      const { linkedToId, linkedToIdentifier, matchType } = req.body;
      const schoolId = req.user.schoolId;

      const photoUpload = await PhotoUpload.findById(photoId);
      if (!photoUpload || photoUpload.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Photo upload not found' });
      }

      const result = await PhotoManagementService.manualMapPhoto(
        photoId,
        linkedToIdentifier,
        linkedToId,
        matchType
      );

      res.json({
        success: true,
        message: 'Photo mapped successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Photo mapping error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async deletePhoto(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { photoId } = req.params;
      const { photoFileName } = req.body;
      const schoolId = req.user.schoolId;

      const photoUpload = await PhotoUpload.findById(photoId);
      if (!photoUpload || photoUpload.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Photo upload not found' });
      }

      const result = await PhotoManagementService.deletePhoto(photoId, photoFileName);

      res.json({
        success: true,
        message: 'Photo deleted successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Photo deletion error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPhotoGallery(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const { module } = req.query;
      const filters = {
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 20,
      };

      const result = await PhotoManagementService.getPhotoGallery(schoolId, module, filters);

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      logger.error('Get photo gallery error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPhotos(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const { module, entityId } = req.query;

      const photos = await PhotoManagementService.getPhotos(schoolId, module, entityId);

      res.json({
        success: true,
        data: photos,
        count: photos.length,
      });
    } catch (error) {
      logger.error('Get photos error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getUploadSummary(req, res) {
    try {
      const { batchId } = req.params;
      const schoolId = req.user.schoolId;

      const result = await PhotoManagementService.getUploadSummary(batchId);

      if (result.schoolId.toString() !== schoolId.toString()) {
        return res.status(403).json({ success: false, message: 'Access denied' });
      }

      res.json({
        success: true,
        data: result,
      });
    } catch (error) {
      logger.error('Get upload summary error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getPhotoUploadHistory(req, res) {
    try {
      const schoolId = req.user.schoolId;
      const { module, status } = req.query;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 10, 100);

      const query = {
        schoolId,
        ...(module && { module }),
        ...(status && { status }),
      };

      const total = await PhotoUpload.countDocuments(query);
      const uploads = await PhotoUpload.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('uploadedBy', 'email name')
        .lean();

      res.json({
        success: true,
        data: uploads,
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      });
    } catch (error) {
      logger.error('Get photo upload history error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = PhotoController;
