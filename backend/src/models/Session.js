const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    sessionName: {
      type: String,
      required: [true, 'Session Name is required'],
      trim: true,
      example: '2024-25',
    },
    sessionCode: {
      type: String,
      required: [true, 'Session Code is required'],
      trim: true,
      uppercase: true,
    },
    academicYear: {
      type: String,
      required: [true, 'Academic Year is required'],
      trim: true,
    },
    startDate: {
      type: Date,
      required: [true, 'Start Date is required'],
      index: true,
    },
    endDate: {
      type: Date,
      required: [true, 'End Date is required'],
      index: true,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
      default: '',
    },
    isActive: {
      type: Boolean,
      default: false,
      index: true,
    },
    isArchived: {
      type: Boolean,
      default: false,
      index: true,
    },
    promotionCompleted: {
      type: Boolean,
      default: false,
    },
    status: {
      type: String,
      enum: ['PLANNED', 'ACTIVE', 'COMPLETED', 'ARCHIVED'],
      default: 'PLANNED',
      index: true,
    },
    studentCount: {
      type: Number,
      default: 0,
    },
    classCount: {
      type: Number,
      default: 0,
    },
    teacherCount: {
      type: Number,
      default: 0,
    },
    promotionStartDate: {
      type: Date,
      default: null,
    },
    promotionEndDate: {
      type: Date,
      default: null,
    },
    archivedAt: {
      type: Date,
      default: null,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    deletedAt: {
      type: Date,
      default: null,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for uniqueness of session code per school
sessionSchema.index({ schoolId: 1, sessionCode: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

// Index for active session lookup
sessionSchema.index({ schoolId: 1, isActive: 1 }, { partialFilterExpression: { deletedAt: null } });

// Index for archived sessions
sessionSchema.index({ schoolId: 1, isArchived: 1 }, { partialFilterExpression: { deletedAt: null } });

// Index for date range queries
sessionSchema.index({ schoolId: 1, startDate: 1, endDate: 1 });

// Custom validation to ensure endDate is after startDate
sessionSchema.pre('validate', function (next) {
  if (this.startDate && this.endDate && this.endDate <= this.startDate) {
    this.invalidate('endDate', 'End date must be greater than start date');
  }
  next();
});

// Virtual for session duration in days
sessionSchema.virtual('durationInDays').get(function () {
  if (this.startDate && this.endDate) {
    const diffTime = Math.abs(this.endDate - this.startDate);
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  return 0;
});

// Instance method to activate session
sessionSchema.methods.activateSession = function () {
  this.isActive = true;
  this.status = 'ACTIVE';
  return this.save();
};

// Instance method to deactivate session
sessionSchema.methods.deactivateSession = function () {
  this.isActive = false;
  this.status = 'COMPLETED';
  return this.save();
};

// Instance method to archive session
sessionSchema.methods.archiveSession = function () {
  if (!this.promotionCompleted) {
    throw new Error('Cannot archive session until promotion is completed');
  }
  this.isArchived = true;
  this.isActive = false;
  this.status = 'ARCHIVED';
  this.archivedAt = new Date();
  return this.save();
};

// Static method to get active session for school
sessionSchema.statics.getActiveSession = function (schoolId) {
  return this.findOne({
    schoolId,
    isActive: true,
    deletedAt: null,
  });
};

// Static method to get sessions by status
sessionSchema.statics.getSessionsByStatus = function (schoolId, status) {
  return this.find({
    schoolId,
    status,
    deletedAt: null,
  });
};

const Session = mongoose.model('Session', sessionSchema);

module.exports = Session;
