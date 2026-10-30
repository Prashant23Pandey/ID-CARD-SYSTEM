const mongoose = require('mongoose');

const ROLES = {
  SUPERADMIN: 'SUPERADMIN',
  SCHOOLADMIN: 'SCHOOLADMIN',
  TEACHER: 'TEACHER',
};

const STATUS = {
  ACTIVE: 'ACTIVE',
  INACTIVE: 'INACTIVE',
  SUSPENDED: 'SUSPENDED',
  LOCKED: 'LOCKED',
};

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 4,
      maxlength: 50,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    mobile: {
      type: String,
      required: true,
      trim: true,
      match: [/^[0-9]{10}$/, 'Please enter a valid 10-digit mobile number'],
    },
    passwordHash: {
      type: String,
      required: function () {
        return !this.googleId; // Password is required if not using Google OAuth
      },
      select: false, // Don't return password by default in queries
    },
    role: {
      type: String,
      enum: Object.values(ROLES),
      required: true,
      default: ROLES.TEACHER,
      index: true,
    },
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      index: true,
    },
    profilePhoto: {
      type: String,
      default: null,
    },
    googleId: {
      type: String,
      sparse: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(STATUS),
      default: STATUS.INACTIVE,
    },
    emailVerified: {
      type: Boolean,
      default: false,
    },
    lastLogin: {
      type: Date,
      default: null,
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true, // Automatically adds createdAt and updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual field for 'id' (mongoose adds this by default, but making it explicit)
userSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

// Custom validation for multi-tenant rules
userSchema.pre('validate', function (next) {
  // If role is SUPERADMIN, schoolId should ideally be null
  if (this.role === ROLES.SUPERADMIN) {
    this.schoolId = undefined; // Ensure it's not set
  }

  // If role is SCHOOLADMIN or TEACHER, schoolId is MANDATORY
  if ((this.role === ROLES.SCHOOLADMIN || this.role === ROLES.TEACHER) && !this.schoolId) {
    this.invalidate('schoolId', 'School ID is mandatory for Schooladmin and Teacher roles.');
  }

  next();
});

// Soft delete query middleware
userSchema.pre(/^find/, function (next) {
  // Exclude soft deleted documents by default for all queries starting with 'find'
  this.where({ deletedAt: null });
  next();
});

const User = mongoose.model('User', userSchema);

module.exports = {
  User,
  ROLES,
  STATUS,
};
