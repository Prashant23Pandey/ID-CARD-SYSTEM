const mongoose = require('mongoose');
const ExportHistory = require('../models/imports/ExportHistory');
const { Student } = require('../models/Student');
const User = require('../models/User');
const School = require('../models/School');
const Class = require('../models/Class');
const Session = require('../models/Session');

describe('Export Module Tests', () => {
  let schoolId;
  let userId;
  let studentId;

  beforeAll(async () => {
    // Create test data
    const school = await School.create({
      schoolName: 'Export Test School',
      schoolCode: 'ETS001',
      establishmentYear: 2020,
    });
    schoolId = school._id;

    const user = await User.create({
      email: 'export@test.com',
      password: 'hashedPassword123',
      name: 'Export Admin',
      role: 'SCHOOLADMIN',
      schoolId,
      isApproved: true,
    });
    userId = user._id;

    const session = await Session.create({
      schoolId,
      sessionName: 'Export Session',
      sessionCode: 'ES2024',
      academicYear: '2024-2025',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-12-31'),
      isActive: true,
    });

    const cls = await Class.create({
      schoolId,
      className: 'Export Class',
    });

    const student = await Student.create({
      schoolId,
      admissionNumber: 'STU001',
      firstName: 'Export',
      lastName: 'Student',
      gender: 'MALE',
      mobile: '9876543210',
      email: 'student@test.com',
      classId: cls._id,
      sessionId: session._id,
    });
    studentId = student._id;
  });

  afterAll(async () => {
    await School.deleteMany({});
    await User.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await Student.deleteMany({});
    await ExportHistory.deleteMany({});
  });

  describe('Student Export', () => {
    test('should create Excel export history', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 100,
        exportedRecords: 100,
        fileName: 'students_export.xlsx',
        fileUrl: '/uploads/students_export.xlsx',
        filePath: '/uploads/students_export.xlsx',
        fileSize: 1024000,
        completedAt: new Date(),
      });

      expect(exportHistory.format).toBe('xlsx');
      expect(exportHistory.status).toBe('COMPLETED');
    });

    test('should create CSV export history', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'csv',
        status: 'COMPLETED',
        totalRecords: 50,
        exportedRecords: 50,
        fileName: 'students_export.csv',
        fileUrl: '/uploads/students_export.csv',
        filePath: '/uploads/students_export.csv',
        fileSize: 512000,
        completedAt: new Date(),
      });

      expect(exportHistory.format).toBe('csv');
    });

    test('should filter exports by status', async () => {
      await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'PROCESSING',
        totalRecords: 100,
        exportedRecords: 0,
      });

      const completed = await ExportHistory.find({ schoolId, status: 'COMPLETED' });
      const processing = await ExportHistory.find({ schoolId, status: 'PROCESSING' });

      expect(completed.length).toBeGreaterThan(0);
      expect(processing.length).toBeGreaterThan(0);
    });
  });

  describe('Teacher Export', () => {
    test('should create teacher export', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'TEACHER',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 50,
        exportedRecords: 50,
        fileName: 'teachers_export.xlsx',
        fileUrl: '/uploads/teachers_export.xlsx',
        filePath: '/uploads/teachers_export.xlsx',
        completedAt: new Date(),
      });

      expect(exportHistory.module).toBe('TEACHER');
    });
  });

  describe('Export History', () => {
    test('should track export metadata', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 1000,
        exportedRecords: 1000,
        fileName: 'large_export.xlsx',
        fileUrl: '/uploads/large_export.xlsx',
        filePath: '/uploads/large_export.xlsx',
        fileSize: 5242880, // 5MB
        processingTimeMs: 2500,
        recordsPerSecond: 400,
        completedAt: new Date(),
        filters: {
          classId: 'class_id_here',
          status: 'ACTIVE',
        },
      });

      expect(exportHistory.fileSize).toBe(5242880);
      expect(exportHistory.recordsPerSecond).toBe(400);
    });

    test('should handle partial exports', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 100,
        exportedRecords: 95,
        skippedRecords: 5,
        fileName: 'partial_export.xlsx',
        fileUrl: '/uploads/partial_export.xlsx',
        filePath: '/uploads/partial_export.xlsx',
        completedAt: new Date(),
      });

      expect(exportHistory.exportedRecords).toBe(95);
    });
  });

  describe('Export Performance', () => {
    test('should calculate export statistics', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 5000,
        exportedRecords: 5000,
        fileName: 'perf_export.xlsx',
        fileUrl: '/uploads/perf_export.xlsx',
        filePath: '/uploads/perf_export.xlsx',
        fileSize: 10485760, // 10MB
        processingTimeMs: 12500,
        recordsPerSecond: 400,
        completedAt: new Date(),
      });

      const stats = exportHistory.getExportStats();
      expect(stats.totalRecords).toBe(5000);
      expect(stats.recordsPerSecond).toBe(400);
    });

    test('should handle large batch exports', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 50000,
        exportedRecords: 50000,
        fileName: 'batch_export_50k.xlsx',
        fileUrl: '/uploads/batch_export_50k.xlsx',
        filePath: '/uploads/batch_export_50k.xlsx',
        fileSize: 104857600, // 100MB
        processingTimeMs: 125000,
        recordsPerSecond: 400,
        completedAt: new Date(),
      });

      expect(exportHistory.totalRecords).toBe(50000);
    });
  });

  describe('Export Filtering', () => {
    test('should track export filters', async () => {
      const exportHistory = await ExportHistory.create({
        schoolId,
        exportedBy: userId,
        module: 'STUDENT',
        format: 'xlsx',
        status: 'COMPLETED',
        totalRecords: 100,
        exportedRecords: 30,
        fileName: 'filtered_export.xlsx',
        fileUrl: '/uploads/filtered_export.xlsx',
        filePath: '/uploads/filtered_export.xlsx',
        filters: {
          classId: 'class_123',
          sessionId: 'session_123',
          search: 'John',
        },
        selectedFields: ['admissionNumber', 'firstName', 'lastName', 'email'],
        completedAt: new Date(),
      });

      expect(exportHistory.filters.classId).toBeDefined();
      expect(exportHistory.selectedFields.length).toBe(4);
    });
  });
});
