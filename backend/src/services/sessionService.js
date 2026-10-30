const Session = require('../models/Session');

class SessionService {
  async createSession(schoolId, sessionData, userId) {
    // Only one active session per school logic handled here if needed,
    // though the DB schema does not enforce single active, we can enforce it in logic.
    if (sessionData.isActive) {
      await Session.updateMany({ schoolId, isActive: true }, { isActive: false });
    }

    const session = new Session({
      ...sessionData,
      schoolId,
      createdBy: userId,
    });
    return await session.save();
  }

  async getSessions(schoolId, filters = {}) {
    const query = { schoolId, deletedAt: null, ...filters };
    return await Session.find(query).sort({ startDate: -1 });
  }

  async getSessionById(sessionId, schoolId) {
    const session = await Session.findOne({ _id: sessionId, schoolId, deletedAt: null });
    if (!session) {
      throw new Error('Session not found');
    }
    return session;
  }

  async updateSession(sessionId, schoolId, updateData, userId) {
    const session = await this.getSessionById(sessionId, schoolId);

    if (session.isArchived) {
      throw new Error('Archived sessions cannot be modified');
    }

    if (updateData.isActive) {
      await Session.updateMany({ schoolId, _id: { $ne: sessionId } }, { isActive: false });
    }

    Object.assign(session, updateData);
    session.updatedBy = userId;
    return await session.save();
  }

  async deleteSession(sessionId, schoolId, userId) {
    const session = await this.getSessionById(sessionId, schoolId);
    session.deletedAt = new Date();
    session.updatedBy = userId;
    return await session.save();
  }

  async activateSession(sessionId, schoolId, userId) {
    return await this.updateSession(sessionId, schoolId, { isActive: true }, userId);
  }

  async archiveSession(sessionId, schoolId, userId) {
    return await this.updateSession(sessionId, schoolId, { isArchived: true, isActive: false }, userId);
  }
}

module.exports = new SessionService();
