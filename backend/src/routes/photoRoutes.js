const express = require('express');
const multer = require('multer');
const path = require('path');
const { authenticateJWT } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');
const importValidator = require('../validators/importValidator');
const PhotoController = require('../controllers/photoController');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(process.env.UPLOAD_DIR || './uploads', 'photos');
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  },
});

const fileFilter = (req, file, cb) => {
  const allowedFormats = ['.zip', '.jpg', '.jpeg', '.png', '.webp'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedFormats.includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only ZIP and image files (JPG, PNG, WEBP) are allowed'));
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 500 * 1024 * 1024, // 500MB for ZIP, 5MB enforced for individual files
  },
});

// Photo upload routes
router.post(
  '/upload',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  upload.single('file'),
  importValidator.validatePhotoUpload,
  PhotoController.uploadPhotos
);

router.post(
  '/bulk-upload',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  upload.array('files', 1000),
  importValidator.validateBulkPhotoUpload,
  PhotoController.uploadBulkPhotos
);

// Photo mapping routes
router.post(
  '/:photoId/map',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validatePhotoMapping,
  PhotoController.mapPhoto
);

router.post(
  '/:photoId/delete',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  importValidator.validateDeletePhoto,
  PhotoController.deletePhoto
);

// Photo retrieval routes
router.get(
  '/gallery',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  importValidator.validatePhotoGallery,
  PhotoController.getPhotoGallery
);

router.get(
  '/entity/:entityId',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  PhotoController.getPhotos
);

router.get(
  '/summary/:batchId',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN']),
  PhotoController.getUploadSummary
);

router.get(
  '/history',
  authenticateJWT,
  authorize(['SUPERADMIN', 'SCHOOLADMIN', 'TEACHER']),
  PhotoController.getPhotoUploadHistory
);

module.exports = router;
