const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const importValidator = require('../validators/importValidator');
const ImportController = require('../controllers/importController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'imports');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFormats = ['.xlsx', '.xls', '.csv'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only XLSX, XLS, and CSV files are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 20 * 1024 * 1024, // 20MB
  },
});

// Student import routes
router.post(
  '/students/upload',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  upload.single('file'),
  importValidator.validateStudentImport,
  ImportController.uploadStudentImport
);

router.post(
  '/students/:importId/approve',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateStudentImportApproval,
  ImportController.approveStudentImport
);

// Teacher import routes
router.post(
  '/teachers/upload',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  upload.single('file'),
  importValidator.validateTeacherImport,
  ImportController.uploadTeacherImport
);

router.post(
  '/teachers/:importId/approve',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateTeacherImportApproval,
  ImportController.approveTeacherImport
);

// Import history routes
router.get(
  '/history',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validateGetImportHistory,
  ImportController.getImportHistory
);

router.get(
  '/:importId',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validateGetImportById,
  ImportController.getImportById
);

// Rollback route
router.post(
  '/:importId/rollback',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateRollbackImport,
  ImportController.rollbackImport
);

// Error report download
router.get(
  '/:importId/error-report',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validateDownloadErrorReport,
  ImportController.downloadErrorReport
);

// Preview import
router.get(
  '/:importId/preview',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validatePreviewImport,
  ImportController.previewImport
);

module.exports = router;
