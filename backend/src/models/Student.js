const mongoose = require('mongoose');

const GENDER_TYPES = ['Male', 'Female', 'Other'];
const STATUS_TYPES = ['Active', 'Inactive', 'Suspended', 'Alumni', 'Deleted'];
const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

// Counter schema for generating sequential admission/roll numbers if needed
const studentCounterSchema = new mongoose.Schema({
  schoolId: { type: mongoose.Schema.Types.ObjectId, required: true },
  seq: { type: Number, default: 0 }
});
const StudentCounter = mongoose.models.StudentCounter || mongoose.model('StudentCounter', studentCounterSchema);

const studentSchema = new mongoose.Schema(
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
      // Required logic can be enforced at controller level if Session model isn't fully ready yet, 
      // but assuming standard relation, it's highly recommended.
      index: true,
    },
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      index: true,
    },
    sectionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Section',
      index: true,
    },
    admissionNumber: {
      type: String,
      required: [true, 'Admission number is required'],
      trim: true,
      uppercase: true,
    },
    rollNumber: {
      type: String,
      trim: true,
    },
    studentName: {
      type: String,
      required: [true, 'Student name is required'],
      trim: true,
      maxlength: [100, 'Student name cannot exceed 100 characters'],
    },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    gender: {
      type: String,
      enum: {
        values: GENDER_TYPES,
        message: '{VALUE} is not a valid gender',
      },
      required: [true, 'Gender is required'],
    },
    dateOfBirth: {
      type: Date,
      required: [true, 'Date of birth is required'],
      validate: {
        validator: function (v) {
          return v && v <= new Date();
        },
        message: 'Date of birth cannot be in the future',
      },
    },
    bloodGroup: {
      type: String,
      enum: {
        values: BLOOD_GROUPS,
        message: '{VALUE} is not a valid blood group',
      },
    },
    religion: { type: String, trim: true },
    category: { type: String, trim: true }, // General, OBC, SC, ST etc.
    fatherName: { type: String, trim: true, maxlength: [100, 'Father name too long'] },
    motherName: { type: String, trim: true, maxlength: [100, 'Mother name too long'] },
    guardianName: { type: String, trim: true },
    fatherMobile: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid father mobile number'],
    },
    motherMobile: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid mother mobile number'],
    },
    studentMobile: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid student mobile number'],
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'],
    },
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    postalCode: { type: String, trim: true },
    photoUrl: { type: String, default: null },
    
    // Auto-generated fields for ID Cards
    qrCode: { type: String, default: null },
    barcode: { type: String, default: null },
    
    joiningDate: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: {
        values: STATUS_TYPES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
      index: true,
    },
    remarks: { type: String, trim: true },
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Indexes ────────────────────────────────────────────────
// Unique admission number PER SCHOOL
studentSchema.index({ schoolId: 1, admissionNumber: 1 }, { unique: true });

// Text index for global search
studentSchema.index({
  studentName: 'text',
  admissionNumber: 'text',
  fatherName: 'text',
  motherName: 'text',
  studentMobile: 'text',
  fatherMobile: 'text',
  aadhaarNumber: 'text',
});

// Compound indexes for fast filtering
studentSchema.index({ schoolId: 1, status: 1 });
studentSchema.index({ schoolId: 1, classId: 1, sectionId: 1 });
studentSchema.index({ schoolId: 1, sessionId: 1 });
studentSchema.index({ deletedAt: 1 });

// ─── Virtuals ───────────────────────────────────────────────
studentSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

studentSchema.virtual('fullAddress').get(function () {
  const parts = [this.addressLine1, this.addressLine2, this.city, this.district, this.state, this.country, this.postalCode];
  return parts.filter(Boolean).join(', ');
});

// ─── Middleware ─────────────────────────────────────────────
studentSchema.pre('save', function (next) {
  // If first/last name aren't provided but studentName is, try to split it
  if (this.isModified('studentName') && !this.firstName) {
    const parts = this.studentName.split(' ');
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(' ');
  }

  // Pre-compute basic barcode string data if missing (Actual image generation happens in utils)
  // For barcode, standard is just the admission number or student ID
  if (!this.barcode && this.admissionNumber) {
    this.barcode = this.admissionNumber;
  }
  
  if (!this.qrCode) {
    // Basic JSON payload for QR
    this.qrCode = JSON.stringify({
      id: this._id,
      adm: this.admissionNumber,
      sch: this.schoolId,
    });
  }

  next();
});

// Soft Delete Filter
studentSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

studentSchema.pre('countDocuments', function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

// ─── Instance Methods ───────────────────────────────────────
studentSchema.methods.softDelete = async function (userId) {
  this.deletedAt = new Date();
  this.status = 'Deleted';
  this.updatedBy = userId;
  return this.save();
};

const Student = mongoose.model('Student', studentSchema);

module.exports = {
  Student,
  StudentCounter,
  GENDER_TYPES,
  STATUS_TYPES,
  BLOOD_GROUPS,
};
