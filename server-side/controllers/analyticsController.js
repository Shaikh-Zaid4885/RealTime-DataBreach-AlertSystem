const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const User = require('../models/User');
const encryptionService = require('../services/encryptionService');
const xposedOrNotService = require('../services/xposedOrNotService');
const logger = require('../utils/logger');
const mongoose = require('mongoose');

// Simple in-memory cache for global analytics (valid for 1 hour)
let globalAnalyticsCache = null;
let globalAnalyticsCacheTime = 0;

exports.getGlobalAnalytics = async (req, res, next) => {
  try {
    const CACHE_TTL = 3600000; // 1 hour
    if (globalAnalyticsCache && Date.now() - globalAnalyticsCacheTime < CACHE_TTL) {
      return res.json({ success: true, data: globalAnalyticsCache });
    }

    const breaches = await xposedOrNotService.getAllBreaches();
    
    let totalRecords = 0;
    let verifiedCount = 0;
    const dataTypesCount = {};
    const yearlyTrend = {};
    const industryCount = {};

    breaches.forEach(b => {
      totalRecords += (b.pwnCount || 0);
      if (b.isVerified) verifiedCount++;

      // Aggregate data types
      if (Array.isArray(b.dataClasses)) {
        b.dataClasses.forEach(dt => {
          dataTypesCount[dt] = (dataTypesCount[dt] || 0) + 1;
        });
      }

      // Aggregate yearly trends
      if (b.breachDate) {
        const year = new Date(b.breachDate).getFullYear();
        if (year > 2000 && year <= new Date().getFullYear()) {
          if (!yearlyTrend[year]) yearlyTrend[year] = 0;
          yearlyTrend[year]++;
        }
      }

      // Aggregate industries
      if (b.industry && b.industry !== 'Unknown' && b.industry.trim() !== '') {
        const ind = b.industry.trim();
        industryCount[ind] = (industryCount[ind] || 0) + 1;
      }
    });

    // Format Data Types for Recharts PieChart
    const topDataTypes = Object.keys(dataTypesCount)
      .map(name => ({ name, value: dataTypesCount[name] }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 10); // Top 10

    const colors = ['#4C6FFF', '#FF3366', '#00FF88', '#FFB800', '#A855F7', '#06B6D4', '#FF6B35', '#EC4899', '#C0C0C0', '#ffffff'];
    topDataTypes.forEach((dt, i) => dt.color = colors[i % colors.length]);

    // Format Yearly Trends for Recharts AreaChart
    const trendData = Object.keys(yearlyTrend)
      .sort()
      .map(year => ({
        year,
        breaches: yearlyTrend[year]
      }));

    // Format Industries for Recharts BarChart
    const topIndustries = Object.keys(industryCount)
      .map(name => ({ name, count: industryCount[name] }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);

    globalAnalyticsCache = {
      summary: {
        totalBreaches: breaches.length,
        totalRecords,
        verifiedBreaches: verifiedCount,
        verificationRate: Math.round((verifiedCount / breaches.length) * 100) || 0
      },
      dataTypes: topDataTypes,
      yearlyTrend: trendData,
      industries: topIndustries
    };
    globalAnalyticsCacheTime = Date.now();

    res.json({ success: true, data: globalAnalyticsCache });
  } catch (error) {
    next(error);
  }
};

exports.getOverview = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const [totalMonitors, activeMonitors, totalAlerts, unreadAlerts, userAlertsWithBreaches] =
      await Promise.all([
        MonitoredIdentifier.countDocuments({ userId }),
        MonitoredIdentifier.countDocuments({ userId, status: 'active' }),
        Alert.countDocuments({ userId }),
        Alert.countDocuments({ userId, status: 'unread' }),
        Alert.find({ userId, type: 'breach_detected' }).select('breachId severity'),
      ]);

    const totalBreaches = userAlertsWithBreaches.length;
    const criticalBreaches = userAlertsWithBreaches.filter(
      alert => alert.severity === 'CRITICAL' || alert.severity === 'critical'
    ).length;

    const recentAlertsRaw = await Alert.find({ userId })
      .populate('breachId', 'name severity domain')
      .populate('identifierId', 'value')
      .sort('-createdAt')
      .limit(5);

    const recentAlerts = recentAlertsRaw.map(alert => {
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

    const severityDistribution = await Alert.aggregate([
      { $match: { userId: new mongoose.Types.ObjectId(req.user._id || req.user.id) } },
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
