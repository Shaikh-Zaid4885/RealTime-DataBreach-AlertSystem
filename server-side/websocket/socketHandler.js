const jwt = require('jsonwebtoken');
const config = require('../config/config');
const logger = require('../utils/logger');

const setupSocket = (io) => {
  // Authentication middleware for Socket.IO
  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth.token || socket.handshake.headers.authorization?.replace('Bearer ', '');
      if (!token) {
        return next(new Error('Authentication required'));
      }

      const decoded = jwt.verify(token, config.jwt.secret);
      socket.userId = decoded.id;
      next();
    } catch (error) {
      logger.warn(`Socket auth failed: ${error.message}`);
      next(new Error('Invalid token'));
    }
  });

  io.on('connection', (socket) => {
    const userId = socket.userId;
    logger.info(`WebSocket connected: user ${userId} (socket: ${socket.id})`);

    // Join user-specific room for targeted notifications
    socket.join(userId.toString());

    // Send connection confirmation
    socket.emit('connected', {
      message: 'Connected to breach alert system',
      userId,
      timestamp: new Date(),
    });

    // Handle subscription to specific monitor updates
    socket.on('subscribe_monitor', (monitorId) => {
      socket.join(`monitor:${monitorId}`);
      logger.info(`User ${userId} subscribed to monitor ${monitorId}`);
    });

    // Handle unsubscription
    socket.on('unsubscribe_monitor', (monitorId) => {
      socket.leave(`monitor:${monitorId}`);
    });

    // Handle manual scan request
    socket.on('request_scan', async (data) => {
      socket.emit('scan_status', {
        status: 'started',
        monitorId: data.monitorId,
        message: 'Breach scan initiated...',
        timestamp: new Date(),
      });
    });

    // Handle alert acknowledgment
    socket.on('acknowledge_alert', (alertId) => {
      logger.info(`Alert ${alertId} acknowledged by user ${userId}`);
      socket.emit('alert_acknowledged', { alertId, timestamp: new Date() });
    });

    // Handle disconnect
    socket.on('disconnect', (reason) => {
      logger.info(`WebSocket disconnected: user ${userId} (reason: ${reason})`);
    });

    socket.on('error', (error) => {
      logger.error(`Socket error for user ${userId}:`, error.message);
    });
  });

  logger.info('WebSocket handler initialized');
  return io;
};

module.exports = { setupSocket };
