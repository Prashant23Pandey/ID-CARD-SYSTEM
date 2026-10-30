const { body, query, param, validationResult } = require('express-validator');

// Student Import Validators
const validateStudentImport = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new Error('Invalid file format. Only XLSX, XLS, and CSV are allowed');
      }
      if (req.file.size > 20 * 1024 * 1024) {
        throw new Error('File size exceeds 20 MB limit');
      }
      return true;
    })
    .optional(),
  body('duplicateHandling')
    .isIn(['SKIP', 'UPDATE', 'REPLACE'])
    .withMessage('Invalid duplicate handling option'),
  body('validationOnly')
    .isBoolean()
    .withMessage('validationOnly must be boolean')
    .optional(),
  body('mappings')
    .isObject()
    .withMessage('Invalid mappings')
    .optional(),
];

const validateStudentImportApproval = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
  body('action')
    .isIn(['APPROVE', 'REJECT'])
    .withMessage('Invalid action'),
  body('remarks')
    .isString()
    .trim()
    .optional(),
];

// Teacher Import Validators
const validateTeacherImport = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const allowedMimes = [
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/csv',
      ];
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new Error('Invalid file format. Only XLSX, XLS, and CSV are allowed');
      }
      if (req.file.size > 20 * 1024 * 1024) {
        throw new Error('File size exceeds 20 MB limit');
      }
      return true;
    })
    .optional(),
  body('duplicateHandling')
    .isIn(['SKIP', 'UPDATE', 'REPLACE'])
    .withMessage('Invalid duplicate handling option'),
  body('validationOnly')
    .isBoolean()
    .withMessage('validationOnly must be boolean')
    .optional(),
];

const validateTeacherImportApproval = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
  body('action')
    .isIn(['APPROVE', 'REJECT'])
    .withMessage('Invalid action'),
  body('remarks')
    .isString()
    .trim()
    .optional(),
];

// Import History Validators
const validateGetImportHistory = [
  query('page')
    .isInt({ min: 1 })
    .withMessage('Invalid page number')
    .optional(),
  query('limit')
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit')
    .optional(),
  query('module')
    .isIn(['STUDENT', 'TEACHER', 'CLASS', 'SECTION', 'SESSION'])
    .withMessage('Invalid module')
    .optional(),
  query('status')
    .isIn(['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED', 'ROLLED_BACK'])
    .withMessage('Invalid status')
    .optional(),
  query('search')
    .isString()
    .trim()
    .optional(),
];

const validateGetImportById = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
];

// Rollback Import Validators
const validateRollbackImport = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
  body('reason')
    .notEmpty()
    .withMessage('Reason is required')
    .isString()
    .trim()
    .isLength({ min: 10 })
    .withMessage('Reason must be at least 10 characters'),
];

// Duplicate Detection Validators
const validateDuplicateCheck = [
  body('module')
    .isIn(['STUDENT', 'TEACHER'])
    .withMessage('Invalid module'),
  body('records')
    .isArray({ min: 1 })
    .withMessage('Records must be an array'),
  body('records.*.admissionNumber')
    .optional()
    .isString(),
  body('records.*.email')
    .optional()
    .isEmail(),
  body('records.*.mobile')
    .optional()
    .matches(/^[0-9]{10}$/)
    .withMessage('Invalid mobile number'),
  body('records.*.aadhaarNumber')
    .optional()
    .matches(/^[0-9]{12}$/)
    .withMessage('Invalid Aadhaar number'),
];

// File Validation Endpoints
const validateDownloadErrorReport = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
  query('format')
    .isIn(['xlsx', 'csv', 'pdf'])
    .withMessage('Invalid format')
    .optional(),
];

const validatePreviewImport = [
  param('importId').isMongoId().withMessage('Invalid import ID'),
  query('page')
    .isInt({ min: 1 })
    .withMessage('Invalid page number')
    .optional(),
  query('limit')
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit')
    .optional(),
];

// Export Validators
const validateStudentExport = [
  query('format')
    .isIn(['xlsx', 'csv', 'pdf'])
    .withMessage('Invalid format')
    .optional(),
  query('includePhotos')
    .isBoolean()
    .withMessage('Invalid includePhotos value')
    .optional(),
  query('includeArchived')
    .isBoolean()
    .withMessage('Invalid includeArchived value')
    .optional(),
  query('classId')
    .isMongoId()
    .withMessage('Invalid class ID')
    .optional(),
  query('sessionId')
    .isMongoId()
    .withMessage('Invalid session ID')
    .optional(),
  query('search')
    .isString()
    .trim()
    .optional(),
  query('fields')
    .custom((value) => {
      if (typeof value === 'string') {
        const allowedFields = [
          'admissionNumber',
          'rollNumber',
          'studentName',
          'gender',
          'dob',
          'fatherName',
          'motherName',
          'mobile',
          'email',
          'aadhaarNumber',
          'address',
          'className',
          'sectionName',
          'bloodGroup',
        ];
        const fields = value.split(',');
        return fields.every((f) => allowedFields.includes(f.trim()));
      }
      return true;
    })
    .optional(),
];

const validateTeacherExport = [
  query('format')
    .isIn(['xlsx', 'csv', 'pdf'])
    .withMessage('Invalid format')
    .optional(),
  query('includePhotos')
    .isBoolean()
    .withMessage('Invalid includePhotos value')
    .optional(),
  query('departmentId')
    .isMongoId()
    .withMessage('Invalid department ID')
    .optional(),
  query('search')
    .isString()
    .trim()
    .optional(),
];

const validateClassExport = [
  query('format')
    .isIn(['xlsx', 'csv', 'pdf'])
    .withMessage('Invalid format')
    .optional(),
  query('search')
    .isString()
    .trim()
    .optional(),
];

const validateSessionExport = [
  query('format')
    .isIn(['xlsx', 'csv', 'pdf'])
    .withMessage('Invalid format')
    .optional(),
];

// Photo Upload Validators
const validatePhotoUpload = [
  body('file')
    .custom((value, { req }) => {
      if (!req.file) {
        throw new Error('No file uploaded');
      }
      const allowedMimes = ['application/zip', 'application/x-zip-compressed'];
      if (!allowedMimes.includes(req.file.mimetype)) {
        throw new Error('Only ZIP files are allowed');
      }
      if (req.file.size > 500 * 1024 * 1024) {
        throw new Error('File size exceeds 500 MB limit');
      }
      return true;
    })
    .optional(),
  body('module')
    .isIn(['STUDENT', 'TEACHER'])
    .withMessage('Invalid module'),
  body('mappingType')
    .isIn(['AUTO', 'MANUAL', 'EXCEL'])
    .withMessage('Invalid mapping type'),
  body('mappingRules')
    .isObject()
    .withMessage('Invalid mapping rules')
    .optional(),
];

const validateBulkPhotoUpload = [
  body('files')
    .custom((value, { req }) => {
      if (!req.files || req.files.length === 0) {
        throw new Error('No files uploaded');
      }
      if (req.files.length > 1000) {
        throw new Error('Maximum 1000 files allowed per upload');
      }
      req.files.forEach((file) => {
        if (file.size > 5 * 1024 * 1024) {
          throw new Error(`File ${file.originalname} exceeds 5 MB limit`);
        }
      });
      return true;
    })
    .optional(),
  body('module')
    .isIn(['STUDENT', 'TEACHER'])
    .withMessage('Invalid module'),
  body('mappings')
    .isObject()
    .withMessage('Invalid mappings')
    .optional(),
];

const validatePhotoMapping = [
  param('photoId').isMongoId().withMessage('Invalid photo ID'),
  body('linkedToId')
    .isMongoId()
    .withMessage('Invalid linked to ID'),
  body('linkedToIdentifier')
    .notEmpty()
    .withMessage('Linked to identifier is required'),
  body('matchType')
    .isIn(['ADMISSION_NUMBER', 'TEACHER_CODE', 'EMPLOYEE_ID', 'MANUAL'])
    .withMessage('Invalid match type'),
];

const validateDeletePhoto = [
  param('photoId').isMongoId().withMessage('Invalid photo ID'),
];

const validatePhotoGallery = [
  query('module')
    .isIn(['STUDENT', 'TEACHER'])
    .withMessage('Invalid module'),
  query('page')
    .isInt({ min: 1 })
    .withMessage('Invalid page number')
    .optional(),
  query('limit')
    .isInt({ min: 1, max: 100 })
    .withMessage('Invalid limit')
    .optional(),
  query('entityId')
    .isMongoId()
    .withMessage('Invalid entity ID')
    .optional(),
];

// Validation error handler
const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map((err) => ({
        field: err.param,
        message: err.msg,
      })),
    });
  }
  next();
};

module.exports = {
  validateStudentImport,
  validateStudentImportApproval,
  validateTeacherImport,
  validateTeacherImportApproval,
  validateGetImportHistory,
  validateGetImportById,
  validateRollbackImport,
  validateDuplicateCheck,
  validateDownloadErrorReport,
  validatePreviewImport,
  validateStudentExport,
  validateTeacherExport,
  validateClassExport,
  validateSessionExport,
  validatePhotoUpload,
  validateBulkPhotoUpload,
  validatePhotoMapping,
  validateDeletePhoto,
  validatePhotoGallery,
  handleValidationErrors,
};
