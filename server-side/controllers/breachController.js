const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const xposedOrNotService = require('../services/xposedOrNotService');
const breachAnalyzer = require('../services/breachAnalyzer');
const logger = require('../utils/logger');

exports.getBreaches = async (req, res, next) => {
  try {
    const { page = 1, limit = 20, severity, source, search, sort = '-breachDate' } = req.query;
    const filter = {};

    if (severity) filter.severity = severity;
    if (source) filter.source = source;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { title: { $regex: search, $options: 'i' } },
        { domain: { $regex: search, $options: 'i' } },
      ];
    }

    const breaches = await Breach.find(filter)
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    const total = await Breach.countDocuments(filter);

    res.json({
      success: true,
      data: {
        breaches,
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

exports.getXposedAllBreaches = async (req, res, next) => {
  try {
    const breaches = await xposedOrNotService.getAllBreaches();
    res.json({ success: true, data: { breaches } });
  } catch (error) {
    next(error);
  }
};

exports.getBreachById = async (req, res, next) => {
  try {
    const breach = await Breach.findById(req.params.id);
    if (!breach) {
      return res.status(404).json({ success: false, message: 'Breach not found' });
    }
    res.json({ success: true, data: { breach } });
  } catch (error) {
    next(error);
  }
};

exports.getRecentBreaches = async (req, res, next) => {
  try {
    const limit = parseInt(req.query.limit) || 10;
    const breaches = await Breach.find()
      .sort('-addedDate -breachDate')
      .limit(limit);

    res.json({ success: true, data: { breaches } });
  } catch (error) {
    next(error);
  }
};

exports.searchBreaches = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters' });
    }

    const breaches = await Breach.find({
      $or: [
        { name: { $regex: q, $options: 'i' } },
        { title: { $regex: q, $options: 'i' } },
        { domain: { $regex: q, $options: 'i' } },
        { 'dataClasses': { $regex: q, $options: 'i' } },
      ],
    }).sort('-severityScore').limit(50);

    res.json({ success: true, data: { breaches, total: breaches.length } });
  } catch (error) {
    next(error);
  }
};

exports.getUserBreaches = async (req, res, next) => {
  try {
    const alerts = await Alert.find({ userId: req.user.id })
      .populate('breachId')
      .sort('-createdAt');

    const breaches = alerts
      .filter((a) => a.breachId)
      .map((a) => ({
        ...a.breachId.toObject(),
        alertId: a._id,
        alertStatus: a.status,
        alertCreatedAt: a.createdAt,
      }));

    res.json({ success: true, data: { breaches } });
  } catch (error) {
    next(error);
  }
};

exports.syncBreaches = async (req, res, next) => {
  try {
    logger.info('Starting breach database sync with XposedOrNot');
    const allBreaches = await xposedOrNotService.getAllBreaches();

    let added = 0;
    let updated = 0;

    for (const breachData of allBreaches.slice(0, 100)) {
      const existing = await Breach.findOne({ name: breachData.name || breachData.breachId });
      const analysis = breachAnalyzer.generateSummary(breachData);

      if (!existing) {
        await Breach.create({
          breachId: breachData.breachId || breachData.name || `xon-sync-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: breachData.name || breachData.breachId,
          title: breachData.name || breachData.breachId,
          domain: breachData.domain || '',
          breachDate: breachData.breachDate,
          addedDate: breachData.addedDate || new Date(),
          pwnCount: breachData.pwnCount || 0,
          description: breachData.description || '',
          dataClasses: breachData.dataClasses || [],
          source: 'xposedornot',
          severity: analysis.severity,
          severityScore: analysis.severityScore,
          isVerified: breachData.isVerified || false,
          isSensitive: breachData.isSensitive || false,
          analysis: {
            nlpSummary: analysis.summary,
            riskFactors: analysis.riskFactors.map((r) => r.description),
            recommendations: analysis.keywords,
          },
        });
        added++;
      } else {
        existing.severityScore = analysis.severityScore;
        existing.severity = analysis.severity;
        existing.analysis = {
          nlpSummary: analysis.summary,
          riskFactors: analysis.riskFactors.map((r) => r.description),
          recommendations: analysis.keywords,
        };
        await existing.save();
        updated++;
      }
    }

    logger.info(`Breach sync complete: ${added} added, ${updated} updated`);
    res.json({
      success: true,
      message: `Sync complete: ${added} new, ${updated} updated`,
      data: { added, updated },
    });
  } catch (error) {
    next(error);
  }
};
