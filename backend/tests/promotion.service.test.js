const mongoose = require('mongoose');
const { Student } = require('../src/models/Student');
const Session = require('../src/models/Session');
const Class = require('../src/models/Class');
const Section = require('../src/models/Section');
const PromotionHistory = require('../src/models/PromotionHistory');
const promotionService = require('../src/services/promotion.service');

describe('Promotion Service', () => {
  let schoolId, userId, studentId, sessionId1, sessionId2, classId1, classId2, sectionId;

  beforeEach(async () => {
    schoolId = new mongoose.Types.ObjectId();
    userId = new mongoose.Types.ObjectId();
    studentId = new mongoose.Types.ObjectId();
    sessionId1 = new mongoose.Types.ObjectId();
    sessionId2 = new mongoose.Types.ObjectId();
    classId1 = new mongoose.Types.ObjectId();
    classId2 = new mongoose.Types.ObjectId();
    sectionId = new mongoose.Types.ObjectId();

    // Create test sessions
    await Session.create({
      _id: sessionId1,
      schoolId,
      sessionName: '2023-24',
      sessionCode: 'SES-2023-24',
      academicYear: '2023',
      startDate: new Date('2023-04-01'),
      endDate: new Date('2024-03-31'),
      createdBy: userId,
    });

    await Session.create({
      _id: sessionId2,
      schoolId,
      sessionName: '2024-25',
      sessionCode: 'SES-2024-25',
      academicYear: '2024',
      startDate: new Date('2024-04-01'),
      endDate: new Date('2025-03-31'),
      createdBy: userId,
    });

    // Create test classes
    await Class.create({
      _id: classId1,
      schoolId,
      className: 'Class 1',
    });

    await Class.create({
      _id: classId2,
      schoolId,
      className: 'Class 2',
    });

    // Create test student
    await Student.create({
      _id: studentId,
      schoolId,
      sessionId: sessionId1,
      classId: classId1,
      sectionId,
      firstName: 'John',
      lastName: 'Doe',
      admissionNumber: 'ADM001',
    });
  });

  afterEach(async () => {
    await Student.deleteMany({});
    await Session.deleteMany({});
    await Class.deleteMany({});
    await PromotionHistory.deleteMany({});
  });

  describe('promoteStudent', () => {
    test('should promote a single student', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      const result = await promotionService.promoteStudent(schoolId, promotionData, userId);

      expect(result.success).toBe(true);
      expect(result.promotionHistoryId).toBeDefined();

      // Verify student updated
      const updatedStudent = await Student.findById(studentId);
      expect(updatedStudent.classId).toEqual(classId2);
      expect(updatedStudent.sessionId).toEqual(sessionId2);
    });

    test('should record performance metrics', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
        performanceMetrics: {
          attendancePercentage: 92,
          academicPerformance: 'EXCELLENT',
          conductRating: 'GOOD',
        },
      };

      await promotionService.promoteStudent(schoolId, promotionData, userId);

      const history = await PromotionHistory.findOne({
        studentId,
        nextSessionId: sessionId2,
      });

      expect(history.performanceMetrics.attendancePercentage).toBe(92);
      expect(history.performanceMetrics.academicPerformance).toBe('EXCELLENT');
    });

    test('should throw error for non-existent student', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();
      const promotionData = {
        studentId: fakeStudentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      await expect(
        promotionService.promoteStudent(schoolId, promotionData, userId)
      ).rejects.toThrow('not found');
    });
  });

  describe('bulkPromoteStudents', () => {
    test('should bulk promote multiple students', async () => {
      const student2Id = new mongoose.Types.ObjectId();
      await Student.create({
        _id: student2Id,
        schoolId,
        sessionId: sessionId1,
        classId: classId1,
        firstName: 'Jane',
        lastName: 'Smith',
        admissionNumber: 'ADM002',
      });

      const bulkData = {
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        promotions: [
          {
            studentId,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
          {
            studentId: student2Id,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
        ],
      };

      const result = await promotionService.bulkPromoteStudents(schoolId, bulkData, userId);

      expect(result.successful).toBe(2);
      expect(result.failed).toBe(0);
      expect(result.batchPromotionId).toBeDefined();

      // Verify both students promoted
      const student1 = await Student.findById(studentId);
      const student2 = await Student.findById(student2Id);

      expect(student1.classId).toEqual(classId2);
      expect(student2.classId).toEqual(classId2);
    });

    test('should handle partial failures in bulk promotion', async () => {
      const fakeStudentId = new mongoose.Types.ObjectId();

      const bulkData = {
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        promotions: [
          {
            studentId,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
          {
            studentId: fakeStudentId,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
        ],
      };

      const result = await promotionService.bulkPromoteStudents(schoolId, bulkData, userId);

      expect(result.successful).toBe(1);
      expect(result.failed).toBe(1);
      expect(result.errors).toHaveLength(1);
    });
  });

  describe('rollbackPromotion', () => {
    test('should rollback a promotion', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      const promotion = await promotionService.promoteStudent(schoolId, promotionData, userId);
      const promotionId = promotion.promotionHistoryId;

      // Verify student promoted
      let student = await Student.findById(studentId);
      expect(student.classId).toEqual(classId2);

      // Rollback
      const result = await promotionService.rollbackPromotion(
        promotionId,
        schoolId,
        userId,
        'Incorrect promotion'
      );

      expect(result.success).toBe(true);

      // Verify student reverted
      student = await Student.findById(studentId);
      expect(student.classId).toEqual(classId1);
      expect(student.sessionId).toEqual(sessionId1);

      // Verify promotion marked as rolled back
      const history = await PromotionHistory.findById(promotionId);
      expect(history.isRolledBack).toBe(true);
      expect(history.rollbackReason).toBe('Incorrect promotion');
    });

    test('should not rollback already rolled back promotion', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      const promotion = await promotionService.promoteStudent(schoolId, promotionData, userId);
      const promotionId = promotion.promotionHistoryId;

      // Rollback once
      await promotionService.rollbackPromotion(promotionId, schoolId, userId, 'Reason 1');

      // Try to rollback again
      await expect(
        promotionService.rollbackPromotion(promotionId, schoolId, userId, 'Reason 2')
      ).rejects.toThrow('already been rolled back');
    });
  });

  describe('rollbackBatchPromotion', () => {
    test('should rollback entire batch promotion', async () => {
      const student2Id = new mongoose.Types.ObjectId();
      await Student.create({
        _id: student2Id,
        schoolId,
        sessionId: sessionId1,
        classId: classId1,
        firstName: 'Jane',
        lastName: 'Smith',
        admissionNumber: 'ADM002',
      });

      const bulkData = {
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        promotions: [
          {
            studentId,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
          {
            studentId: student2Id,
            fromClassId: classId1,
            toClassId: classId2,
            promotionStatus: 'PROMOTED',
          },
        ],
      };

      const batchResult = await promotionService.bulkPromoteStudents(schoolId, bulkData, userId);
      const batchId = batchResult.batchPromotionId;

      // Rollback batch
      const result = await promotionService.rollbackBatchPromotion(
        batchId,
        schoolId,
        userId,
        'System error'
      );

      expect(result.success).toBe(true);

      // Verify both students reverted
      const student1 = await Student.findById(studentId);
      const student2 = await Student.findById(student2Id);

      expect(student1.classId).toEqual(classId1);
      expect(student2.classId).toEqual(classId1);
    });
  });

  describe('getPromotionHistory', () => {
    test('should retrieve promotion history with filters', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      await promotionService.promoteStudent(schoolId, promotionData, userId);

      const history = await promotionService.getPromotionHistory(schoolId, {
        studentId,
      });

      expect(history.data).toHaveLength(1);
      expect(history.data[0].promotionStatus).toBe('PROMOTED');
      expect(history.total).toBe(1);
    });

    test('should filter by promotion status', async () => {
      const promotionData = {
        studentId,
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        fromClassId: classId1,
        toClassId: classId2,
        promotionStatus: 'PROMOTED',
      };

      await promotionService.promoteStudent(schoolId, promotionData, userId);

      const history = await promotionService.getPromotionHistory(schoolId, {
        promotionStatus: 'PROMOTED',
      });

      expect(history.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('getPromotionPreview', () => {
    test('should return preview of students to be promoted', async () => {
      const preview = await promotionService.getPromotionPreview(schoolId, {
        fromSessionId: sessionId1,
        toSessionId: sessionId2,
        classId: classId1,
      });

      expect(preview.students).toBeDefined();
      expect(preview.previewCount).toBeGreaterThanOrEqual(0);
    });
  });
});