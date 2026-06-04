const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const User = require('../models/User');
const logger = require('../utils/logger');

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalMonitors, activeMonitors, totalAlerts, unreadAlerts, totalBreaches, criticalBreaches] =
      await Promise.all([
        MonitoredIdentifier.countDocuments({ userId }),
        MonitoredIdentifier.countDocuments({ userId, status: 'active' }),
        Alert.countDocuments({ userId }),
        Alert.countDocuments({ userId, status: 'unread' }),
        Breach.countDocuments(),
        Breach.countDocuments({ severity: 'critical' }),
      ]);

    const recentAlerts = await Alert.find({ userId })
      .populate('breachId', 'name severity domain')
      .sort('-createdAt')
      .limit(5);

    const severityDistribution = await Alert.aggregate([
      { $match: { userId: req.user._id || req.user.id } },
      { $group: { _id: '$severity', count: { $sum: 1 } } },
    ]);

    const riskScore = Math.min(
      100,
      Math.round(
        (criticalBreaches * 10 + unreadAlerts * 5 + totalAlerts * 2) /
          Math.max(totalMonitors, 1)
      )
    );

    res.json({
      success: true,
      data: {
        stats: {
          totalMonitors,
          activeMonitors,
          totalAlerts,
          unreadAlerts,
          totalBreaches,
          criticalBreaches,
          riskScore: Math.min(riskScore, 100),
        },
        recentAlerts,
        severityDistribution: severityDistribution.reduce((acc, s) => {
          acc[s._id] = s.count;
          return acc;
        }, {}),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getTrends = async (req, res, next) => {
  try {
    const { period = '12months' } = req.query;
    let startDate = new Date();

    switch (period) {
      case '7days':
        startDate.setDate(startDate.getDate() - 7);
        break;
      case '30days':
        startDate.setDate(startDate.getDate() - 30);
        break;
      case '6months':
        startDate.setMonth(startDate.getMonth() - 6);
        break;
      case '12months':
      default:
        startDate.setFullYear(startDate.getFullYear() - 1);
        break;
    }

    const trends = await Breach.aggregate([
      { $match: { breachDate: { $gte: startDate } } },
      {
        $group: {
          _id: {
            year: { $year: '$breachDate' },
            month: { $month: '$breachDate' },
          },
          count: { $sum: 1 },
          totalRecords: { $sum: '$pwnCount' },
          avgSeverity: { $avg: '$severityScore' },
        },
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } },
    ]);

    const formattedTrends = trends.map((t) => ({
      month: `${t._id.year}-${String(t._id.month).padStart(2, '0')}`,
      breaches: t.count,
      records: t.totalRecords,
      avgSeverity: Math.round(t.avgSeverity || 0),
    }));

    res.json({ success: true, data: { trends: formattedTrends, period } });
  } catch (error) {
    next(error);
  }
};

exports.getDataTypes = async (req, res, next) => {
  try {
    const dataTypes = await Breach.aggregate([
      { $unwind: '$dataClasses' },
      {
        $group: {
          _id: '$dataClasses',
          count: { $sum: 1 },
          totalRecords: { $sum: '$pwnCount' },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 15 },
    ]);

    res.json({
      success: true,
      data: {
        dataTypes: dataTypes.map((d) => ({
          name: d._id,
          count: d.count,
          totalRecords: d.totalRecords,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.getOrgReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const monitors = await MonitoredIdentifier.find({ userId });

    const domainMonitors = monitors.filter((m) => m.type === 'domain');
    const emailMonitors = monitors.filter((m) => m.type === 'email');

    const alerts = await Alert.find({ userId })
      .populate('breachId')
      .sort('-createdAt');

    const criticalAlerts = alerts.filter((a) => a.severity === 'critical');
    const highAlerts = alerts.filter((a) => a.severity === 'high');

    const topBreaches = alerts
      .filter((a) => a.breachId)
      .reduce((acc, a) => {
        const name = a.breachId.name;
        if (!acc[name]) acc[name] = { name, count: 0, severity: a.severity };
        acc[name].count++;
        return acc;
      }, {});

    res.json({
      success: true,
      data: {
        summary: {
          totalMonitors: monitors.length,
          domainMonitors: domainMonitors.length,
          emailMonitors: emailMonitors.length,
          totalAlerts: alerts.length,
          criticalAlerts: criticalAlerts.length,
          highAlerts: highAlerts.length,
        },
        topBreaches: Object.values(topBreaches).sort((a, b) => b.count - a.count).slice(0, 10),
        recentActivity: alerts.slice(0, 20).map((a) => ({
          id: a._id,
          type: a.type,
          severity: a.severity,
          message: a.message,
          createdAt: a.createdAt,
          breachName: a.breachId?.name,
        })),
      },
    });
  } catch (error) {
    next(error);
  }
};
