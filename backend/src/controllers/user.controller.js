const { User } = require('../models/User');
const { AppError } = require('../middlewares/error.middleware');

exports.getUsers = async (req, res, next) => {
  try {
    const query = {};
    
    // If Schooladmin or Teacher, restrict query to their own school
    if (req.user.schoolId) {
      query.schoolId = req.user.schoolId;
    }

    const users = await User.find(query).select('-__v');

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    next(error);
  }
};

exports.getUserById = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.updateUser = async (req, res, next) => {
  try {
    // Prevent updating password or status via this route
    const { password, passwordHash, status, emailVerified, ...updateData } = req.body;

    const user = await User.findByIdAndUpdate(req.params.id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};

exports.deleteUser = async (req, res, next) => {
  try {
    // Soft delete
    const user = await User.findByIdAndUpdate(req.params.id, { deletedAt: Date.now(), status: 'INACTIVE' }, { new: true });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User deleted successfully',
    });
  } catch (error) {
    next(error);
  }
};

exports.updateStatus = async (req, res, next) => {
  try {
    const { userId, status } = req.body;

    const user = await User.findByIdAndUpdate(userId, { status }, { new: true, runValidators: true });

    if (!user) {
      return next(new AppError('User not found', 404));
    }

    res.status(200).json({
      success: true,
      message: 'User status updated successfully',
      data: user,
    });
  } catch (error) {
    next(error);
  }
};
