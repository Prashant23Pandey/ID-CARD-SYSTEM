const Session = require('../models/Session');
const { Student } = require('../models/Student');
const Class = require('../models/Class');
const Teacher = require('../models/Teacher');
const Section = require('../models/Section');
const mongoose = require('mongoose');

class SessionService {
  /**
   * Generate unique session code
   */
  generateSessionCode(sessionName) {
    const code = sessionName.toUpperCase().replace(/\s+/g, '-').substring(0, 20);
    return `SES-${code}-${Date.now()}`.toUpperCase();
  }

  /**
   * Build MongoDB query based on filter parameters
   */
  buildQuery(schoolId, queryParams) {
    const {
      search,
      status,
      academicYear,
      isArchived,
      startDateFrom,
      startDateTo,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    let query = { schoolId, deletedAt: null };

    if (search) {
      query.$or = [
        { sessionName: { $regex: search, $options: 'i' } },
        { sessionCode: { $regex: search, $options: 'i' } },
        { academicYear: { $regex: search, $options: 'i' } },
      ];
    }

    if (status) {
      query.status = status;
    }

    if (academicYear) {
      query.academicYear = academicYear;
    }

    if (isArchived !== undefined) {
      query.isArchived = isArchived === 'true';
    }

    if (startDateFrom || startDateTo) {
      query.startDate = {};
      if (startDateFrom) {
        query.startDate.$gte = new Date(startDateFrom);
      }
      if (startDateTo) {
        query.startDate.$lte = new Date(startDateTo);
      }
    }

    return query;
  }

  /**
   * Create a new session
   */
  async createSession(schoolId, sessionData, userId) {
    // Check if session code already exists (case-insensitive)
    const existing = await Session.findOne({
      schoolId,
      sessionCode: sessionData.sessionCode.toUpperCase(),
      deletedAt: null,
    });

    if (existing) {
      throw {
        status: 400,
        message: 'Session code already exists for this school',
      };
    }

    // Check for overlapping sessions
    const overlapping = await Session.findOne({
      schoolId,
      deletedAt: null,
      $or: [
        {
          startDate: { $lt: new Date(sessionData.endDate) },
          endDate: { $gt: new Date(sessionData.startDate) },
        },
      ],
    });

    if (overlapping) {
      throw {
        status: 400,
        message: 'Session dates overlap with an existing session',
      };
    }

    const session = new Session({
      ...sessionData,
      schoolId,
      sessionCode: sessionData.sessionCode.toUpperCase(),
      createdBy: userId,
      updatedBy: userId,
    });

    return session.save();
  }

  /**
   * Get paginated sessions
   */
  async getSessions(schoolId, queryParams) {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = queryParams;

    const skip = (page - 1) * limit;
    const query = this.buildQuery(schoolId, queryParams);

    const sortConfig = {};
    sortConfig[sortBy] = sortOrder === 'desc' ? -1 : 1;

    const [sessions, total] = await Promise.all([
      Session.find(query)
        .sort(sortConfig)
        .skip(skip)
        .limit(parseInt(limit))
        .populate('createdBy', 'firstName lastName email')
        .populate('updatedBy', 'firstName lastName email'),
      Session.countDocuments(query),
    ]);

    return {
      data: sessions,
      total,
      page: parseInt(page),
      limit: parseInt(limit),
      totalPages: Math.ceil(total / limit),
    };
  }

  /**
   * Get session by ID
   */
  async getSessionById(sessionId, schoolId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    })
      .populate('createdBy', 'firstName lastName email')
      .populate('updatedBy', 'firstName lastName email');

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    return session;
  }

  /**
   * Update session
   */
  async updateSession(sessionId, schoolId, updateData, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    if (session.isArchived) {
      throw {
        status: 403,
        message: 'Cannot modify archived session',
      };
    }

    // If updating dates, check for overlaps
    if (updateData.startDate || updateData.endDate) {
      const overlapping = await Session.findOne({
        _id: { $ne: sessionId },
        schoolId,
        deletedAt: null,
        $or: [
          {
            startDate: { $lt: new Date(updateData.endDate || session.endDate) },
            endDate: { $gt: new Date(updateData.startDate || session.startDate) },
          },
        ],
      });

      if (overlapping) {
        throw {
          status: 400,
          message: 'Session dates overlap with an existing session',
        };
      }
    }

    updateData.updatedBy = userId;
    const updated = await Session.findByIdAndUpdate(sessionId, updateData, {
      new: true,
      runValidators: true,
    });

    return updated;
  }

  /**
   * Soft delete session
   */
  async deleteSession(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    if (session.isActive) {
      throw {
        status: 403,
        message: 'Cannot delete an active session. Deactivate it first.',
      };
    }

    session.deletedAt = new Date();
    session.updatedBy = userId;
    return session.save();
  }

  /**
   * Activate session
   */
  async activateSession(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    // Check if another session is already active
    const activeSession = await Session.findOne({
      _id: { $ne: sessionId },
      schoolId,
      isActive: true,
      deletedAt: null,
    });

    if (activeSession) {
      // Deactivate the previous session
      activeSession.isActive = false;
      activeSession.status = 'COMPLETED';
      activeSession.updatedBy = userId;
      await activeSession.save();
    }

    session.isActive = true;
    session.status = 'ACTIVE';
    session.updatedBy = userId;
    return session.save();
  }

  /**
   * Deactivate session
   */
  async deactivateSession(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    if (!session.isActive) {
      throw {
        status: 409,
        message: 'Session is not active',
      };
    }

    session.isActive = false;
    session.status = 'COMPLETED';
    session.updatedBy = userId;
    return session.save();
  }

  /**
   * Archive session
   */
  async archiveSession(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    if (!session.promotionCompleted) {
      throw {
        status: 409,
        message: 'Cannot archive session until promotion is completed',
      };
    }

    if (session.isActive) {
      throw {
        status: 409,
        message: 'Cannot archive an active session',
      };
    }

    session.isArchived = true;
    session.status = 'ARCHIVED';
    session.archivedAt = new Date();
    session.updatedBy = userId;
    return session.save();
  }

  /**
   * Get session statistics
   */
  async getSessionStatistics(sessionId, schoolId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    const [studentCount, teacherCount, classCount, sectionCount] = await Promise.all([
      Student.countDocuments({ sessionId, schoolId, deletedAt: null }),
      Teacher.countDocuments({ schoolId, deletedAt: null }),
      Class.countDocuments({ schoolId, deletedAt: null }),
      Section.countDocuments({ schoolId, deletedAt: null }),
    ]);

    // Update session counts
    session.studentCount = studentCount;
    session.teacherCount = teacherCount;
    session.classCount = classCount;
    await session.save();

    return {
      sessionId: session._id,
      sessionName: session.sessionName,
      status: session.status,
      isActive: session.isActive,
      isArchived: session.isArchived,
      promotionCompleted: session.promotionCompleted,
      studentCount,
      teacherCount,
      classCount,
      sectionCount,
      startDate: session.startDate,
      endDate: session.endDate,
      createdAt: session.createdAt,
    };
  }

  /**
   * Get all active sessions for a school
   */
  async getActiveSessions(schoolId) {
    return Session.find({
      schoolId,
      isActive: true,
      deletedAt: null,
    }).select('_id sessionName sessionCode');
  }

  /**
   * Get session dashboard data
   */
  async getSessionDashboard(schoolId) {
    const [activeSession, totalSessions, archivedSessions, plannedSessions] = await Promise.all([
      Session.findOne({ schoolId, isActive: true, deletedAt: null }),
      Session.countDocuments({ schoolId, deletedAt: null }),
      Session.countDocuments({ schoolId, isArchived: true, deletedAt: null }),
      Session.countDocuments({ schoolId, status: 'PLANNED', deletedAt: null }),
    ]);

    let studentCount = 0,
      teacherCount = 0,
      classCount = 0;

    if (activeSession) {
      [studentCount, teacherCount, classCount] = await Promise.all([
        Student.countDocuments({ sessionId: activeSession._id, deletedAt: null }),
        Teacher.countDocuments({ schoolId, deletedAt: null }),
        Class.countDocuments({ schoolId, deletedAt: null }),
      ]);
    }

    return {
      activeSession: activeSession
        ? {
            id: activeSession._id,
            name: activeSession.sessionName,
            code: activeSession.sessionCode,
            startDate: activeSession.startDate,
            endDate: activeSession.endDate,
            promotionCompleted: activeSession.promotionCompleted,
            studentCount,
            teacherCount,
            classCount,
          }
        : null,
      statistics: {
        totalSessions,
        archivedSessions,
        plannedSessions,
        activeSessions: activeSession ? 1 : 0,
      },
    };
  }

  /**
   * Mark promotion as completed for session
   */
  async markPromotionCompleted(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    session.promotionCompleted = true;
    session.promotionEndDate = new Date();
    session.updatedBy = userId;
    return session.save();
  }

  /**
   * Reset promotion status for session
   */
  async resetPromotionStatus(sessionId, schoolId, userId) {
    const session = await Session.findOne({
      _id: sessionId,
      schoolId,
      deletedAt: null,
    });

    if (!session) {
      throw {
        status: 404,
        message: 'Session not found',
      };
    }

    if (session.isArchived) {
      throw {
        status: 403,
        message: 'Cannot reset promotion status for archived session',
      };
    }

    session.promotionCompleted = false;
    session.promotionStartDate = null;
    session.promotionEndDate = null;
    session.updatedBy = userId;
    return session.save();
  }
}

module.exports = new SessionService();