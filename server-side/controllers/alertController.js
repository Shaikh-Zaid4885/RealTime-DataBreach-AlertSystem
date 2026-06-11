const Alert = require('../models/Alert');
const encryptionService = require('../services/encryptionService');
const logger = require('../utils/logger');

exports.getAlerts = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, status, severity, type } = req.query;
    const filter = { userId: req.user.id };

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (type) filter.type = type;

    const alertsRaw = await Alert.find(filter)
      .populate('breachId', 'name domain severity breachDate dataClasses pwnCount')
      .populate('identifierId', 'value')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const alerts = alertsRaw.map((alert) => {
      const alertObj = alert.toObject();
      if (alert.identifierId && alert.identifierId.value) {
        try {
          alertObj.monitorValue = encryptionService.decrypt(alert.identifierId.value);
        } catch (e) {
          alertObj.monitorValue = 'Unknown';
        }
      }
      return alertObj;
    });

    const total = await Alert.countDocuments(filter);

    res.json({
      success: true,
      data: {
        alerts,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};



exports.markAsRead = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id },
      { status: 'read', readAt: new Date() },
      { new: true }
    );

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, data: { alert } });
  } catch (error) {
    next(error);
  }
};

exports.markAllAsRead = async (req, res, next) => {
  try {
    const result = await Alert.updateMany(
      { userId: req.user.id, status: 'unread' },
      { status: 'read', readAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} alerts marked as read`,
    });
  } catch (error) {
    next(error);
  }
};

exports.markActionCompleted = async (req, res, next) => {
  try {
    const { recommendationIndex } = req.body;
    const alert = await Alert.findOne({ _id: req.params.id, userId: req.user.id });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    if (alert.recommendations && alert.recommendations[recommendationIndex]) {
      alert.recommendations[recommendationIndex].completed = true;
      alert.status = 'resolved';
      await alert.save();
    }

    res.json({ success: true, data: { alert } });
  } catch (error) {
    next(error);
  }
};

exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!alert) {
      return res.status(404).json({ success: false, message: 'Alert not found' });
    }

    res.json({ success: true, message: 'Alert deleted' });
  } catch (error) {
    next(error);
  }
};

exports.resolveBreach = async (req, res, next) => {
  try {
    const { breachId } = req.params;
    
    // Find all alerts for this breach and this user, and mark them as resolved
    const result = await Alert.updateMany(
      { userId: req.user.id, breachId },
      { status: 'resolved', resolvedAt: new Date() }
    );

    res.json({
      success: true,
      message: `${result.modifiedCount} alerts marked as resolved for this breach.`,
    });
  } catch (error) {
    next(error);
  }
};
