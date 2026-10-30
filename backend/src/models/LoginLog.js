const mongoose = require('mongoose');

const loginLogSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    username: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    ipAddress: {
      type: String,
      required: true,
    },
    deviceInfo: {
      type: String,
      default: 'Unknown',
    },
    browser: {
      type: String,
      default: 'Unknown',
    },
    loginStatus: {
      type: String,
      enum: ['SUCCESS', 'FAILED', 'LOGOUT'],
      required: true,
    },
    failureReason: {
      type: String,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
  }
);

// Index to automatically delete logs older than 90 days (TTL index)
loginLogSchema.index({ createdAt: 1 }, { expireAfterSeconds: 90 * 24 * 60 * 60 });

const LoginLog = mongoose.model('LoginLog', loginLogSchema);

module.exports = LoginLog;
