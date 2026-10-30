const mongoose = require('mongoose');

const SCHOOL_TYPES = ['Public', 'Private', 'Government', 'Semi-Government', 'International'];
const BOARD_TYPES = ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'];
const STATUS = ['Active', 'Inactive', 'Suspended', 'Deleted'];
const SUBSCRIPTION_PLANS = ['Free', 'Basic', 'Standard', 'Premium', 'Enterprise'];

// Counter schema for robust sequential school code generation
const counterSchema = new mongoose.Schema({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
});
const Counter = mongoose.models.Counter || mongoose.model('Counter', counterSchema);

const schoolSchema = new mongoose.Schema(
  {
    schoolCode: {
      type: String,
      unique: true,
      index: true,
      trim: true,
      uppercase: true,
    },
    schoolName: {
      type: String,
      required: [true, 'School name is required'],
      trim: true,
      maxlength: [200, 'School name cannot exceed 200 characters'],
    },
    schoolShortName: {
      type: String,
      trim: true,
      maxlength: [50, 'Short name cannot exceed 50 characters'],
    },
    boardType: {
      type: String,
      enum: {
        values: BOARD_TYPES,
        message: '{VALUE} is not a valid board type',
      },
      required: [true, 'Board type is required'],
    },
    schoolType: {
      type: String,
      enum: {
        values: SCHOOL_TYPES,
        message: '{VALUE} is not a valid school type',
      },
      required: [true, 'School type is required'],
    },
    registrationNumber: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
    },
    principalName: {
      type: String,
      trim: true,
      maxlength: [100, 'Principal name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      trim: true,
      lowercase: true,
      index: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please provide a valid email'],
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      trim: true,
      match: [/^[0-9+\-\s()]{10,15}$/, 'Please provide a valid phone number'],
    },
    alternatePhone: {
      type: String,
      trim: true,
    },
    website: {
      type: String,
      trim: true,
    },
    addressLine1: {
      type: String,
      required: [true, 'Address Line 1 is required'],
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    addressLine2: {
      type: String,
      maxlength: [200, 'Address cannot exceed 200 characters'],
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      index: true,
    },
    district: {
      type: String,
      trim: true,
    },
    state: {
      type: String,
      required: [true, 'State is required'],
      trim: true,
      index: true,
    },
    country: {
      type: String,
      default: 'India',
      trim: true,
    },
    postalCode: {
      type: String,
      required: [true, 'Postal code is required'],
      trim: true,
      match: [/^[0-9]{5,10}$/, 'Please provide a valid postal code'],
    },
    logoUrl: {
      type: String,
      default: null,
    },
    bannerUrl: {
      type: String,
      default: null,
    },
    establishedYear: {
      type: Number,
      min: [1800, 'Established year must be after 1800'],
      max: [new Date().getFullYear(), 'Established year cannot be in the future'],
    },
    studentCapacity: {
      type: Number,
      default: 0,
      min: [0, 'Student capacity cannot be negative'],
    },
    currentStudentCount: {
      type: Number,
      default: 0,
      min: [0, 'Student count cannot be negative'],
    },
    currentTeacherCount: {
      type: Number,
      default: 0,
      min: [0, 'Teacher count cannot be negative'],
    },
    activeSessionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Session',
      default: null,
    },
    subscriptionPlan: {
      type: String,
      enum: {
        values: SUBSCRIPTION_PLANS,
        message: '{VALUE} is not a valid subscription plan',
      },
      default: 'Free',
    },
    subscriptionStartDate: {
      type: Date,
      default: null,
    },
    subscriptionEndDate: {
      type: Date,
      default: null,
    },
    status: {
      type: String,
      enum: {
        values: STATUS,
        message: '{VALUE} is not a valid status',
      },
      default: 'Active',
      index: true,
    },
    timezone: {
      type: String,
      default: 'Asia/Kolkata',
    },
    language: {
      type: String,
      default: 'en',
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
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// ─── Virtuals ───────────────────────────────────────────────
schoolSchema.virtual('id').get(function () {
  return this._id.toHexString();
});

schoolSchema.virtual('isSubscriptionActive').get(function () {
  if (!this.subscriptionEndDate) return this.subscriptionPlan === 'Free';
  return new Date() < new Date(this.subscriptionEndDate);
});

schoolSchema.virtual('fullAddress').get(function () {
  const parts = [this.addressLine1, this.addressLine2, this.city, this.district, this.state, this.country, this.postalCode];
  return parts.filter(Boolean).join(', ');
});

schoolSchema.virtual('capacityUtilization').get(function () {
  if (!this.studentCapacity || this.studentCapacity === 0) return 0;
  return Math.round((this.currentStudentCount / this.studentCapacity) * 100);
});

// ─── Pre-save Hook: Generate School Code ────────────────────
schoolSchema.pre('save', async function (next) {
  if (!this.schoolCode) {
    try {
      const counter = await Counter.findByIdAndUpdate(
        'schoolCode',
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
      );
      this.schoolCode = `SCH-${String(counter.seq).padStart(5, '0')}`;
    } catch (err) {
      return next(err);
    }
  }

  // Auto-generate shortName if not provided
  if (!this.schoolShortName && this.schoolName) {
    this.schoolShortName = this.schoolName
      .split(' ')
      .filter((w) => w.length > 2)
      .map((w) => w.charAt(0).toUpperCase())
      .join('');
  }

  next();
});

// ─── Query Middleware: Soft Delete Filter ────────────────────
schoolSchema.pre(/^find/, function (next) {
  // Allow querying deleted records when explicitly requested
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

schoolSchema.pre('countDocuments', function (next) {
  if (this.getOptions().includeDeleted) {
    return next();
  }
  this.where({ deletedAt: null });
  next();
});

// ─── Instance Methods ───────────────────────────────────────
schoolSchema.methods.softDelete = async function (userId) {
  this.deletedAt = new Date();
  this.status = 'Deleted';
  this.updatedBy = userId;
  return this.save();
};

schoolSchema.methods.restore = async function (userId) {
  this.deletedAt = null;
  this.status = 'Active';
  this.updatedBy = userId;
  return this.save({ validateBeforeSave: false });
};

// ─── Static Methods ─────────────────────────────────────────
schoolSchema.statics.findByCode = function (schoolCode) {
  return this.findOne({ schoolCode: schoolCode.toUpperCase() });
};

schoolSchema.statics.getStatistics = async function () {
  const stats = await this.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
        totalStudents: { $sum: '$currentStudentCount' },
        totalTeachers: { $sum: '$currentTeacherCount' },
      },
    },
  ]);

  const planStats = await this.aggregate([
    { $match: { deletedAt: null } },
    {
      $group: {
        _id: '$subscriptionPlan',
        count: { $sum: 1 },
      },
    },
  ]);

  return { statusBreakdown: stats, planBreakdown: planStats };
};

// ─── Indexes ────────────────────────────────────────────────
schoolSchema.index({ schoolName: 'text', schoolCode: 'text', email: 'text', city: 'text', principalName: 'text' });
schoolSchema.index({ status: 1, boardType: 1 });
schoolSchema.index({ status: 1, schoolType: 1 });
schoolSchema.index({ state: 1, city: 1 });
schoolSchema.index({ subscriptionPlan: 1, subscriptionEndDate: 1 });
schoolSchema.index({ createdAt: -1 });
schoolSchema.index({ deletedAt: 1 });

const School = mongoose.model('School', schoolSchema);

module.exports = {
  School,
  Counter,
  SCHOOL_TYPES,
  BOARD_TYPES,
  STATUS,
  SUBSCRIPTION_PLANS,
};
