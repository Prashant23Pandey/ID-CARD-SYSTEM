const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { requireSchoolAccess } = require('../middlewares/role.middleware');
const studentController = require('../controllers/student.controller');
const {
  validateStudentCreate,
  validateStudentUpdate,
  validateStudentQuery,
  validateStudentIdParam,
  validateBulkPromote,
} = require('../validators/student.validator');

const router = express.Router();

// Configure Multer for memory storage (processing with sharp before saving)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    // Only allow images or excel for import
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.includes('spreadsheet') || 
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

// All routes require authentication and school access mapping
router.use(protect);
router.use(requireSchoolAccess);

// Export (Must be before /:id)
router.get(
  '/export',
  authorize('SUPERADMIN', 'SCHOOLADMIN'),
  validateStudentQuery,
  studentController.exportStudents
);

// Import
router.post(
  '/import',
  authorize('SUPERADMIN', 'SCHOOLADMIN'),
  upload.single('file'),
  studentController.importStudents
);

// Bulk Promote
router.post(
  '/promote',
  authorize('SUPERADMIN', 'SCHOOLADMIN'),
  validateBulkPromote,
  studentController.promoteStudents
);

// Base CRUD
router
  .route('/')
  .get(
    authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'),
    validateStudentQuery,
    studentController.getStudents
  )
  .post(
    authorize('SUPERADMIN', 'SCHOOLADMIN'),
    validateStudentCreate,
    studentController.createStudent
  );

router
  .route('/:id')
  .get(
    authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'),
    validateStudentIdParam,
    studentController.getStudentById
  )
  .put(
    authorize('SUPERADMIN', 'SCHOOLADMIN'),
    validateStudentIdParam,
    validateStudentUpdate,
    studentController.updateStudent
  )
  .delete(
    authorize('SUPERADMIN', 'SCHOOLADMIN'),
    validateStudentIdParam,
    studentController.deleteStudent
  );

// Photo Upload
router.post(
  '/:id/photo',
  authorize('SUPERADMIN', 'SCHOOLADMIN'),
  validateStudentIdParam,
  upload.single('photo'),
  studentController.uploadStudentPhoto
);

module.exports = router;
