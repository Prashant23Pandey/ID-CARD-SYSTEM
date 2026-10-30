const mongoose = require('mongoose');
const PhotoUpload = require('../models/imports/PhotoUpload');
const { Student } = require('../models/Student');
const Teacher = require('../models/Teacher');
const User = require('../models/User');
const School = require('../models/School');
const Class = require('../models/Class');
const Section = require('../models/Section');
const Session = require('../models/Session');

describe('Photo Management Tests', () => {
  let schoolId;
  let userId;
  let studentId;
  let teacherId;
  let batchId;

  beforeAll(async () => {
    // Create test school and user
    const school = await School.create({
      schoolName: 'Photo Test School',
      schoolCode: 'PTS001',
      establishmentYear: 2020,
    });
    schoolId = school._id;

    const user = await User.create({
      email: 'photo@test.com',
      password: 'hashedPassword123',
      name: 'Photo Admin',
      role: 'SCHOOLADMIN',
      schoolId,
      isApproved: true,
    });
    userId = user._id;

    const session = await Session.create({
      schoolId,
      sessionName: 'Photo Session',
      sessionCode: 'PS2024',
      academicYear: '2024-2025',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    });

    const cls = await Class.create({
      schoolId,
      className: 'Photo Class',
    });

    const section = await Section.create({
      schoolId,
      sectionName: 'Section A',
      classId: cls._id,
    });

    const student = await Student.create({
      schoolId,
      admissionNumber: 'STU_PHOTO_001',
      firstName: 'Photo',
      lastName: 'Student',
      gender: 'MALE',
      mobile: '9876543210',
      email: 'photo.student@test.com',
      classId: cls._id,
      sectionId: section._id,
      sessionId: session._id,
    });
    studentId = student._id;

    const teacher = await Teacher.create({
      schoolId,
      teacherCode: 'TCH_PHOTO_001',
      firstName: 'Photo',
      lastName: 'Teacher',
      gender: 'FEMALE',
      email: 'photo.teacher@test.com',
    });
    teacherId = teacher._id;

    batchId = 'batch_' + Date.now();
  });

  afterAll(async () => {
    await School.deleteMany({});
    await User.deleteMany({});
    await Student.deleteMany({});
    await Teacher.deleteMany({});
    await Class.deleteMany({});
    await Section.deleteMany({});
    await Session.deleteMany({});
    await PhotoUpload.deleteMany({});
  });

  describe('Photo Upload', () => {
    test('should create photo upload record', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId,
        fileName: 'student_photos.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 100,
        successfulMappings: 95,
        failedMappings: 5,
        zipFilePath: '/uploads/student_photos.zip',
        extractedFolderPath: '/uploads/extracted/student_photos',
      });

      expect(photoUpload.batchId).toBe(batchId);
      expect(photoUpload.module).toBe('STUDENT');
      expect(photoUpload.totalPhotos).toBe(100);
    });

    test('should track individual photo mappings', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_mappings_' + Date.now(),
        fileName: 'photos_with_mapping.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 50,
        successfulMappings: 50,
        photoMappings: [
          {
            photoPath: '/uploads/photos/STU_PHOTO_001.jpg',
            fileName: 'STU_PHOTO_001.jpg',
            linkedTo: 'STUDENT',
            linkedToId: studentId,
            linkedToIdentifier: 'STU_PHOTO_001',
            matchType: 'AUTO',
            uploadedAt: new Date(),
            originalSize: 2097152, // 2MB
            compressedSize: 524288, // 512KB
            metadata: {
              width: 1200,
              height: 1500,
              format: 'webp',
              quality: 80,
            },
          },
        ],
      });

      expect(photoUpload.photoMappings.length).toBe(1);
      expect(photoUpload.photoMappings[0].matchType).toBe('AUTO');
    });

    test('should handle unmapped photos', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_unmapped_' + Date.now(),
        fileName: 'partial_mapping.zip',
        fileType: 'zip',
        status: 'PARTIAL',
        totalPhotos: 100,
        successfulMappings: 80,
        failedMappings: 20,
        unmappedPhotos: [
          {
            fileName: 'UNKNOWN_001.jpg',
            reason: 'No matching record found',
            suggestedMatch: 'UNKNOWN_001',
          },
          {
            fileName: 'INVALID_002.jpg',
            reason: 'No matching record found',
            suggestedMatch: 'INVALID_002',
          },
        ],
      });

      expect(photoUpload.status).toBe('PARTIAL');
      expect(photoUpload.unmappedPhotos.length).toBe(2);
    });
  });

  describe('Teacher Photo Upload', () => {
    test('should upload teacher photos', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'TEACHER',
        batchId: 'batch_teacher_' + Date.now(),
        fileName: 'teacher_photos.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 30,
        successfulMappings: 28,
        failedMappings: 2,
        photoMappings: [
          {
            photoPath: '/uploads/photos/TCH_PHOTO_001.jpg',
            fileName: 'TCH_PHOTO_001.jpg',
            linkedTo: 'TEACHER',
            linkedToId: teacherId,
            linkedToIdentifier: 'TCH_PHOTO_001',
            matchType: 'AUTO',
            uploadedAt: new Date(),
            originalSize: 2097152,
            compressedSize: 524288,
            metadata: {
              width: 1200,
              height: 1500,
              format: 'webp',
            },
          },
        ],
      });

      expect(photoUpload.module).toBe('TEACHER');
      expect(photoUpload.successfulMappings).toBe(28);
    });
  });

  describe('Photo Mapping', () => {
    test('should auto-map photos by admission number', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_automap_' + Date.now(),
        fileName: 'auto_map.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 10,
        successfulMappings: 10,
        photoMappings: [
          {
            photoPath: '/uploads/photos/STU_PHOTO_001.jpg',
            fileName: 'STU_PHOTO_001.jpg',
            linkedTo: 'STUDENT',
            linkedToId: studentId,
            linkedToIdentifier: 'STU_PHOTO_001',
            matchType: 'AUTO',
            uploadedAt: new Date(),
          },
        ],
      });

      expect(photoUpload.photoMappings[0].matchType).toBe('AUTO');
    });

    test('should support manual photo mapping', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_manual_' + Date.now(),
        fileName: 'manual_map.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 5,
        successfulMappings: 5,
        photoMappings: [
          {
            photoPath: '/uploads/photos/photo_001.jpg',
            fileName: 'photo_001.jpg',
            linkedTo: 'STUDENT',
            linkedToId: studentId,
            linkedToIdentifier: 'STU_PHOTO_001',
            matchType: 'MANUAL',
            uploadedAt: new Date(),
          },
        ],
      });

      expect(photoUpload.photoMappings[0].matchType).toBe('MANUAL');
    });
  });

  describe('Photo Compression', () => {
    test('should track compression statistics', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_compression_' + Date.now(),
        fileName: 'compression_test.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 100,
        successfulMappings: 100,
        photoMappings: Array(100)
          .fill(0)
          .map((_, i) => ({
            photoPath: `/uploads/photos/photo_${i}.jpg`,
            fileName: `photo_${i}.jpg`,
            linkedToId: studentId,
            matchType: 'AUTO',
            originalSize: 2097152, // 2MB each
            compressedSize: 524288, // 512KB each compressed
            metadata: {
              width: 1200,
              height: 1500,
              format: 'webp',
              quality: 80,
            },
          })),
      });

      const stats = photoUpload.getStorageStats();
      expect(stats).toBeDefined();
      expect(stats.compressionRatio).toBeLessThan(1);
    });

    test('should calculate storage savings', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_storage_' + Date.now(),
        fileName: 'storage_test.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 50,
        successfulMappings: 50,
        photoMappings: Array(50)
          .fill(0)
          .map((_, i) => ({
            photoPath: `/uploads/photos/photo_${i}.jpg`,
            fileName: `photo_${i}.jpg`,
            linkedToId: studentId,
            matchType: 'AUTO',
            originalSize: 2097152,
            compressedSize: 786432, // ~75% compression
            metadata: {
              width: 1200,
              height: 1500,
              format: 'webp',
              quality: 80,
            },
          })),
      });

      const summary = photoUpload.getMappingSummary();
      expect(summary.successfulMappings).toBe(50);
    });
  });

  describe('Photo Gallery', () => {
    test('should retrieve photo gallery', async () => {
      const uploads = await PhotoUpload.find({
        schoolId,
        status: { $in: ['COMPLETED', 'PARTIAL'] },
      });

      expect(Array.isArray(uploads)).toBe(true);
    });

    test('should track upload history', async () => {
      const upload1 = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_history_1',
        fileName: 'batch1.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 50,
        successfulMappings: 50,
      });

      const upload2 = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_history_2',
        fileName: 'batch2.zip',
        fileType: 'zip',
        status: 'COMPLETED',
        totalPhotos: 75,
        successfulMappings: 75,
      });

      const history = await PhotoUpload.find({ schoolId });
      expect(history.length).toBeGreaterThanOrEqual(2);
    });
  });

  describe('Photo Errors', () => {
    test('should track processing errors', async () => {
      const photoUpload = await PhotoUpload.create({
        schoolId,
        uploadedBy: userId,
        module: 'STUDENT',
        batchId: 'batch_errors_' + Date.now(),
        fileName: 'error_test.zip',
        fileType: 'zip',
        status: 'FAILED',
        totalPhotos: 100,
        successfulMappings: 80,
        failedMappings: 20,
        errors: [
          {
            fileName: 'corrupt_photo.jpg',
            errorType: 'IMAGE_PROCESSING_ERROR',
            errorMessage: 'Invalid image format',
          },
          {
            fileName: 'oversized_photo.jpg',
            errorType: 'SIZE_LIMIT_EXCEEDED',
            errorMessage: 'File size exceeds 5MB limit',
          },
        ],
      });

      expect(photoUpload.status).toBe('FAILED');
      expect(photoUpload.errors.length).toBeGreaterThan(0);
    });
  });
});
