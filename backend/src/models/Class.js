const mongoose = require('mongoose');

const classSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: [true, 'Session ID is required'],
      index: true,
    },
    className: {
      type: String,
      required: [true, 'Class Name is required'],
      trim: true,
      example: 'Class 1',
    },
    classCode: {
      type: String,
      required: [true, 'Class Code is required'],
      trim: true,
      uppercase: true,
    },
    classNumericValue: {
      type: Number,
      required: [true, 'Numeric value is required for promotion sorting'],
      min: 0,
      example: 1,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 500,
    },
    classTeacherId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null,
    },
    capacity: {
      type: Number,
      default: 50,
      min: [1, 'Capacity must be at least 1'],
    },
    currentStudentCount: {
      type: Number,
      default: 0,
      min: 0,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'INACTIVE'],
      default: 'ACTIVE',
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
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

// Compound index for uniqueness of class code per school and session
classSchema.index(
  { schoolId: 1, sessionId: 1, classCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

// Validation for class capacity
classSchema.pre('save', function (next) {
  if (this.currentStudentCount > this.capacity) {
    const err = new Error('Current student count cannot exceed class capacity');
    return next(err);
  }
  next();
});

const ClassModel = mongoose.model('Class', classSchema);

module.exports = ClassModel;
