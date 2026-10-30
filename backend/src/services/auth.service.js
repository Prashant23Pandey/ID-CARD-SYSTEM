const LoginLog = require('../models/LoginLog');
const AllowedLogin = require('../models/AllowedLogin');
const logger = require('../utils/logger');

class AuthService {
  /**
   * Logs an authentication attempt (Success or Failure)
   */
  async logLoginAttempt(userId, username, role, schoolId, req, status, failureReason = null) {
    try {
      const ipAddress = req.ip || req.connection.remoteAddress;
      const browser = req.headers['user-agent'] || 'Unknown';
      
      await LoginLog.create({
        userId,
        username,
        role,
        schoolId,
        ipAddress,
        browser,
        loginStatus: status,
        failureReason,
      });
    } catch (error) {
      logger.error(`Failed to log login attempt: ${error.message}`);
    }
  }

  /**
   * Whitelists a token (Refresh, Verification, Reset) in the database
   */
  async storeToken(userId, token, type, req, expiresAt) {
    try {
      const ipAddress = req ? (req.ip || req.connection.remoteAddress) : 'System';
      const deviceInfo = req ? (req.headers['user-agent'] || 'Unknown') : 'System';

      await AllowedLogin.create({
        userId,
        token,
        type,
        ipAddress,
        deviceInfo,
        expiresAt,
      });
    } catch (error) {
      logger.error(`Failed to store ${type} token: ${error.message}`);
      throw error;
    }
  }

  /**
   * Validates if a token is in the database and not revoked
   */
  async validateStoredToken(token, type) {
    const storedToken = await AllowedLogin.findOne({ token, type, isRevoked: false });
    return !!storedToken;
  }

  /**
   * Revokes a token (e.g. upon logout or single-use consumption)
   */
  async revokeToken(token, type) {
    await AllowedLogin.findOneAndUpdate({ token, type }, { isRevoked: true });
  }

  /**
   * Revokes all refresh tokens for a user (e.g. security breach, password change)
   */
  async revokeAllUserTokens(userId, type = 'REFRESH') {
    await AllowedLogin.updateMany({ userId, type }, { isRevoked: true });
  }
}

module.exports = new AuthService();
