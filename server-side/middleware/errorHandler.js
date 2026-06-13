const logger = require('../utils/logger');

class AppError extends Error {
  constructor(message, statusCode, errorCode) {
    super(message);
    this.statusCode = statusCode;
    this.errorCode = errorCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;
    Error.captureStackTrace(this, this.constructor);
  }
}

const handleCastError = (err) => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new AppError(message, 400, 'INVALID_ID');
};

const handleDuplicateKeyError = (err) => {
  const field = Object.keys(err.keyValue || {})[0] || 'field';
  const value = err.keyValue ? err.keyValue[field] : 'unknown';
  const message = `Duplicate value for '${field}': '${value}'. Please use another value.`;
  return new AppError(message, 409, 'DUPLICATE_KEY');
};

const handleValidationError = (err) => {
  const errors = Object.values(err.errors).map((e) => ({
    field: e.path,
    message: e.message,
    value: e.value,
  }));
  const message = `Validation failed: ${errors.map((e) => e.message).join('. ')}`;
  const error = new AppError(message, 400, 'VALIDATION_ERROR');
  error.validationErrors = errors;
  return error;
};

const handleJWTError = () => {
  return new AppError('Invalid token. Please log in again.', 401, 'INVALID_TOKEN');
};

const handleJWTExpiredError = () => {
  return new AppError('Your token has expired. Please log in again.', 401, 'TOKEN_EXPIRED');
};

const errorHandler = (err, req, res, next) => {
  let error = { ...err, message: err.message, stack: err.stack };

  // Mongoose bad ObjectId
  if (err.name === 'CastError') error = handleCastError(err);

  // Mongoose duplicate key
  if (err.code === 11000) error = handleDuplicateKeyError(err);

  // Mongoose validation error
  if (err.name === 'ValidationError') error = handleValidationError(err);

  // JWT errors
  if (err.name === 'JsonWebTokenError') error = handleJWTError();
  if (err.name === 'TokenExpiredError') error = handleJWTExpiredError();

  const statusCode = error.statusCode || 500;
  const isProduction = process.env.NODE_ENV === 'production';

  // Log the error
  if (statusCode >= 500) {
    logger.error('Server Error:', {
      message: error.message,
      stack: error.stack,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
      userId: req.user ? req.user.id : 'anonymous',
    });
  } else {
    logger.warn('Client Error:', {
      message: error.message,
      statusCode,
      url: req.originalUrl,
      method: req.method,
      ip: req.ip,
    });
  }

  const response = {
    success: false,
    error: error.message || 'Internal Server Error',
    errorCode: error.errorCode || 'INTERNAL_ERROR',
  };

  if (error.validationErrors) {
    response.validationErrors = error.validationErrors;
  }

  if (!isProduction) {
    response.stack = error.stack;
  }

  res.status(statusCode).json(response);
};

module.exports = { AppError, errorHandler };
