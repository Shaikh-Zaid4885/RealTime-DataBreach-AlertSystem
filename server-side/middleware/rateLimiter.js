const rateLimit = require('express-rate-limit');
const logger = require('../utils/logger');

const createRateLimiter = (options = {}) => {
  const {
    windowMs = 15 * 60 * 1000,
    max = 100,
    message = 'Too many requests from this IP, please try again later.',
    keyGenerator = null,
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: {
      success: false,
      error: message,
      retryAfter: Math.ceil(windowMs / 1000),
    },
    standardHeaders: true,
    legacyHeaders: false,
    keyGenerator: keyGenerator || ((req) => {
      return req.user ? req.user.id : req.ip;
    }),
    skipSuccessfulRequests,
    skipFailedRequests,
    handler: (req, res, next, options) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}, Path: ${req.originalUrl}`);
      res.status(429).json(options.message);
    },
  });
};

const globalLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests. Please try again in 15 minutes.',
});

const authLimiter = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: 'Too many authentication attempts. Please try again in 15 minutes.',
  skipSuccessfulRequests: true,
});

const apiLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 30,
  message: 'API rate limit exceeded. Please slow down your requests.',
});

const breachCheckLimiter = createRateLimiter({
  windowMs: 1 * 60 * 1000,
  max: 10,
  message: 'Too many breach check requests. Please wait before checking again.',
});

const reportLimiter = createRateLimiter({
  windowMs: 60 * 60 * 1000,
  max: 5,
  message: 'Too many report generation requests. Please try again in an hour.',
});


module.exports = {
  createRateLimiter,
  globalLimiter,
  authLimiter,
  apiLimiter,
  breachCheckLimiter,
  reportLimiter,
};
