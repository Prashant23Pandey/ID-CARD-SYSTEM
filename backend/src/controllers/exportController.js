const ExportService = require('../services/imports/ExportService');
const ExportHistory = require('../models/imports/ExportHistory');
const { validationResult } = require('express-validator');
const logger = require('../utils/logger');
const fs = require('fs');
const path = require('path');

class ExportController {
  static async exportStudents(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const userId = req.user._id;
      const format = req.query.format || 'xlsx';

      const filters = {
        classId: req.query.classId,
        sessionId: req.query.sessionId,
        search: req.query.search,
        status: req.query.status,
      };

      let result;
      if (format === 'csv') {
        result = await ExportService.exportStudentsToCSV(schoolId, userId, filters);
      } else if (format === 'pdf') {
        // PDF export would require additional implementation
        result = await ExportService.exportStudentsToExcel(schoolId, userId, filters);
      } else {
        result = await ExportService.exportStudentsToExcel(schoolId, userId, filters);
      }

      res.json({
        success: true,
        message: 'Students exported successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Student export error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async exportTeachers(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const userId = req.user._id;
      const format = req.query.format || 'xlsx';

      const filters = {
        departmentId: req.query.departmentId,
        search: req.query.search,
      };

      let result;
      if (format === 'csv') {
        // CSV export would require similar implementation
        result = await ExportService.exportTeachersToExcel(schoolId, userId, filters);
      } else {
        result = await ExportService.exportTeachersToExcel(schoolId, userId, filters);
      }

      res.json({
        success: true,
        message: 'Teachers exported successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Teacher export error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async exportClasses(req, res) {
    try {
      const schoolId = req.user.schoolId;
      const userId = req.user._id;

      const result = await ExportService.exportClassesToExcel(schoolId, userId);

      res.json({
        success: true,
        message: 'Classes exported successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Class export error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async exportSessions(req, res) {
    try {
      const schoolId = req.user.schoolId;
      const userId = req.user._id;

      const result = await ExportService.exportSessionsToExcel(schoolId, userId);

      res.json({
        success: true,
        message: 'Sessions exported successfully',
        data: result,
      });
    } catch (error) {
      logger.error('Session export error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async getExportHistory(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ success: false, errors: errors.array() });
      }

      const schoolId = req.user.schoolId;
      const filters = {
        module: req.query.module,
        status: req.query.status,
        page: parseInt(req.query.page) || 1,
        limit: parseInt(req.query.limit) || 10,
      };

      const result = await ExportService.getExportHistory(schoolId, filters);

      res.json({
        success: true,
        data: result.data,
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      logger.error('Get export history error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }

  static async downloadExportFile(req, res) {
    try {
      const { exportId } = req.params;
      const schoolId = req.user.schoolId;

      const exportRecord = await ExportHistory.findById(exportId);
      if (!exportRecord || exportRecord.schoolId.toString() !== schoolId.toString()) {
        return res.status(404).json({ success: false, message: 'Export not found' });
      }

      if (
        exportRecord.status !== 'COMPLETED' ||
        !fs.existsSync(exportRecord.filePath)
      ) {
        return res.status(404).json({ success: false, message: 'File not found' });
      }

      res.download(exportRecord.filePath, exportRecord.fileName);
    } catch (error) {
      logger.error('Download export file error:', error);
      res.status(500).json({ success: false, message: error.message });
    }
  }
}

module.exports = ExportController;
