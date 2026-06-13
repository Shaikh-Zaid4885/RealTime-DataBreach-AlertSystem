const User = require('../models/User');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const Alert = require('../models/Alert');
const Breach = require('../models/Breach');
const encryptionService = require('../services/encryptionService');

// @desc    Get system-wide statistics
// @route   GET /api/admin/system-stats
// @access  Private/Admin
exports.getSystemStats = async (req, res, next) => {
  try {
    const [totalUsers, activeMonitors, totalAlerts, totalBreaches] = await Promise.all([
      User.countDocuments(),
      MonitoredIdentifier.countDocuments({ status: 'active' }),
      Alert.countDocuments(),
      Breach.countDocuments()
    ]);

    res.json({
      success: true,
      data: { totalUsers, activeMonitors, totalAlerts, totalBreaches }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users with basic stats
// @route   GET /api/admin/users
// @access  Private/Admin
exports.getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password').sort('-createdAt');
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const monitorCount = await MonitoredIdentifier.countDocuments({ userId: user._id });
      return { ...user.toObject(), monitorCount };
    }));

    res.json({ success: true, count: usersWithStats.length, data: usersWithStats });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a user
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
exports.deleteUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });
    if (user._id.toString() === req.user.id) return res.status(400).json({ success: false, error: 'You cannot delete your own account' });

    await User.findByIdAndDelete(req.params.id);
    await MonitoredIdentifier.deleteMany({ userId: req.params.id });
    await Alert.deleteMany({ userId: req.params.id });

    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Get user details (monitors, alerts, breaches)
// @route   GET /api/admin/users/:id/details
// @access  Private/Admin
exports.getUserDetails = async (req, res, next) => {
  try {
    const userId = req.params.id;
    const monitors = await MonitoredIdentifier.find({ userId }).sort('-createdAt');
    const decryptedMonitors = monitors.map((m) => ({
      _id: m._id, id: m._id, type: m.type,
      value: encryptionService.decrypt(m.value),
      status: m.status, lastChecked: m.lastChecked,
      breachCount: m.breachCount, createdAt: m.createdAt,
    }));

    const alerts = await Alert.find({ userId })
      .populate('breachId')
      .populate('identifierId')
      .sort('-createdAt');

    const breaches = alerts
      .filter((a) => a.breachId)
      .map((a) => {
        let monitorValue = null;
        if (a.identifierId && a.identifierId.value) {
          try {
            monitorValue = encryptionService.decrypt(a.identifierId.value);
          } catch (e) {
            monitorValue = 'Unknown';
          }
        }
        return {
          ...a.breachId.toObject(),
          alertId: a._id,
          alertStatus: a.status,
          alertCreatedAt: a.createdAt,
          monitorValue
        };
      });

    res.json({
      success: true,
      data: {
        monitors: decryptedMonitors,
        alerts: alerts.map(a => {
          let mv = null;
          if (a.identifierId && a.identifierId.value) {
             try { mv = encryptionService.decrypt(a.identifierId.value); } catch(e) {}
          }
          return { ...a.toObject(), monitorValue: mv };
        }),
        breaches
      }
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any monitor
// @route   DELETE /api/admin/monitors/:id
// @access  Private/Admin
exports.deleteMonitor = async (req, res, next) => {
  try {
    const monitor = await MonitoredIdentifier.findByIdAndDelete(req.params.id);
    if (!monitor) return res.status(404).json({ success: false, error: 'Monitor not found' });
    await Alert.deleteMany({ identifierId: monitor._id });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete any alert
// @route   DELETE /api/admin/alerts/:id
// @access  Private/Admin
exports.deleteAlert = async (req, res, next) => {
  try {
    const alert = await Alert.findByIdAndDelete(req.params.id);
    if (!alert) return res.status(404).json({ success: false, error: 'Alert not found' });
    res.json({ success: true, data: {} });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role
// @route   PUT /api/admin/users/:id/role
// @access  Private/Admin
exports.updateUserRole = async (req, res, next) => {
  try {
    const { role } = req.body;
    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ success: false, error: 'Invalid role' });
    }

    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ success: false, error: 'User not found' });

    if (user._id.toString() === req.user.id && role !== 'admin') {
      return res.status(400).json({ success: false, error: 'You cannot demote your own account' });
    }

    user.role = role;
    await user.save();

    res.json({ success: true, data: { role: user.role } });
  } catch (error) {
    next(error);
  }
};
