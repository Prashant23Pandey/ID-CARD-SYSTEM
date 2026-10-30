const express = require('express');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const importValidator = require('../validators/importValidator');
const ExportController = require('../controllers/exportController');

const router = express.Router();

// Student export routes
router.get(
  '/students',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validateStudentExport,
  ExportController.exportStudents
);

// Teacher export routes
router.get(
  '/teachers',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validateTeacherExport,
  ExportController.exportTeachers
);

// Class export routes
router.get(
  '/classes',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateClassExport,
  ExportController.exportClasses
);

// Session export routes
router.get(
  '/sessions',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateSessionExport,
  ExportController.exportSessions
);

// Export history routes
router.get(
  '/history',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  ExportController.getExportHistory
);

// Download export file
router.get(
  '/:exportId/download',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  ExportController.downloadExportFile
);

module.exports = router;
