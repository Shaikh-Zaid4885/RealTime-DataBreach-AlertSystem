const winston = require('winston');
require('winston-daily-rotate-file');
const path = require('path');

const logDir = process.env.LOG_DIR || 'logs';

const logFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
  winston.format.errors({ stack: true }),
  winston.format.printf(({ timestamp, level, message, stack, ...meta }) => {
    let log = `${timestamp} [${level.toUpperCase().padEnd(7)}] ${message}`;
    if (stack) {
      log += `\n${stack}`;
    }
    if (Object.keys(meta).length > 0) {
      log += ` ${JSON.stringify(meta)}`;
    }
    return log;
  })
);

const consoleFormat = winston.format.combine(
  winston.format.colorize(),
  winston.format.timestamp({ format: 'HH:mm:ss' }),
  winston.format.printf(({ timestamp, level, message, stack }) => {
    let log = `${timestamp} ${level}: ${message}`;
    if (stack) log += `\n${stack}`;
    return log;
  })
);

const dailyRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'app-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '14d',
  format: logFormat,
  zippedArchive: true,
});

const errorRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'error-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '30d',
  level: 'error',
  format: logFormat,
  zippedArchive: true,
});

const securityRotateTransport = new winston.transports.DailyRotateFile({
  dirname: logDir,
  filename: 'security-%DATE%.log',
  datePattern: 'YYYY-MM-DD',
  maxSize: '20m',
  maxFiles: '90d',
  level: 'info',
  format: logFormat,
  zippedArchive: true,
});

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'debug',
  format: logFormat,
  defaultMeta: { service: 'breach-alert-system' },
  transports: [
    dailyRotateTransport,
    errorRotateTransport,
  ],
  exceptionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'exceptions-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
  rejectionHandlers: [
    new winston.transports.DailyRotateFile({
      dirname: logDir,
      filename: 'rejections-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '30d',
    }),
  ],
});

// Always log to console so platform logs (Render, Docker) can capture them
logger.add(
  new winston.transports.Console({
    format: consoleFormat,
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  })
);

const securityLogger = winston.createLogger({
  level: 'info',
  format: logFormat,
  defaultMeta: { service: 'breach-alert-security' },
  transports: [securityRotateTransport],
});

logger.security = (message, meta = {}) => {
  securityLogger.info(message, { ...meta, type: 'SECURITY' });
  logger.info(`[SECURITY] ${message}`, meta);
};

logger.audit = (action, userId, details = {}) => {
  const auditEntry = {
    action,
    userId,
    timestamp: new Date().toISOString(),
    ...details,
  };
  securityLogger.info(`[AUDIT] ${action}`, auditEntry);
  logger.info(`[AUDIT] ${action} by user ${userId}`, details);
};

logger.stream = {
  write: (message) => {
    logger.info(message.trim());
  },
};

module.exports = logger;
