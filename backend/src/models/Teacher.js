const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const GENDER_TYPES = ['Male', 'Female', 'Other'];
const STATUS_TYPES = ['Active', 'Inactive', 'Suspended', 'Resigned', 'Retired', 'Deleted'];
const DESIGNATION_TYPES = ['Principal', 'Vice Principal', 'Coordinator', 'Senior Teacher', 'Teacher', 'Assistant Teacher'];

const teacherSchema = new mongoose.Schema(
  {
    schoolId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'School',
      required: [true, 'School ID is required'],
      index: true,
    },
    employeeId: {
      type: String,
      required: [true, 'Employee ID is required'],
      trim: true,
      uppercase: true,
    },
    teacherCode: {
      type: String,
      required: [true, 'Teacher Code is required'],
      trim: true,
      uppercase: true,
    },
    firstName: { type: String, trim: true },
    middleName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    fullName: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
      maxlength: [100, 'Full name cannot exceed 100 characters'],
    },
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
    bloodGroup: { type: String, trim: true },
    qualification: { type: String, trim: true },
    specialization: { type: String, trim: true },
    experienceYears: { type: Number, min: 0, default: 0 },
    joiningDate: { type: Date, default: Date.now },
    
    email: {
      type: String,
      required: [true, 'Email is required'],
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    mobile: {
      type: String,
      required: [true, 'Mobile number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid mobile number'],
    },
    alternateMobile: {
      type: String,
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid alternate mobile number'],
    },
    aadhaarNumber: {
      type: String,
      trim: true,
      match: [/^[0-9]{12}$/, 'Aadhaar number must be exactly 12 digits'],
    },
    panNumber: {
      type: String,
      trim: true,
      uppercase: true,
      match: [/[A-Z]{5}[0-9]{4}[A-Z]{1}/, 'Please provide a valid PAN format'],
    },
    
    addressLine1: { type: String, trim: true },
    addressLine2: { type: String, trim: true },
    city: { type: String, trim: true },
    district: { type: String, trim: true },
    state: { type: String, trim: true },
    country: { type: String, default: 'India', trim: true },
    postalCode: { type: String, trim: true },
    
    photoUrl: { type: String, default: null },
    signatureUrl: { type: String, default: null },
    
    // 1-to-1 Mapping to Class
    classId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Class',
      default: null,
      index: true,
    },
    department: { type: String, trim: true },
    designation: {
      type: String,
      enum: {
        values: DESIGNATION_TYPES,
        message: '{VALUE} is not a valid designation',
      },
      default: 'Teacher',
    },
    salary: { type: Number, min: 0, default: null },
    status: {
      type: String,
      enum: {
        values: STATUS_TYPES,
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
      index: true,
    },
    
    // Auth Fields
    googleId: { type: String, default: null, index: true },
    passwordHash: { type: String, select: false },
    lastLogin: { type: Date, default: null },
    emailVerified: { type: Boolean, default: false },
    
    // Auto-generated fields for ID Cards
    qrCode: { type: String, default: null },
    barcode: { type: String, default: null },
    
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
// Unique constraint PER SCHOOL
teacherSchema.index({ schoolId: 1, employeeId: 1 }, { unique: true });
teacherSchema.index({ schoolId: 1, teacherCode: 1 }, { unique: true });

// Email should generally be globally unique if they act as login credentials
// Assuming User model holds the master auth records, Teacher might just mirror it,
// but for strict multi-tenancy, it's often unique per school, or globally unique across system.
teacherSchema.index({ email: 1 }, { unique: true, partialFilterExpression: { deletedAt: null } });

// Text index for global search
teacherSchema.index({
  fullName: 'text',
  employeeId: 'text',
  teacherCode: 'text',
  email: 'text',
  mobile: 'text',
  department: 'text',
  designation: 'text',
});

// Fast querying indexes
teacherSchema.index({ schoolId: 1, status: 1 });
teacherSchema.index({ schoolId: 1, department: 1 });
teacherSchema.index({ deletedAt: 1 });

// ─── Virtuals ───────────────────────────────────────────────
teacherSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

teacherSchema.virtual('fullAddress').get(function () {
  const parts = [this.addressLine1, this.addressLine2, this.city, this.district, this.state, this.country, this.postalCode];
  return parts.filter(Boolean).join(', ');
});

// ─── Middleware ─────────────────────────────────────────────
teacherSchema.pre('save', async function (next) {
  // Name split logic
  if (this.isModified('fullName') && !this.firstName) {
    const parts = this.fullName.split(' ');
    this.firstName = parts[0];
    this.lastName = parts.slice(1).join(' ');
  }

  // Pre-compute basic barcode string data if missing (Actual image generation happens in utils)
  if (!this.barcode && this.teacherCode) {
    this.barcode = this.teacherCode;
  }
  
  if (!this.qrCode) {
    this.qrCode = JSON.stringify({
      id: this._id,
      code: this.teacherCode,
      sch: this.schoolId,
    });
  }

  // Hash password if modified
  if (this.isModified('passwordHash') && this.passwordHash && !this.passwordHash.startsWith('$2a$')) {
    const salt = await bcrypt.genSalt(10);
    this.passwordHash = await bcrypt.hash(this.passwordHash, salt);
  }

  next();
});

// Soft Delete Filter
teacherSchema.pre(/^find/, function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

teacherSchema.pre('countDocuments', function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

// ─── Instance Methods ───────────────────────────────────────
teacherSchema.methods.softDelete = async function (userId) {
  this.deletedAt = new Date();
  this.status = 'Deleted';
  // If soft-deleted, free up the class assignment
  this.classId = null;
  this.updatedBy = userId;
  return this.save();
};

teacherSchema.methods.comparePassword = async function (enteredPassword) {
  if (!this.passwordHash) return false;
  return await bcrypt.compare(enteredPassword, this.passwordHash);
};

const Teacher = mongoose.model('Teacher', teacherSchema);

module.exports = {
  Teacher,
  GENDER_TYPES,
  STATUS_TYPES,
  DESIGNATION_TYPES
};
