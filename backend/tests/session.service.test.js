const mongoose = require('mongoose');
const Session = require('../src/models/Session');
const sessionService = require('../src/services/session.service');

describe('Session Service', () => {
  let schoolId, userId, sessionId;

  beforeEach(async () => {
    schoolId = new mongoose.Types.ObjectId();
    userId = new mongoose.Types.ObjectId();
  });

  afterEach(async () => {
    await Session.deleteMany({});
  });

  describe('createSession', () => {
    test('should create a session with valid data', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        description: 'Academic year 2024-25',
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);

      expect(session._id).toBeDefined();
      expect(session.sessionName).toBe('2024-25');
      expect(session.schoolId).toEqual(schoolId);
      expect(session.isActive).toBe(false);
    });

    test('should throw error for duplicate session code', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      await sessionService.createSession(schoolId, sessionData, userId);

      await expect(
        sessionService.createSession(schoolId, sessionData, userId)
      ).rejects.toThrow('Session code already exists');
    });

    test('should throw error for overlapping sessions', async () => {
      const sessionData1 = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      const sessionData2 = {
        sessionName: '2024-26',
        sessionCode: 'SES-2024-26',
        academicYear: '2024',
        startDate: new Date('2024-08-01'),
        endDate: new Date('2025-03-31'),
      };

      await sessionService.createSession(schoolId, sessionData1, userId);

      await expect(
        sessionService.createSession(schoolId, sessionData2, userId)
      ).rejects.toThrow('overlap');
    });
  });

  describe('getSessions', () => {
    test('should return paginated sessions', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      await sessionService.createSession(schoolId, sessionData, userId);

      const result = await sessionService.getSessions(schoolId, {
        page: 1,
        limit: 10,
      });

      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
      expect(result.page).toBe(1);
    });

    test('should filter sessions by status', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        status: 'ACTIVE',
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);
      await Session.findByIdAndUpdate(session._id, { status: 'ACTIVE' });

      const result = await sessionService.getSessions(schoolId, {
        status: 'ACTIVE',
      });

      expect(result.data.length).toBeGreaterThanOrEqual(1);
    });
  });

  describe('activateSession', () => {
    test('should activate a session and deactivate previous active session', async () => {
      const session1Data = {
        sessionName: '2023-24',
        sessionCode: 'SES-2023-24',
        academicYear: '2023',
        startDate: new Date('2023-04-01'),
        endDate: new Date('2024-03-31'),
      };

      const session2Data = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      const session1 = await sessionService.createSession(schoolId, session1Data, userId);
      const session2 = await sessionService.createSession(schoolId, session2Data, userId);

      // Activate first session
      await sessionService.activateSession(session1._id, schoolId, userId);

      // Verify first session is active
      let activeSessions = await Session.find({ schoolId, isActive: true });
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0]._id).toEqual(session1._id);

      // Activate second session
      await sessionService.activateSession(session2._id, schoolId, userId);

      // Verify only second session is now active
      activeSessions = await Session.find({ schoolId, isActive: true });
      expect(activeSessions).toHaveLength(1);
      expect(activeSessions[0]._id).toEqual(session2._id);
    });

    test('should throw error when activating non-existent session', async () => {
      const fakeId = new mongoose.Types.ObjectId();

      await expect(
        sessionService.activateSession(fakeId, schoolId, userId)
      ).rejects.toThrow('not found');
    });
  });

  describe('archiveSession', () => {
    test('should archive a completed session', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        promotionCompleted: true,
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);

      const archived = await sessionService.archiveSession(session._id, schoolId, userId);

      expect(archived.isArchived).toBe(true);
      expect(archived.status).toBe('ARCHIVED');
      expect(archived.archivedAt).toBeDefined();
    });

    test('should throw error archiving session without completed promotion', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
        promotionCompleted: false,
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);

      await expect(
        sessionService.archiveSession(session._id, schoolId, userId)
      ).rejects.toThrow('promotion is completed');
    });
  });

  describe('deleteSession', () => {
    test('should soft delete a session', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);

      await sessionService.deleteSession(session._id, schoolId, userId);

      const deletedSession = await Session.findById(session._id);
      expect(deletedSession.deletedAt).toBeDefined();
    });

    test('should throw error deleting active session', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);
      await sessionService.activateSession(session._id, schoolId, userId);

      await expect(
        sessionService.deleteSession(session._id, schoolId, userId)
      ).rejects.toThrow('active session');
    });
  });

  describe('getSessionStatistics', () => {
    test('should return session statistics', async () => {
      const sessionData = {
        sessionName: '2024-25',
        sessionCode: 'SES-2024-25',
        academicYear: '2024',
        startDate: new Date('2024-04-01'),
        endDate: new Date('2025-03-31'),
      };

      const session = await sessionService.createSession(schoolId, sessionData, userId);

      const stats = await sessionService.getSessionStatistics(session._id, schoolId);

      expect(stats).toHaveProperty('sessionName');
      expect(stats).toHaveProperty('studentCount');
      expect(stats).toHaveProperty('teacherCount');
      expect(stats).toHaveProperty('classCount');
      expect(stats.status).toBe('PLANNED');
    });
  });
});
