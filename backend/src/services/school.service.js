const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { AppError } = require('../middlewares/error.middleware');
const logger = require('../utils/logger');
const { School, STATUS } = require('../models/School');
const { User, ROLES } = require('../models/User');

// ─── Upload Directory Configuration ────────────────────────
const uploadDir = path.join(__dirname, '..', '..', 'public', 'uploads', 'logos');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// ─── Multer Storage Configuration ───────────────────────────
const storage = multer.memoryStorage(); // Use memory storage for Sharp processing

// ─── File Filter ────────────────────────────────────────────
const fileFilter = (req, file, cb) => {
  const allowedMimeTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp'];

  if (allowedMimeTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new AppError('Invalid file type. Only JPG, PNG, and WEBP are allowed.', 400), false);
  }
};

// ─── Multer Upload Instance ─────────────────────────────────
const uploadLogo = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5 MB
  },
});

// ─── School Service Class ───────────────────────────────────
class SchoolService {
  /**
   * Process and save uploaded logo image with compression.
   * Resizes to max 400x400 and converts to webp for optimization.
   */
  async processAndSaveLogo(fileBuffer, originalName) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const filename = `logo-${uniqueSuffix}.webp`;
    const filePath = path.join(uploadDir, filename);

    await sharp(fileBuffer)
      .resize(400, 400, { fit: 'inside', withoutEnlargement: true })
      .webp({ quality: 85 })
      .toFile(filePath);

    logger.info(`Logo processed and saved: ${filename} (original: ${originalName})`);
    return filename;
  }

  /**
   * Deletes a logo file from the local file system.
   */
  async deleteLogoFile(filenameOrUrl) {
    if (!filenameOrUrl) return;

    const name = path.basename(filenameOrUrl);
    const filePath = path.join(uploadDir, name);

    try {
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        logger.info(`Deleted logo file: ${name}`);
      }
    } catch (error) {
      logger.error(`Error deleting logo file ${name}: ${error.message}`);
    }
  }

  /**
   * Get the public URL for a logo filename.
   */
  getLogoUrl(req, filename) {
    if (!filename) return null;
    return `${req.protocol}://${req.get('host')}/uploads/logos/${filename}`;
  }

  /**
   * Build the query filter for listing schools.
   */
  buildSearchQuery(filters, userRole, userSchoolId) {
    const query = {};

    // Multi-tenant isolation: SchoolAdmin only sees their own school
    if (userRole === ROLES.SCHOOLADMIN) {
      query._id = userSchoolId;
      return query;
    }

    // Full-text search
    if (filters.search) {
      // Use regex for partial matching instead of text index for better UX
      const searchRegex = new RegExp(filters.search.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');
      query.$or = [
        { schoolName: searchRegex },
        { schoolCode: searchRegex },
        { principalName: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { city: searchRegex },
        { state: searchRegex },
      ];
    }

    // Exact match filters
    if (filters.status) query.status = filters.status;
    if (filters.boardType) query.boardType = filters.boardType;
    if (filters.schoolType) query.schoolType = filters.schoolType;
    if (filters.state) query.state = filters.state;
    if (filters.city) query.city = filters.city;
    if (filters.subscriptionPlan) query.subscriptionPlan = filters.subscriptionPlan;

    // Date range filter
    if (filters.createdFrom || filters.createdTo) {
      query.createdAt = {};
      if (filters.createdFrom) query.createdAt.$gte = new Date(filters.createdFrom);
      if (filters.createdTo) query.createdAt.$lte = new Date(filters.createdTo);
    }

    return query;
  }

  /**
   * Check for duplicate school entries before create/update.
   */
  async checkDuplicates(email, registrationNumber, excludeId = null) {
    const conditions = [];
    if (email) conditions.push({ email: email.toLowerCase() });
    if (registrationNumber) conditions.push({ registrationNumber });

    if (conditions.length === 0) return null;

    const filter = { $or: conditions };
    if (excludeId) {
      filter._id = { $ne: excludeId };
    }

    return School.findOne(filter);
  }

  /**
   * Cascade status change to associated users when school is suspended/deleted.
   */
  async cascadeStatusToUsers(schoolId, schoolStatus) {
    if (schoolStatus === 'Suspended' || schoolStatus === 'Deleted') {
      const result = await User.updateMany(
        { schoolId, role: { $ne: ROLES.SUPERADMIN } },
        { status: 'SUSPENDED' }
      );
      logger.info(`Cascaded ${schoolStatus} status to ${result.modifiedCount} users for school ${schoolId}`);
      return result.modifiedCount;
    }

    if (schoolStatus === 'Active') {
      const result = await User.updateMany(
        { schoolId, status: 'SUSPENDED', role: { $ne: ROLES.SUPERADMIN } },
        { status: 'ACTIVE' }
      );
      logger.info(`Restored ${result.modifiedCount} users for school ${schoolId}`);
      return result.modifiedCount;
    }

    return 0;
  }

  /**
   * Validate admin assignment rules.
   */
  async validateAdminAssignment(userId, schoolId) {
    const user = await User.findById(userId);
    if (!user) {
      throw new AppError('User not found', 404);
    }

    if (user.role !== ROLES.SCHOOLADMIN) {
      throw new AppError('Only users with SCHOOLADMIN role can be assigned as school admin', 400);
    }

    // Check if user is already assigned to another school
    if (user.schoolId && user.schoolId.toString() !== schoolId.toString()) {
      throw new AppError('This user is already assigned to another school. Remove them first.', 400);
    }

    const school = await School.findById(schoolId);
    if (!school) {
      throw new AppError('School not found', 404);
    }

    if (school.status !== 'Active') {
      throw new AppError('Cannot assign admin to a non-active school', 400);
    }

    return { user, school };
  }

  /**
   * Get school statistics for dashboard.
   */
  async getSchoolStatistics() {
    return School.getStatistics();
  }

  /**
   * Get distinct values for filter dropdowns.
   */
  async getFilterOptions() {
    const [states, cities] = await Promise.all([
      School.distinct('state', { deletedAt: null }),
      School.distinct('city', { deletedAt: null }),
    ]);

    return {
      states: states.sort(),
      cities: cities.sort(),
      boardTypes: ['CBSE', 'ICSE', 'State Board', 'IB', 'Cambridge'],
      schoolTypes: ['Public', 'Private', 'Government', 'Semi-Government', 'International'],
      statusOptions: ['Active', 'Inactive', 'Suspended'],
      subscriptionPlans: ['Free', 'Basic', 'Standard', 'Premium', 'Enterprise'],
    };
  }
}

module.exports = {
  uploadLogo,
  schoolService: new SchoolService(),
};
