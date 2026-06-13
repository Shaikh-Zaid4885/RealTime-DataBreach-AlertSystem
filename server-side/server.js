require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const compression = require('compression');
const mongoSanitize = require('express-mongo-sanitize');
const hpp = require('hpp');

const connectDB = require('./config/db');
const config = require('./config/config');
const logger = require('./utils/logger');
const { errorHandler } = require('./middleware/errorHandler');
const { globalLimiter } = require('./middleware/rateLimiter');
const { setupSocket } = require('./websocket/socketHandler');
const schedulerService = require('./services/schedulerService');

// Route imports
const authRoutes = require('./routes/auth');
const monitorRoutes = require('./routes/monitors');
const breachRoutes = require('./routes/breaches');
const alertRoutes = require('./routes/alerts');
const analyticsRoutes = require('./routes/analytics');
const reportRoutes = require('./routes/reports');
const adminRoutes = require('./routes/admin');

const app = express();
const server = http.createServer(app);

// Socket.IO setup
const io = new Server(server, {
  cors: {
    origin: config.corsOrigins,
    methods: ['GET', 'POST'],
    credentials: true,
  },
  pingTimeout: 60000,
  pingInterval: 25000,
});

// Make io accessible in routes
app.set('io', io);

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
}));
app.use(globalLimiter);
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(mongoSanitize());
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '256kb' }));
app.use(express.urlencoded({ extended: true, limit: '256kb' }));

// Compression
app.use(compression());

// Logging
if (config.nodeEnv === 'development') {
  app.use(morgan('dev'));
}

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/monitors', monitorRoutes);
app.use('/api/breaches', breachRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/admin', adminRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    uptime: process.uptime(),
    timestamp: new Date(),
    environment: config.nodeEnv,
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

// Global error handler
app.use(errorHandler);

// Initialize WebSocket
setupSocket(io);

// Start server
const startServer = async () => {
  try {
    // Connect to MongoDB
    await connectDB();

    // Create default admin user if specified in .env
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminPassword = process.env.ADMIN_DEFAULT_PASSWORD;

    const strongPasswordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;
    if (adminPassword && !strongPasswordRegex.test(adminPassword)) {
      logger.warn('Admin password does not meet strength requirements (uppercase, lowercase, number, special char, 8-16 chars). Please update ADMIN_DEFAULT_PASSWORD in .env');
    }

    if (adminEmail && adminPassword) {
      const adminExists = await User.findOne({ email: adminEmail });
      if (!adminExists) {
        const salt = await bcrypt.genSalt(12);
        const hashedPassword = await bcrypt.hash(adminPassword, salt);
        await User.create({
          name: 'System Admin',
          email: adminEmail,
          password: hashedPassword,
          role: 'admin',
          organization: 'Breach Alert System',
          alertPreferences: { email: true, sms: false, push: true, frequency: 'instant' },
        });
        logger.info(`Admin user created from environment variables (${adminEmail})`);
      }
    }

    // Start cron scheduler
    schedulerService.initializeJobs(io);
    schedulerService.startAll();

    const PORT = config.port;
    server.listen(PORT, () => {
      logger.info(`
╔══════════════════════════════════════════════════════╗
║     Breach Alert System Server Running               ║
║     Port: ${PORT}                                        ║
║     Environment: ${config.nodeEnv.padEnd(35)}║
║     MongoDB: Connected                               ║
║     WebSocket: Active                                ║
║     Scheduler: Running                               ║
╚══════════════════════════════════════════════════════╝
      `);
    });
  } catch (error) {
    logger.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();

// Graceful shutdown
process.on('SIGTERM', () => {
  logger.info('SIGTERM received. Shutting down gracefully...');
  schedulerService.stopAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  logger.info('SIGINT received. Shutting down gracefully...');
  schedulerService.stopAll();
  server.close(() => {
    logger.info('Server closed');
    process.exit(0);
  });
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

module.exports = { app, server };
