const mongoose = require('mongoose');

const sectionSchema = new mongoose.Schema(
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
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: [true, 'Class ID is required'],
      index: true,
    },
    sectionName: {
      type: String,
      required: [true, 'Section Name is required'],
      trim: true,
      example: 'A',
    },
    sectionCode: {
      type: String,
      required: [true, 'Section Code is required'],
      trim: true,
      uppercase: true,
    },
    capacity: {
      type: Number,
      default: 40,
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

// Compound index for uniqueness of section code per class
sectionSchema.index(
  { classId: 1, sectionCode: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null } }
);

sectionSchema.pre('save', function (next) {
  if (this.currentStudentCount > this.capacity) {
    const err = new Error('Current student count cannot exceed section capacity');
    return next(err);
  }
  next();
});

const Section = mongoose.model('Section', sectionSchema);

module.exports = Section;
