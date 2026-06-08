const Joi = require('joi');

const schemas = {
  register: Joi.object({
    name: Joi.string().trim().min(2).max(100).required()
      .messages({ 'string.min': 'Name must be at least 2 characters' }),
    email: Joi.string().email().lowercase().trim().required()
      .messages({ 'string.email': 'Please provide a valid email address' }),
    password: Joi.string().min(8).max(128).required()
      .messages({
        'string.min': 'Password must be at least 8 characters',
      }),
    role: Joi.string().valid('user', 'admin').optional(),
    phone: Joi.string().trim().optional().allow(''),
    organization: Joi.string().trim().max(100).optional().allow(''),
  }),

  login: Joi.object({
    email: Joi.string().email().lowercase().trim().required()
      .messages({ 'string.email': 'Please provide a valid email address' }),
    password: Joi.string().required()
      .messages({ 'any.required': 'Password is required' }),
  }),

  updateProfile: Joi.object({
    firstName: Joi.string().trim().min(2).max(50).optional(),
    lastName: Joi.string().trim().min(2).max(50).optional(),
    phone: Joi.string().trim().pattern(/^\+?[1-9]\d{1,14}$/).optional().allow(''),
    organization: Joi.string().trim().max(100).optional().allow(''),
    preferences: Joi.object({
      notifications: Joi.object({
        email: Joi.boolean().optional(),
        sms: Joi.boolean().optional(),
        push: Joi.boolean().optional(),
        inApp: Joi.boolean().optional(),
      }).optional(),
      alertSeverityThreshold: Joi.string().valid('INFO', 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL').optional(),
      digestFrequency: Joi.string().valid('realtime', 'hourly', 'daily', 'weekly').optional(),
      timezone: Joi.string().optional(),
    }).optional(),
  }),

  changePassword: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(8).max(128).required()
      .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&#])[A-Za-z\d@$!%*?&#]{8,}$/)
      .messages({
        'string.pattern.base': 'New password must contain uppercase, lowercase, number, and special character',
      }),
    confirmPassword: Joi.string().valid(Joi.ref('newPassword')).required()
      .messages({ 'any.only': 'Passwords do not match' }),
  }),

  addMonitor: Joi.object({
    type: Joi.string().valid('email', 'domain', 'phone', 'username', 'ip_address').required()
      .messages({ 'any.only': 'Identifier type must be email, domain, phone, username, or ip_address' }),
    value: Joi.string().trim().required()
      .messages({ 'any.required': 'Identifier value is required' }),
    label: Joi.string().trim().max(100).optional(),
    checkFrequency: Joi.string().valid('hourly', 'every6hours', 'daily', 'weekly').optional(),
  }),

  updateMonitor: Joi.object({
    label: Joi.string().trim().max(100).optional(),
    isActive: Joi.boolean().optional(),
    checkFrequency: Joi.string().valid('hourly', 'every6hours', 'daily', 'weekly').optional(),
  }),

  checkEmail: Joi.object({
    email: Joi.string().email().lowercase().trim().required(),
  }),

  checkPassword: Joi.object({
    password: Joi.string().min(1).required(),
  }),

  checkDomain: Joi.object({
    domain: Joi.string().trim().hostname().required(),
  }),

  alertUpdate: Joi.object({
    status: Joi.string().valid('read', 'acknowledged', 'resolved', 'dismissed').required(),
  }),

  generateReport: Joi.object({
    type: Joi.string().valid(
      'breach_summary', 'risk_assessment', 'compliance_audit',
      'executive_summary', 'incident_response', 'weekly_digest',
      'monthly_report', 'custom'
    ).required(),
    title: Joi.string().trim().max(200).optional(),
    dateRange: Joi.object({
      start: Joi.date().iso().required(),
      end: Joi.date().iso().min(Joi.ref('start')).required(),
    }).required(),
    format: Joi.string().valid('json', 'pdf', 'csv', 'html').optional(),
  }),

  pagination: Joi.object({
    page: Joi.number().integer().min(1).default(1),
    limit: Joi.number().integer().min(1).max(100).default(20),
    sort: Joi.string().optional(),
    order: Joi.string().valid('asc', 'desc').default('desc'),
  }),
};

const validate = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: `Validation schema '${schemaName}' not found`,
      });
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      allowUnknown: false,
      stripUnknown: true,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return res.status(400).json({
        success: false,
        error: 'Validation failed',
        validationErrors: errors,
      });
    }

    req.validatedBody = value;
    next();
  };
};

const validateQuery = (schemaName) => {
  return (req, res, next) => {
    const schema = schemas[schemaName];
    if (!schema) {
      return res.status(500).json({
        success: false,
        error: `Validation schema '${schemaName}' not found`,
      });
    }

    const { error, value } = schema.validate(req.query, {
      abortEarly: false,
      allowUnknown: true,
      stripUnknown: false,
    });

    if (error) {
      const errors = error.details.map((detail) => ({
        field: detail.path.join('.'),
        message: detail.message.replace(/"/g, ''),
      }));

      return res.status(400).json({
        success: false,
        error: 'Query validation failed',
        validationErrors: errors,
      });
    }

    req.validatedQuery = value;
    next();
  };
};

module.exports = { schemas, validate, validateQuery };
