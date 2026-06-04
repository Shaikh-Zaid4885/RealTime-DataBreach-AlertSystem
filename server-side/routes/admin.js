const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', async (req, res, next) => {
  try {
    const [users, breaches, alerts, monitors] = await Promise.all([
      User.countDocuments(),
      Breach.countDocuments(),
      Alert.countDocuments(),
      MonitoredIdentifier.countDocuments(),
    ]);

    const usersByRole = await User.aggregate([
      { $group: { _id: '$role', count: { $sum: 1 } } },
    ]);

    res.json({
      success: true,
      data: {
        totalUsers: users,
        totalBreaches: breaches,
        totalAlerts: alerts,
        totalMonitors: monitors,
        usersByRole: usersByRole.reduce((acc, r) => { acc[r._id] = r.count; return acc; }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
});

router.get('/users', async (req, res, next) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const users = await User.find()
      .select('-password')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await User.countDocuments();
    res.json({
      success: true,
      data: { users, pagination: { current: parseInt(page), pages: Math.ceil(total / limit), total } },
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
