const express = require('express');
const multer = require('multer');
const { protect, authorize } = require('../middlewares/auth.middleware');
const { requireSchoolAccess } = require('../middlewares/role.middleware');
const teacherController = require('../controllers/teacher.controller');
const {
  validateTeacherCreate,
  validateTeacherUpdate,
  validateTeacherQuery,
  validateTeacherIdParam,
  validateClassAssignment,
  validatePasswordReset,
} = require('../validators/teacher.validator');

const router = express.Router();

// Multer for memory storage
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/') || 
        file.mimetype.includes('spreadsheet') || 
        file.originalname.endsWith('.xlsx')) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type'), false);
    }
  }
});

router.use(protect);
router.use(requireSchoolAccess);

// Bulk endpoints must be placed before /:id routes
router.get('/export', authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherQuery, teacherController.exportTeachers);
router.post('/import', authorize('SUPERADMIN', 'SCHOOLADMIN'), upload.single('file'), teacherController.importTeachers);

// Base CRUD
router
  .route('/')
  .get(authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherQuery, teacherController.getTeachers)
  .post(authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherCreate, teacherController.createTeacher);

router
  .route('/:id')
  .get(authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'), validateTeacherIdParam, teacherController.getTeacherById)
  .put(authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'), validateTeacherIdParam, validateTeacherUpdate, teacherController.updateTeacher)
  .delete(authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherIdParam, teacherController.deleteTeacher);

// Files uploads
router.post('/:id/photo', authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'), validateTeacherIdParam, upload.single('photo'), teacherController.uploadPhoto);
router.post('/:id/signature', authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'), validateTeacherIdParam, upload.single('signature'), teacherController.uploadSignature);

// Class Assignment
router.patch('/:id/assign-class', authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherIdParam, validateClassAssignment, teacherController.assignClass);
router.patch('/:id/remove-class', authorize('SUPERADMIN', 'SCHOOLADMIN'), validateTeacherIdParam, teacherController.removeClass);

// Auth / Security
router.patch('/:id/reset-password', authorize('SUPERADMIN', 'SCHOOLADMIN', 'TEACHER'), validateTeacherIdParam, validatePasswordReset, teacherController.resetPassword);

module.exports = router;
