const mongoose = require('mongoose');

const studentClassMappingSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: true,
      index: true,
    },
    sessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      required: true,
      index: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User', // Assuming student is a type of User
      required: true,
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      required: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      default: null,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['ACTIVE', 'TRANSFERRED', 'PROMOTED', 'DROPPED'],
      default: 'ACTIVE',
    },
    assignedBy: {
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

// Ensure a student is in only one class per session
studentClassMappingSchema.index(
  { sessionId: 1, studentId: 1 },
  { unique: true, partialFilterExpression: { deletedAt: null, status: 'ACTIVE' } }
);

const StudentClassMapping = mongoose.model('StudentClassMapping', studentClassMappingSchema);

module.exports = StudentClassMapping;
