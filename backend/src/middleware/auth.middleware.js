const Volunteer = require('../models/Volunteer');
const jwt = require('jsonwebtoken');

// Authentication middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Access denied. No token provided.'
      });
    }

    // Verify token (you'll need to set JWT_SECRET in your .env file)
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key');

    // Add user info to request
    req.user = decoded;

    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid token.'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expired.'
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Authentication error.'
    });
  }
};

// Role-based authorization middleware factory (OCP)
const authorize = (roles = []) => {
  if (typeof roles === 'string') roles = [roles];

  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: 'Authentication required.'
        });
      }

      const hasRole = roles.length === 0 || roles.includes(req.user.role);

      if (!hasRole) {
        return res.status(403).json({
          success: false,
          message: `Access denied. Requires one of the following roles: ${roles.join(', ')}`
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        success: false,
        message: 'Authorization error.'
      });
    }
  };
};

const authorizeAdmin = authorize(['admin']);
const authorizeVolunteer = authorize(['volunteer', 'admin']);
const authorizeManager = authorize(['Cleanup_Task_Manager', 'admin']);

// Optional: Check if user can access their own data (volunteers can only access their own data)
const authorizeSelfOrAdmin = (req, res, next) => {
  try {
    const targetUserId = req.params.volunteerId || req.params.id;
    const currentUserId = req.user.id;

    // Admin can access any data
    if (req.user.role === 'admin') {
      return next();
    }

    // Volunteers can only access their own data
    if (req.user.role === 'volunteer' && currentUserId === targetUserId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only access your own data.'
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error.'
    });
  }
};

const authorizeVolunteerOwnerOrAdmin = async (req, res, next) => {
  try {
    const volunteer = await Volunteer.findById(req.params.id);

    if (!volunteer) {
      return res.status(404).json({
        success: false,
        message: 'Volunteer not found.'
      });
    }

    // Admin can modify/delete any volunteer
    if (req.user.role === 'admin') {
      return next();
    }

    // Volunteer can modify/delete only their own volunteer record
    if (
      req.user.role === 'volunteer' &&
      volunteer.userId &&
      volunteer.userId.toString() === req.user.id.toString()
    ) {
      return next();
    }

    return res.status(403).json({
      success: false,
      message: 'Access denied. You can only modify your own volunteer profile.'
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Authorization error.'
    });
  }
};

module.exports = {
  authenticate,
  authorize,
  authorizeAdmin,
  authorizeVolunteer,
  authorizeManager,
  authorizeSelfOrAdmin,
  authorizeVolunteerOwnerOrAdmin
};