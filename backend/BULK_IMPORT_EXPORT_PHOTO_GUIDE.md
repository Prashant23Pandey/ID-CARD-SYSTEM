# Bulk Import, Export & Photo Management Module

## Overview

This module provides comprehensive functionality for bulk importing students/teachers, exporting records in multiple formats, and managing bulk photo uploads with automatic linking.

## Features

### Bulk Import
- **Excel/CSV Support**: Import students and teachers from XLSX, XLS, or CSV files
- **Validation Engine**: Real-time validation with detailed error reporting
- **Duplicate Detection**: Identify and handle duplicate records intelligently
- **Transactional Processing**: Atomic operations with rollback capability
- **Large Scale**: Support for 50,000+ records per import
- **Error Reports**: Download validation errors in Excel/CSV format
- **Import History**: Track all imports with metadata and statistics

### Bulk Export
- **Multiple Formats**: Excel (XLSX), CSV, PDF export
- **Flexible Filtering**: Filter by class, session, department, search term
- **Field Selection**: Choose which columns to export
- **Large Scale**: Export 50,000+ records in seconds
- **Compression**: Automatic compression for large exports
- **Export History**: Track all exports with file metadata

### Photo Management
- **Bulk Upload**: ZIP file upload with automatic extraction
- **Auto-Mapping**: Automatic linking to students/teachers by admission/employee ID
- **Manual Mapping**: Override automatic matching when needed
- **Image Processing**: Automatic compression and thumbnail generation
- **Storage Abstraction**: Support for Local, AWS S3, and Cloudinary
- **Quality Preservation**: Configurable compression quality (default 80%)
- **Batch Tracking**: Track each upload batch with detailed statistics

---

## API Endpoints

### Import Endpoints

#### Upload Student Import
```http
POST /api/v1/imports/students/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: <XLSX/CSV file>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "importId": "507f1f77bcf86cd799439011",
    "totalRecords": 1000,
    "validRecords": 950,
    "errorRecords": 40,
    "skippedRecords": 10,
    "processingTime": 2500
  }
}
```

#### Approve Student Import
```http
POST /api/v1/imports/students/{importId}/approve
Authorization: Bearer {token}

Body:
{
  "action": "APPROVE",
  "duplicateHandling": "SKIP" // SKIP | UPDATE | REPLACE
}
```

#### Upload Teacher Import
```http
POST /api/v1/imports/teachers/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: <XLSX/CSV file>
```

#### Approve Teacher Import
```http
POST /api/v1/imports/teachers/{importId}/approve
Authorization: Bearer {token}

Body:
{
  "action": "APPROVE",
  "duplicateHandling": "SKIP"
}
```

#### Get Import History
```http
GET /api/v1/imports/history?module=STUDENT&status=COMPLETED&page=1&limit=10
Authorization: Bearer {token}
```

#### Get Import By ID
```http
GET /api/v1/imports/{importId}
Authorization: Bearer {token}
```

#### Rollback Import
```http
POST /api/v1/imports/{importId}/rollback
Authorization: Bearer {token}

Body:
{
  "reason": "Incorrect data in import, need to re-process"
}
```

#### Download Error Report
```http
GET /api/v1/imports/{importId}/error-report?format=xlsx
Authorization: Bearer {token}
```

#### Preview Import
```http
GET /api/v1/imports/{importId}/preview?page=1&limit=20
Authorization: Bearer {token}
```

### Export Endpoints

#### Export Students
```http
GET /api/v1/exports/students?format=xlsx&classId={classId}&includePhotos=true
Authorization: Bearer {token}
```

**Query Parameters:**
- `format`: xlsx, csv, pdf (default: xlsx)
- `classId`: Optional class filter
- `sessionId`: Optional session filter
- `search`: Search term for name/email
- `status`: ACTIVE | ALL (default: ACTIVE)

**Response:**
```json
{
  "success": true,
  "data": {
    "fileName": "students_export_1704067200000.xlsx",
    "fileUrl": "/uploads/students_export_1704067200000.xlsx",
    "totalRecords": 500,
    "exportId": "507f1f77bcf86cd799439011"
  }
}
```

#### Export Teachers
```http
GET /api/v1/exports/teachers?format=xlsx&departmentId={deptId}
Authorization: Bearer {token}
```

#### Export Classes
```http
GET /api/v1/exports/classes?format=xlsx
Authorization: Bearer {token}
```

#### Export Sessions
```http
GET /api/v1/exports/sessions?format=xlsx
Authorization: Bearer {token}
```

#### Get Export History
```http
GET /api/v1/exports/history?module=STUDENT&page=1&limit=10
Authorization: Bearer {token}
```

#### Download Export File
```http
GET /api/v1/exports/{exportId}/download
Authorization: Bearer {token}
```

### Photo Endpoints

#### Upload Photos (ZIP)
```http
POST /api/v1/photos/upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- file: <ZIP file containing photos>
- module: STUDENT | TEACHER
- mappingType: AUTO | MANUAL | EXCEL (default: AUTO)
```

**Response:**
```json
{
  "success": true,
  "data": {
    "batchId": "batch_1704067200000",
    "totalPhotos": 1000,
    "successfulMappings": 950,
    "failedMappings": 50,
    "unmappedCount": 10,
    "mappingSuccessRate": "95.00"
  }
}
```

#### Bulk Upload Photos
```http
POST /api/v1/photos/bulk-upload
Content-Type: multipart/form-data
Authorization: Bearer {token}

Body:
- files: <Multiple image files>
- module: STUDENT | TEACHER
```

#### Map Photo Manually
```http
POST /api/v1/photos/{photoId}/map
Authorization: Bearer {token}

Body:
{
  "linkedToId": "507f1f77bcf86cd799439011",
  "linkedToIdentifier": "STU001",
  "matchType": "MANUAL"
}
```

#### Delete Photo
```http
POST /api/v1/photos/{photoId}/delete
Authorization: Bearer {token}

Body:
{
  "photoFileName": "STU001.jpg"
}
```

#### Get Photo Gallery
```http
GET /api/v1/photos/gallery?module=STUDENT&page=1&limit=20
Authorization: Bearer {token}
```

#### Get Entity Photos
```http
GET /api/v1/photos/entity/{entityId}?module=STUDENT
Authorization: Bearer {token}
```

#### Get Upload Summary
```http
GET /api/v1/photos/summary/{batchId}
Authorization: Bearer {token}
```

#### Get Photo Upload History
```http
GET /api/v1/photos/history?module=STUDENT&status=COMPLETED
Authorization: Bearer {token}
```

---

## Data Models

### ImportHistory
```javascript
{
  schoolId: ObjectId,
  uploadedBy: ObjectId,
  fileName: String,
  fileType: String, // xlsx, xls, csv
  module: String, // STUDENT, TEACHER, CLASS, SECTION, SESSION
  status: String, // PENDING, PROCESSING, COMPLETED, FAILED, ROLLED_BACK
  totalRecords: Number,
  successfulRecords: Number,
  failedRecords: Number,
  skippedRecords: Number,
  validationErrors: Array,
  duplicateRecords: Array,
  warnings: Array,
  filePath: String,
  errorFileUrl: String,
  processedRecordIds: [ObjectId],
  importStats: {
    processingTimeMs: Number,
    averageTimePerRecord: Number,
    duplicatesDetected: Number,
    validationErrorsCount: Number
  },
  rollbackRequestedAt: Date,
  rollbackCompletedAt: Date,
  rollbackReason: String,
  rollbackRequestedBy: ObjectId,
  createdAt: Date,
  updatedAt: Date
}
```

### PhotoUpload
```javascript
{
  schoolId: ObjectId,
  uploadedBy: ObjectId,
  module: String, // STUDENT, TEACHER
  batchId: String,
  fileName: String,
  fileType: String,
  status: String, // UPLOADED, PROCESSING, COMPLETED, FAILED, PARTIAL
  totalPhotos: Number,
  successfulMappings: Number,
  failedMappings: Number,
  unmappedPhotos: Number,
  photoMappings: [{
    photoPath: String,
    fileName: String,
    linkedTo: String,
    linkedToId: ObjectId,
    linkedToIdentifier: String,
    matchType: String, // ADMISSION_NUMBER, TEACHER_CODE, MANUAL, AUTO
    photoS3Url: String,
    photoCloudinaryUrl: String,
    thumbnailUrl: String,
    metadata: {
      width: Number,
      height: Number,
      format: String,
      quality: Number,
      originalSize: Number,
      compressedSize: Number
    }
  }],
  unmappedPhotos: [{
    fileName: String,
    reason: String,
    suggestedMatch: String
  }],
  errors: Array,
  zipFilePath: String,
  extractedFolderPath: String,
  storageProvider: String, // LOCAL, AWS_S3, CLOUDINARY
  storagePath: String,
  mappingRules: Object,
  createdAt: Date,
  updatedAt: Date
}
```

### ExportHistory
```javascript
{
  schoolId: ObjectId,
  exportedBy: ObjectId,
  module: String, // STUDENT, TEACHER, CLASS, SESSION
  format: String, // xlsx, csv, pdf
  status: String, // PENDING, PROCESSING, COMPLETED, FAILED
  totalRecords: Number,
  exportedRecords: Number,
  filters: Object,
  selectedFields: Array,
  fileName: String,
  fileUrl: String,
  filePath: String,
  fileSize: Number,
  downloadUrl: String,
  expiresAt: Date,
  includePhotos: Boolean,
  includeArchived: Boolean,
  dateRange: Object,
  processingTimeMs: Number,
  recordsPerSecond: Number,
  completedAt: Date,
  createdAt: Date,
  updatedAt: Date
}
```

---

## File Format Requirements

### Student Import Columns (Required)
- Admission Number (required)
- Student Name (required)
- Class Name (required)
- Roll Number (optional)
- Gender (optional)
- Date of Birth (optional)
- Father Name (optional)
- Mother Name (optional)
- Mobile (optional, 10 digits)
- Email (optional)
- Aadhaar Number (optional, 12 digits)
- Address (optional)
- Section (optional)
- Session (optional)
- Blood Group (optional)

### Teacher Import Columns (Required)
- Teacher Code (required)
- Name (required)
- Employee ID (optional)
- Gender (optional)
- Date of Birth (optional)
- Qualification (optional)
- Experience (optional, 0-70)
- Email (optional)
- Mobile (optional, 10 digits)
- Aadhaar (optional, 12 digits)
- PAN (optional, format: 5 letters + 4 digits + 1 letter)
- Department (optional)
- Designation (optional)
- Joining Date (optional)
- Class Assignment (optional, comma-separated)

### Photo Naming Convention
- Students: `{AdmissionNumber}.{ext}` (e.g., STU001.jpg)
- Teachers: `{TeacherCode}.{ext}` (e.g., TCH001.jpg)

---

## Error Handling

### Common Errors

#### Invalid File Format
```json
{
  "success": false,
  "message": "Only XLSX, XLS, and CSV files are allowed"
}
```

#### File Size Exceeded
```json
{
  "success": false,
  "message": "File size exceeds 20MB limit"
}
```

#### Validation Errors
```json
{
  "success": false,
  "data": {
    "validationErrors": [
      {
        "rowNumber": 2,
        "fieldName": "email",
        "errorType": "INVALID_EMAIL",
        "errorMessage": "Invalid email format",
        "value": "invalidemail"
      }
    ]
  }
}
```

#### Duplicate Detection
```json
{
  "success": true,
  "data": {
    "duplicateRecords": [
      {
        "rowNumber": 5,
        "field": "admissionNumber",
        "value": "STU001",
        "duplicateOf": "507f1f77bcf86cd799439011"
      }
    ]
  }
}
```

---

## Usage Examples

### Example 1: Import Students

```bash
# Upload file
curl -X POST http://localhost:3000/api/v1/imports/students/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@students.xlsx"

# Response:
# {
#   "importId": "507f1f77bcf86cd799439011",
#   "totalRecords": 1000,
#   "validRecords": 950,
#   "errorRecords": 40,
#   "skippedRecords": 10
# }

# Approve import
curl -X POST http://localhost:3000/api/v1/imports/students/507f1f77bcf86cd799439011/approve \
  -H "Authorization: Bearer {token}" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "APPROVE",
    "duplicateHandling": "SKIP"
  }'
```

### Example 2: Export Students

```bash
curl -X GET "http://localhost:3000/api/v1/exports/students?format=xlsx&classId=classId123" \
  -H "Authorization: Bearer {token}"

# Response:
# {
#   "success": true,
#   "data": {
#     "fileName": "students_export_1704067200000.xlsx",
#     "fileUrl": "/uploads/students_export_1704067200000.xlsx",
#     "totalRecords": 500
#   }
# }

# Download file
curl "http://localhost:3000/uploads/students_export_1704067200000.xlsx" \
  -o students_export.xlsx
```

### Example 3: Upload Photos

```bash
# Prepare ZIP with photos named as admission numbers
zip student_photos.zip STU001.jpg STU002.jpg STU003.jpg ...

# Upload ZIP
curl -X POST http://localhost:3000/api/v1/photos/upload \
  -H "Authorization: Bearer {token}" \
  -F "file=@student_photos.zip" \
  -F "module=STUDENT" \
  -F "mappingType=AUTO"

# Response:
# {
#   "success": true,
#   "data": {
#     "batchId": "batch_1704067200000",
#     "totalPhotos": 1000,
#     "successfulMappings": 950,
#     "failedMappings": 50
#   }
# }
```

---

## Performance Considerations

### Large Import Optimization
- Imports are processed in **transactions** for data consistency
- Validation happens **before** database operations
- Duplicate detection uses **indexed fields** for speed
- Supports **50,000+ records** per import

### Large Export Optimization
- Exports use **streaming** for memory efficiency
- Records are **paginated** in database queries
- Files are **compressed** automatically
- Export file expires after **7 days** (configurable)

### Photo Processing Optimization
- Photos are **compressed** to 80% quality (configurable)
- **Thumbnails** generated automatically (200x250px)
- **ZIP extraction** streams to avoid memory overflow
- **Auto-mapping** uses indexed queries for speed

### Database Indexes
```javascript
// ImportHistory indexes
{ schoolId: 1, createdAt: -1 }
{ schoolId: 1, status: 1 }
{ schoolId: 1, module: 1, createdAt: -1 }
{ uploadedBy: 1, createdAt: -1 }

// PhotoUpload indexes
{ schoolId: 1, module: 1, status: 1 }
{ batchId: 1 }

// ExportHistory indexes
{ schoolId: 1, format: 1, createdAt: -1 }
{ exportedBy: 1, createdAt: -1 }
```

---

## Security Considerations

1. **Authentication**: All endpoints require JWT authentication
2. **Authorization**: Role-based access control (SUPERADMIN, SCHOOLADMIN, TEACHER)
3. **School Isolation**: Every query filtered by schoolId (multi-tenant)
4. **File Validation**: File type and size validated on upload
5. **Input Sanitization**: All inputs sanitized against XSS/NoSQL injection
6. **Rate Limiting**: Import/export operations rate-limited per user
7. **Audit Trail**: All operations logged with user ID and timestamp
8. **Soft Deletes**: Rollback preserves audit trail via soft deletes

---

## Configuration

### Environment Variables
```bash
# Upload directory
UPLOAD_DIR=./uploads

# Max file sizes
MAX_IMPORT_SIZE=20971520 # 20MB
MAX_PHOTO_SIZE=5242880 # 5MB
MAX_ZIP_SIZE=524288000 # 500MB

# Compression quality
PHOTO_COMPRESSION_QUALITY=80 # 0-100

# Storage provider
STORAGE_PROVIDER=LOCAL # LOCAL | AWS_S3 | CLOUDINARY

# AWS S3 (if using S3)
AWS_S3_BUCKET=
AWS_S3_REGION=
AWS_ACCESS_KEY_ID=
AWS_SECRET_ACCESS_KEY=

# Cloudinary (if using Cloudinary)
CLOUDINARY_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
```

---

## Troubleshooting

### Import Fails with "Too many records"
- Increase server memory
- Split import into smaller batches (<10,000 records)
- Increase transaction timeout in MongoDB

### Photos Not Mapping Automatically
- Verify file names match exactly (case-sensitive)
- Check admission number/teacher code in database
- Review unmapped photos list for naming patterns

### Export Performance Slow
- Reduce number of records with filters
- Disable photo inclusion
- Increase export timeout

### File Upload Size Errors
- Verify file size within limits (20MB imports, 5MB photos, 500MB ZIP)
- Check `MAX_UPLOAD_SIZE` in multer configuration
- Verify server has sufficient disk space

---

## Future Enhancements

- [ ] PDF export with formatted ID cards
- [ ] Batch export scheduling
- [ ] Photo auto-enhancement (brightness, contrast)
- [ ] Duplicate smart merge
- [ ] Email notifications for import completion
- [ ] Webhook support for external integrations
- [ ] GraphQL API for imports/exports
- [ ] Real-time import progress via WebSocket
- [ ] Advanced photo matching algorithms
- [ ] Custom field mapping templates
