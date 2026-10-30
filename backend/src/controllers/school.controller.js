const { School } = require('../models/School');
const { User, ROLES } = require('../models/User');
const { AppError } = require('../middlewares/error.middleware');
const { schoolService } = require('../services/school.service');
const logger = require('../utils/logger');

// ─── CREATE SCHOOL ──────────────────────────────────────────
exports.createSchool = async (req, res, next) => {
  try {
    const {
      schoolName, schoolShortName, boardType, schoolType, registrationNumber,
      principalName, email, phone, alternatePhone, website, addressLine1,
      addressLine2, city, district, state, country, postalCode, establishedYear,
      studentCapacity, subscriptionPlan, timezone, language,
    } = req.body;

    // Check for duplicate email or registration number
    const duplicate = await schoolService.checkDuplicates(email, registrationNumber);
    if (duplicate) {
      return next(new AppError('A school with this email or registration number already exists', 409));
    }

    const schoolData = {
      schoolName, schoolShortName, boardType, schoolType, registrationNumber,
      principalName, email, phone, alternatePhone, website, addressLine1,
      addressLine2, city, district, state, country, postalCode, establishedYear,
      studentCapacity, subscriptionPlan, timezone, language,
      createdBy: req.user._id,
      updatedBy: req.user._id,
    };

    // Set subscription dates if a paid plan is selected
    if (subscriptionPlan && subscriptionPlan !== 'Free') {
      schoolData.subscriptionStartDate = new Date();
      schoolData.subscriptionEndDate = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    }

    // Process uploaded logo
    if (req.file) {
      const logoFilename = await schoolService.processAndSaveLogo(req.file.buffer, req.file.originalname);
      schoolData.logoUrl = schoolService.getLogoUrl(req, logoFilename);
    }

    const school = await School.create(schoolData);

    logger.info(`School created: ${school.schoolCode} - ${school.schoolName} by user ${req.user._id}`);

    res.status(201).json({
      success: true,
      message: 'School created successfully',
      data: school,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET ALL SCHOOLS (with pagination, search, filters) ─────
exports.getSchools = async (req, res, next) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      status,
      boardType,
      schoolType,
      state,
      city,
      subscriptionPlan,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      createdFrom,
      createdTo,
    } = req.query;

    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

    const query = schoolService.buildSearchQuery(
      { search, status, boardType, schoolType, state, city, subscriptionPlan, createdFrom, createdTo },
      req.user.role,
      req.user.schoolId
    );

    const skip = (pageNum - 1) * limitNum;
    const sort = { [sortBy]: sortOrder === 'desc' ? -1 : 1 };

    const [schools, total] = await Promise.all([
      School.find(query)
        .sort(sort)
        .skip(skip)
        .limit(limitNum)
        .populate('createdBy', 'name email')
        .select('-__v'),
      School.countDocuments(query),
    ]);

    res.status(200).json({
      success: true,
      count: schools.length,
      total,
      totalPages: Math.ceil(total / limitNum),
      currentPage: pageNum,
      hasNextPage: pageNum < Math.ceil(total / limitNum),
      hasPrevPage: pageNum > 1,
      data: schools,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SINGLE SCHOOL ──────────────────────────────────────
exports.getSchoolById = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id)
      .populate('createdBy', 'name email')
      .populate('updatedBy', 'name email');

    if (!school) {
      return next(new AppError('School not found', 404));
    }

    // Multi-tenant isolation
    if (req.user.role === ROLES.SCHOOLADMIN && req.user.schoolId?.toString() !== school._id.toString()) {
      return next(new AppError('Access denied. You can only view your own school.', 403));
    }

    // Fetch assigned admins
    const admins = await User.find({
      schoolId: school._id,
      role: ROLES.SCHOOLADMIN,
    }).select('name email username status createdAt');

    // Fetch teacher count
    const teacherCount = await User.countDocuments({
      schoolId: school._id,
      role: ROLES.TEACHER,
    });

    res.status(200).json({
      success: true,
      data: {
        ...school.toObject(),
        admins,
        teacherCount,
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SCHOOL ──────────────────────────────────────────
exports.updateSchool = async (req, res, next) => {
  try {
    const updateData = { ...req.body };

    // SchoolAdmin restrictions: cannot change certain fields
    if (req.user.role !== ROLES.SUPERADMIN) {
      delete updateData.subscriptionPlan;
      delete updateData.subscriptionStartDate;
      delete updateData.subscriptionEndDate;
      delete updateData.status;
      delete updateData.schoolCode;
      delete updateData.createdBy;
    }

    // Prevent schoolCode from being changed by anyone
    delete updateData.schoolCode;

    updateData.updatedBy = req.user._id;

    // Check for duplicate email/registration if they are being updated
    if (updateData.email || updateData.registrationNumber) {
      const duplicate = await schoolService.checkDuplicates(
        updateData.email,
        updateData.registrationNumber,
        req.params.id
      );
      if (duplicate) {
        return next(new AppError('A school with this email or registration number already exists', 409));
      }
    }

    const school = await School.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!school) {
      return next(new AppError('School not found', 404));
    }

    logger.info(`School updated: ${school.schoolCode} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'School updated successfully',
      data: school,
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE SCHOOL (Soft Delete) ────────────────────────────
exports.deleteSchool = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);

    if (!school) {
      return next(new AppError('School not found', 404));
    }

    if (school.status === 'Deleted') {
      return next(new AppError('School is already deleted', 400));
    }

    // Soft delete
    await school.softDelete(req.user._id);

    // Cascade to users
    const affectedUsers = await schoolService.cascadeStatusToUsers(school._id, 'Deleted');

    logger.info(`School soft-deleted: ${school.schoolCode} by user ${req.user._id}. ${affectedUsers} users affected.`);

    res.status(200).json({
      success: true,
      message: 'School deleted and archived successfully',
      data: { affectedUsers },
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPDATE SCHOOL STATUS ───────────────────────────────────
exports.updateStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const school = await School.findById(req.params.id);

    if (!school) {
      return next(new AppError('School not found', 404));
    }

    if (school.status === status) {
      return next(new AppError(`School is already ${status}`, 400));
    }

    // Prevent setting status to 'Deleted' via status update — use delete endpoint
    if (status === 'Deleted') {
      return next(new AppError('Use the delete endpoint to delete a school', 400));
    }

    // Handle restoring deleted schools
    if (school.status === 'Deleted' && status === 'Active') {
      await school.restore(req.user._id);
    } else {
      school.status = status;
      school.updatedBy = req.user._id;
      await school.save();
    }

    // Cascade status to users
    const affectedUsers = await schoolService.cascadeStatusToUsers(school._id, status);

    logger.info(`School ${school.schoolCode} status changed to ${status} by user ${req.user._id}. ${affectedUsers} users affected.`);

    res.status(200).json({
      success: true,
      message: `School status updated to ${status}`,
      data: school,
    });
  } catch (error) {
    next(error);
  }
};

// ─── ASSIGN ADMIN ───────────────────────────────────────────
exports.assignAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const schoolId = req.params.id;

    const { user, school } = await schoolService.validateAdminAssignment(userId, schoolId);

    user.schoolId = school._id;
    user.status = 'ACTIVE';
    await user.save();

    logger.info(`Admin ${user.email} assigned to school ${school.schoolCode} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: `Admin ${user.name} assigned to ${school.schoolName} successfully`,
      data: {
        admin: { id: user._id, name: user.name, email: user.email },
        school: { id: school._id, schoolName: school.schoolName, schoolCode: school.schoolCode },
      },
    });
  } catch (error) {
    next(error);
  }
};

// ─── REMOVE ADMIN ───────────────────────────────────────────
exports.removeAdmin = async (req, res, next) => {
  try {
    const { userId } = req.body;
    const schoolId = req.params.id;

    const user = await User.findOne({ _id: userId, schoolId, role: ROLES.SCHOOLADMIN });
    if (!user) {
      return next(new AppError('User is not assigned as admin to this school', 404));
    }

    user.schoolId = undefined;
    user.status = 'INACTIVE';
    await user.save({ validateBeforeSave: false });

    logger.info(`Admin ${user.email} removed from school ${schoolId} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: `Admin ${user.name} removed from school successfully`,
    });
  } catch (error) {
    next(error);
  }
};

// ─── UPLOAD LOGO ────────────────────────────────────────────
exports.uploadLogo = async (req, res, next) => {
  try {
    if (!req.file) {
      return next(new AppError('Please provide an image file', 400));
    }

    const school = await School.findById(req.params.id);
    if (!school) {
      return next(new AppError('School not found', 404));
    }

    // Delete the old logo if replacing
    if (school.logoUrl) {
      await schoolService.deleteLogoFile(school.logoUrl);
    }

    // Process and save new logo
    const logoFilename = await schoolService.processAndSaveLogo(req.file.buffer, req.file.originalname);
    school.logoUrl = schoolService.getLogoUrl(req, logoFilename);
    school.updatedBy = req.user._id;
    await school.save();

    logger.info(`Logo uploaded for school ${school.schoolCode} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Logo uploaded successfully',
      data: { logoUrl: school.logoUrl },
    });
  } catch (error) {
    next(error);
  }
};

// ─── DELETE LOGO ────────────────────────────────────────────
exports.deleteLogo = async (req, res, next) => {
  try {
    const school = await School.findById(req.params.id);
    if (!school) {
      return next(new AppError('School not found', 404));
    }

    if (!school.logoUrl) {
      return next(new AppError('School does not have a logo', 400));
    }

    await schoolService.deleteLogoFile(school.logoUrl);
    school.logoUrl = null;
    school.updatedBy = req.user._id;
    await school.save();

    logger.info(`Logo deleted for school ${school.schoolCode} by user ${req.user._id}`);

    res.status(200).json({
      success: true,
      message: 'Logo deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET FILTER OPTIONS ─────────────────────────────────────
exports.getFilterOptions = async (req, res, next) => {
  try {
    const options = await schoolService.getFilterOptions();

    res.status(200).json({
      success: true,
      data: options,
    });
  } catch (error) {
    next(error);
  }
};

// ─── GET SCHOOL STATISTICS ──────────────────────────────────
exports.getStatistics = async (req, res, next) => {
  try {
    const stats = await schoolService.getSchoolStatistics();

    res.status(200).json({
      success: true,
      data: stats,
    });
  } catch (error) {
    next(error);
  }
};
