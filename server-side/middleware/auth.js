const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/config');
const logger = require('../utils/logger');

const protect = async (req, res, next) => {
  try {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Not authorized to access this route. No token provided.',
      });
    }

    try {
      const decoded = jwt.verify(token, config.jwt.secret);

      const user = await User.findById(decoded.id).select('-refreshTokens');

      if (!user) {
        return res.status(401).json({
          success: false,
          error: 'User associated with this token no longer exists.',
        });
      }

      if (!user.isActive) {
        return res.status(401).json({
          success: false,
          error: 'User account has been deactivated.',
        });
      }

      if (user.isLocked) {
        return res.status(423).json({
          success: false,
          error: 'Account is temporarily locked due to too many login attempts.',
        });
      }

      req.user = user;
      next();
    } catch (err) {
      if (err.name === 'TokenExpiredError') {
        return res.status(401).json({
          success: false,
          error: 'Token has expired. Please log in again.',
          code: 'TOKEN_EXPIRED',
        });
      }
      if (err.name === 'JsonWebTokenError') {
        return res.status(401).json({
          success: false,
          error: 'Invalid token. Please log in again.',
          code: 'TOKEN_INVALID',
        });
      }
      throw err;
    }
  } catch (error) {
    logger.error('Auth middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Authentication error.',
    });
  }
};

const authorize = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Not authenticated.',
      });
    }

    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Role '${req.user.role}' is not authorized to access this route.`,
      });
    }
    next();
  };
};

const optionalAuth = async (req, res, next) => {
  try {
    let token;
    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, config.jwt.secret);
        const user = await User.findById(decoded.id).select('-refreshTokens');
        if (user && user.isActive) {
          req.user = user;
        }
      } catch (err) {
        // Token invalid but that's ok for optional auth
      }
    }
    next();
  } catch (error) {
    next();
  }
};

module.exports = { protect, authorize, optionalAuth };
