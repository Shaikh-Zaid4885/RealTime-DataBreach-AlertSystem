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
app.use(cors({
  origin: config.corsOrigins,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
app.use(mongoSanitize());
app.use(hpp());

// Body parsing
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

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

    // Create default admin user
    const User = require('./models/User');
    const bcrypt = require('bcryptjs');
    const adminExists = await User.findOne({ email: 'admin@breachalert.com' });
    if (!adminExists) {
      const salt = await bcrypt.genSalt(12);
      const hashedPassword = await bcrypt.hash('Admin@123', salt);
      await User.create({
        name: 'System Admin',
        email: 'admin@breachalert.com',
        password: hashedPassword,
        role: 'admin',
        organization: 'Breach Alert System',
        alertPreferences: { email: true, sms: false, push: true, frequency: 'instant' },
      });
      logger.info('Default admin user created (admin@breachalert.com / Admin@123)');
    }

    // Start cron scheduler
    schedulerService.startAll(io);

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

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Rejection:', err);
});

module.exports = { app, server };
