const StudentImportService = require('../services/imports/StudentImportService');
const TeacherImportService = require('../services/imports/TeacherImportService');
const ExportService = require('../services/imports/ExportService');
const PhotoManagementService = require('../services/imports/PhotoManagementService');
const ImportHistory = require('../models/imports/ImportHistory');
const ExportHistory = require('../models/imports/ExportHistory');
const PhotoUpload = require('../models/imports/PhotoUpload');
const ExcelParser = require('../utils/ExcelParser');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ImportController {
  static async uploadStudentImport(req, res) {
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
      const filePath = req.file.path;

      const result = await StudentImportService.parseAndValidateImport(
        filePath,
        schoolId,
        userId
      );

      res.json({
        success: true,
        message: 'Student import validation completed',
        data: result,
      });
    } catch (error) {
      logger.error('Student import upload error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async approveStudentImport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { importId } = req.params;
      const { action } = req.body;
      const schoolId = req.user.schoolId;
      const userId = req.user._id;

      const importHistory = await ImportHistory.findById(importId);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      if (action === 'REJECT') {
        importHistory.status = 'REJECTED';
        await importHistory.save();
        return res.json({
          success: true,
          message: 'Import rejected',
        });
      }

      if (action === 'APPROVE') {
        const duplicateHandling = req.body.duplicateHandling || 'SKIP';
        const result = await StudentImportService.importStudents(
          importId,
          schoolId,
          userId,
          importHistory.filePath,
          duplicateHandling
        );

        res.json({
          success: true,
          message: 'Students imported successfully',
          data: result,
        });
      }
    } catch (error) {
      logger.error('Student import approval error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async uploadTeacherImport(req, res) {
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
      const filePath = req.file.path;

      const result = await TeacherImportService.parseAndValidateImport(
        filePath,
        schoolId,
        userId
      );

      res.json({
        success: true,
        message: 'Teacher import validation completed',
        data: result,
      });
    } catch (error) {
      logger.error('Teacher import upload error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async approveTeacherImport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { importId } = req.params;
      const { action } = req.body;
      const schoolId = req.user.schoolId;
      const userId = req.user._id;

      const importHistory = await ImportHistory.findById(importId);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      if (action === 'REJECT') {
        importHistory.status = 'REJECTED';
        await importHistory.save();
        return res.json({
          success: true,
          message: 'Import rejected',
        });
      }

      if (action === 'APPROVE') {
        const duplicateHandling = req.body.duplicateHandling || 'SKIP';
        const result = await TeacherImportService.importTeachers(
          importId,
          schoolId,
          userId,
          importHistory.filePath,
          duplicateHandling
        );

        res.json({
          success: true,
          message: 'Teachers imported successfully',
          data: result,
        });
      }
    } catch (error) {
      logger.error('Teacher import approval error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getImportHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const filters = {
        status: req.query.status,
        module: req.query.module,
        search: req.query.search,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await ImportHistory.find({
        schoolId,
        ...(filters.module && { module: filters.module }),
        ...(filters.status && { status: filters.status }),
        deletedAt: null,
      })
        .sort({ createdAt: -1 })
        .skip((filters.page - 1) * filters.limit)
        .limit(filters.limit)
        .populate('uploadedBy', 'email name');

      const total = await ImportHistory.countDocuments({
        schoolId,
        ...(filters.module && { module: filters.module }),
        ...(filters.status && { status: filters.status }),
        deletedAt: null,
      });

      res.json({
        success: true,
        data: result,
        total,
        page: filters.page,
        limit: filters.limit,
        totalPages: Math.ceil(total / filters.limit),
      });
    } catch (error) {
      logger.error('Get import history error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getImportById(req, res) {
    try {
      const { importId } = req.params;
      const schoolId = req.user.schoolId;

      const importHistory = await ImportHistory.findById(importId)
        .populate('uploadedBy', 'email name');

      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      res.json({
        success: true,
        data: importHistory,
      });
    } catch (error) {
      logger.error('Get import by ID error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async rollbackImport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { importId } = req.params;
      const { reason } = req.body;
      const schoolId = req.user.schoolId;
      const userId = req.user._id;

      const importHistory = await ImportHistory.findById(importId);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      let result;
      if (importHistory.module === 'STUDENT') {
        result = await StudentImportService.rollbackImport(importId, schoolId, userId, reason);
      } else if (importHistory.module === 'TEACHER') {
        result = await TeacherImportService.rollbackImport(importId, schoolId, userId, reason);
      }

      res.json({
        success: true,
        message: 'Import rolled back successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Rollback import error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async downloadErrorReport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { importId } = req.params;
      const format = req.query.format || 'xlsx';
      const schoolId = req.user.schoolId;

      const importHistory = await ImportHistory.findById(importId);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      const errorData = importHistory.validationErrors.map((err) => ({
        'Row Number': err.rowNumber,
        'Field Name': err.fieldName,
        'Error Type': err.errorType,
        'Error Message': err.errorMessage,
        'Suggested Fix': err.suggestedFix,
        Value: err.value,
      }));

      let report;
      if (format === 'csv') {
        report = ExcelParser.generateCSVReport(errorData);
      } else {
        report = ExcelParser.generateExcelReport(errorData);
      }

      if (report) {
        res.download(report.filePath, report.fileName);
      } else {
        res.status(404).json({ success: false, message: 'No errors to report' });
      }
    } catch (error) {
      logger.error('Download error report error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async previewImport(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const { importId } = req.params;
      const schoolId = req.user.schoolId;
      const page = parseInt(req.query.page) || 1;
      const limit = Math.min(parseInt(req.query.limit) || 20, 100);

      const importHistory = await ImportHistory.findById(importId);
      if (!importHistory || importHistory.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Import not found' });
      }

      const errors_paginated = importHistory.validationErrors.slice(
        (page - 1) * limit,
        page * limit
      );

      res.json({
        success: true,
        data: {
          totalErrors: importHistory.validationErrors.length,
          totalDuplicates: importHistory.duplicateRecords.length,
          totalWarnings: importHistory.warnings.length,
          errors: errors_paginated,
          page,
          limit,
        },
      });
    } catch (error) {
      logger.error('Preview import error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ImportController;
