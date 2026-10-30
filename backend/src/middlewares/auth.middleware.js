const { verifyToken, TOKEN_TYPES } = require('../utils/jwt');
const { User, STATUS } = require('../models/User');

const requireAuth = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    } else if (req.cookies && req.cookies.accessToken) {
      token = req.cookies.accessToken;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route. Missing token.',
      });
    }

    const decoded = verifyToken(token, TOKEN_TYPES.ACCESS);
    
    // Check if user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        success: false,
        message: 'The user belonging to this token no longer exists.',
      });
    }

    // Check if user is active
    if (currentUser.status !== STATUS.ACTIVE) {
      return res.status(403).json({
        success: false,
        message: `User account is ${currentUser.status.toLowerCase()}. Please contact support.`,
      });
    }

    // Attach user to request object
    req.user = currentUser;
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired. Please refresh your token.',
        isExpired: true, // Specific flag for frontend to trigger refresh
      });
    }
    return res.status(401).json({
      success: false,
      message: 'Not authorized. Invalid token.',
    });
  }
};

module.exports = {
  requireAuth,
};
