const mongoose = require('mongoose');

// This model tracks active refresh tokens and email verification / password reset tokens
const allowedLoginSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['REFRESH', 'EMAIL_VERIFY', 'PASSWORD_RESET'],
      required: true,
    },
    ipAddress: {
      type: String,
    },
    deviceInfo: {
      type: String,
    },
    expiresAt: {
      type: Date,
      required: true,
      index: { expires: '1s' }, // TTL index: document will be automatically deleted when expiresAt is reached
    },
    isRevoked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for quick lookups
allowedLoginSchema.index({ userId: 1, type: 1 });

const AllowedLogin = mongoose.model('AllowedLogin', allowedLoginSchema);

module.exports = AllowedLogin;
