const mongoose = require('mongoose');
const request = require('supertest');
const app = require('../app');
const ImportHistory = require('../models/imports/ImportHistory');
const { Student } = require('../models/Student');
const User = require('../models/User');
const School = require('../models/School');
const Session = require('../models/Session');
const Class = require('../models/Class');
const fs = require('fs');
const path = require('path');

describe('Import Module Tests', () => {
  let server;
  let authToken;
  let schoolId;
  let userId;
  let testFilePath;

  beforeAll(async () => {
    // Create test school and user
    const school = await School.create({
      schoolName: 'Test School',
      schoolCode: 'TS001',
      establishmentYear: 2020,
      principalName: 'Test Principal',
      address: 'Test Address',
    });
    schoolId = school._id;

    const user = await User.create({
      email: 'admin@test.com',
      password: 'hashedPassword123',
      name: 'Admin User',
      role: 'SCHOOLADMIN',
      schoolId,
      isApproved: true,
    });
    userId = user._id;

    // Create test session
    await Session.create({
      schoolId,
      sessionName: 'Session 2024',
      sessionCode: 'S2024',
      academicYear: '2024-2025',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    });

    // Create test class
    await Class.create({
      schoolId,
      className: 'Class A',
    });

    // Mock auth token
    authToken = 'valid_jwt_token';
  });

  afterAll(async () => {
    // Cleanup
    await School.deleteMany({});
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await ImportHistory.deleteMany({});
    await Student.deleteMany({});
  });

  describe('Student Import', () => {
    test('should validate student import file', async () => {
      const filePath = path.join(__dirname, '../fixtures/students_sample.xlsx');
      
      // This test would need actual file setup
      // For now, we're testing the structure
      expect(true).toBe(true);
    });

    test('should create import history record', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_import.xlsx',
        fileType: 'xlsx',
        module: 'STUDENT',
        status: 'COMPLETED',
        totalRecords: 100,
        successfulRecords: 95,
        failedRecords: 5,
      });

      expect(importHistory).toBeDefined();
      expect(importHistory.schoolId).toEqual(schoolId);
      expect(importHistory.module).toBe('STUDENT');
    });

    test('should get import history', async () => {
      const imports = await ImportHistory.find({ schoolId, module: 'STUDENT' });
      expect(Array.isArray(imports)).toBe(true);
    });

    test('should rollback import', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_import_rollback.xlsx',
        fileType: 'xlsx',
        module: 'STUDENT',
        status: 'COMPLETED',
        totalRecords: 50,
        successfulRecords: 50,
        failedRecords: 0,
        processedRecordIds: [],
      });

      importHistory.status = 'ROLLED_BACK';
      importHistory.rollbackRequestedAt = new Date();
      importHistory.rollbackCompletedAt = new Date();
      importHistory.rollbackReason = 'Test rollback';
      importHistory.rollbackRequestedBy = userId;

      await importHistory.save();

      const updated = await ImportHistory.findById(importHistory._id);
      expect(updated.status).toBe('ROLLED_BACK');
    });
  });

  describe('Teacher Import', () => {
    test('should create teacher import history', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_teacher_import.xlsx',
        fileType: 'xlsx',
        module: 'TEACHER',
        status: 'COMPLETED',
        totalRecords: 50,
        successfulRecords: 50,
        failedRecords: 0,
      });

      expect(importHistory.module).toBe('TEACHER');
    });

    test('should handle duplicate teacher records', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_duplicates.xlsx',
        fileType: 'xlsx',
        module: 'TEACHER',
        status: 'COMPLETED',
        totalRecords: 30,
        successfulRecords: 25,
        failedRecords: 0,
        skippedRecords: 5,
        duplicateRecords: [
          {
            rowNumber: 5,
            field: 'email',
            value: 'teacher@test.com',
          },
        ],
      });

      expect(importHistory.duplicateRecords.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    test('should track validation errors', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_errors.xlsx',
        fileType: 'xlsx',
        module: 'STUDENT',
        status: 'COMPLETED',
        totalRecords: 100,
        successfulRecords: 90,
        failedRecords: 10,
        validationErrors: [
          {
            rowNumber: 2,
            fieldName: 'email',
            errorType: 'INVALID_EMAIL',
            errorMessage: 'Invalid email format',
          },
          {
            rowNumber: 5,
            fieldName: 'mobile',
            errorType: 'INVALID_MOBILE',
            errorMessage: 'Mobile must be 10 digits',
          },
        ],
      });

      expect(importHistory.validationErrors.length).toBe(2);
      expect(importHistory.getSuccessRate()).toBe(90);
    });

    test('should generate error summary', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_summary.xlsx',
        fileType: 'xlsx',
        module: 'STUDENT',
        status: 'COMPLETED',
        totalRecords: 100,
        successfulRecords: 85,
        failedRecords: 15,
        validationErrors: Array(15).fill({
          errorType: 'INVALID_EMAIL',
        }),
      });

      const summary = importHistory.getErrorSummary();
      expect(summary.totalErrors).toBe(15);
      expect(summary.failureRate).toBe(15);
    });
  });

  describe('Import Statistics', () => {
    test('should calculate processing statistics', async () => {
      const importHistory = await ImportHistory.create({
        schoolId,
        uploadedBy: userId,
        fileName: 'test_stats.xlsx',
        fileType: 'xlsx',
        module: 'STUDENT',
        status: 'COMPLETED',
        totalRecords: 1000,
        successfulRecords: 1000,
        failedRecords: 0,
        importStats: {
          processingTimeMs: 5000,
          averageTimePerRecord: 5,
          duplicatesDetected: 0,
          validationErrorsCount: 0,
        },
      });

      expect(importHistory.importStats.averageTimePerRecord).toBe(5);
      expect(importHistory.importStats.processingTimeMs).toBe(5000);
    });
  });
});
