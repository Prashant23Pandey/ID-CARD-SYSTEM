const { ROLES } = require('../models/User');

/**
 * Ensures the user has a specific role
 */
const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`,
      });
    }
    next();
  };
};

/**
 * Ensures multi-tenant isolation.
 * A school admin or teacher can only access data belonging to their own school.
 * Superadmin can access any school.
 */
const requireSchoolAccess = (req, res, next) => {
  const targetSchoolId = req.params.schoolId || req.body.schoolId || req.query.schoolId;

  if (!targetSchoolId) {
    return next(); // If no schoolId is targeted in request, proceed. (Route specific logic might still apply)
  }

  // Superadmin bypasses school isolation checks
  if (req.user.role === ROLES.SUPERADMIN) {
    return next();
  }

  // Check if the user's schoolId matches the requested schoolId
  if (req.user.schoolId && req.user.schoolId.toString() === targetSchoolId.toString()) {
    return next();
  }

  return res.status(403).json({
    success: false,
    message: 'Cross-school access denied. You can only interact with data from your own school.',
  });
};

module.exports = {
  requireRole,
  requireSchoolAccess,
};
