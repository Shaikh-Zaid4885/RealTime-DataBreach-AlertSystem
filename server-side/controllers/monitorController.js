const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const xposedOrNotService = require('../services/xposedOrNotService');
const breachAnalyzer = require('../services/breachAnalyzer');
const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const encryptionService = require('../services/encryptionService');
const logger = require('../utils/logger');

exports.getMonitors = async (req, res, next) => {
  try {
    const monitors = await MonitoredIdentifier.find({ userId: req.user.id }).sort('-createdAt');
    const decrypted = monitors.map((m) => ({
      _id: m._id,
      id: m._id,
      type: m.type,
      value: encryptionService.decrypt(m.value),
      status: m.status,
      lastChecked: m.lastChecked,
      breachCount: m.breachCount,
      createdAt: m.createdAt,
    }));
    res.json({ success: true, data: { monitors: decrypted, total: decrypted.length } });
  } catch (error) {
    next(error);
  }
};

exports.addMonitor = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'Type and value are required' });
    }

    const identifier = value.toLowerCase().trim();
    const valueHash = encryptionService.hashSHA256(identifier);

    const existing = await MonitoredIdentifier.findOne({
      userId: req.user.id,
      valueHash,
    });
    if (existing) {
      return res.status(409).json({ success: false, message: 'This identifier is already being monitored' });
    }

    const monitor = await MonitoredIdentifier.create({
      userId: req.user.id,
      type,
      value: encryptionService.encrypt(identifier),
      valueHash,
      status: 'active',
    });

    logger.info(`New monitor added: ${type} for user ${req.user.id}`);

    res.status(201).json({
      success: true,
      message: 'Identifier added for monitoring',
      data: {
        monitor: {
          _id: monitor._id,
          id: monitor._id,
          type: monitor.type,
          value: identifier,
          status: monitor.status,
          createdAt: monitor.createdAt,
        },
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.checkInstant = async (req, res, next) => {
  try {
    const { type, value } = req.body;
    if (!type || !value) {
      return res.status(400).json({ success: false, message: 'Type and value are required' });
    }

    const identifier = value.toLowerCase().trim();
    let scanResult = { exposedBreaches: [] };

    if (type === 'email') {
      scanResult = await xposedOrNotService.getBreachAnalytics(identifier);
    }

    res.json({
      success: true,
      data: {
        breachCount: scanResult.exposedBreaches?.length || 0,
        breaches: scanResult.exposedBreaches || [],
      },
    });
  } catch (error) {
    logger.error('Instant check failed:', error);
    next(error);
  }
};

exports.bulkUpload = async (req, res, next) => {
  try {
    const { identifiers } = req.body;
    if (!Array.isArray(identifiers) || identifiers.length === 0) {
      return res.status(400).json({ success: false, message: 'Provide an array of identifiers' });
    }

    if (identifiers.length > 100) {
      return res.status(400).json({ success: false, message: 'Maximum 100 identifiers per upload' });
    }

    const results = { added: 0, skipped: 0, errors: [] };

    for (const item of identifiers) {
      try {
        const { type, identifier } = item;
        if (!type || !identifier) {
          results.errors.push(`Invalid entry: ${JSON.stringify(item)}`);
          continue;
        }

        const valueHash = encryptionService.hashSHA256(identifier.toLowerCase());
        const existing = await MonitoredIdentifier.findOne({ userId: req.user.id, valueHash });

        if (existing) {
          results.skipped++;
          continue;
        }

        await MonitoredIdentifier.create({
          userId: req.user.id,
          type,
          value: encryptionService.encrypt(identifier.toLowerCase()),
          valueHash,
          status: 'active',
        });
        results.added++;
      } catch (err) {
        results.errors.push(`Error processing ${item.identifier}: ${err.message}`);
      }
    }

    res.json({ success: true, message: 'Bulk upload completed', data: results });
  } catch (error) {
    next(error);
  }
};

exports.deleteMonitor = async (req, res, next) => {
  try {
    const monitor = await MonitoredIdentifier.findOneAndDelete({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({ success: false, message: 'Monitor not found' });
    }

    res.json({ success: true, message: 'Monitor removed successfully' });
  } catch (error) {
    next(error);
  }
};

exports.scanMonitor = async (req, res, next) => {
  try {
    const monitor = await MonitoredIdentifier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({ success: false, message: 'Monitor not found' });
    }

    const decryptedValue = encryptionService.decrypt(monitor.value);
    let scanResult;

    if (monitor.type === 'email') {
      scanResult = await xposedOrNotService.getBreachAnalytics(decryptedValue);
    } else if (monitor.type === 'domain') {
      scanResult = await xposedOrNotService.checkDomain(decryptedValue);
    } else {
      scanResult = await xposedOrNotService.checkEmail(decryptedValue);
    }

    let newBreachCount = 0;

    if (scanResult.exposedBreaches && scanResult.exposedBreaches.length > 0) {
      for (const breachData of scanResult.exposedBreaches) {
        let breach = await Breach.findOne({ name: breachData.name || breachData.breachId });
        const analysis = breachAnalyzer.generateSummary(breachData);

        if (!breach) {
          breach = await Breach.create({
            breachId: breachData.breachId || breachData.name || `xon-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            name: breachData.name || breachData.breachId,
            title: breachData.name || breachData.breachId,
            domain: breachData.domain || '',
            breachDate: breachData.breachDate || breachData.xposed_date,
            pwnCount: breachData.exposedRecords || 0,
            description: breachData.description || '',
            dataClasses: breachData.exposedData || [],
            source: 'xposedornot',
            severity: analysis.severity,
            severityScore: analysis.severityScore,
            isVerified: breachData.verified || false,
            analysis: {
              nlpSummary: analysis.summary,
              riskFactors: analysis.riskFactors.map((r) => r.description),
              recommendations: [
                'Change your password on the affected service immediately',
                'Enable Two-Factor Authentication (2FA)',
                'Check for password reuse on other accounts',
              ],
            },
          });
        }

        const existingAlert = await Alert.findOne({
          userId: req.user.id,
          breachId: breach._id,
          identifierId: monitor._id,
        });

        if (!existingAlert) {
          const recommendations = [
            'Change your password on the affected service immediately',
            'Enable Two-Factor Authentication (2FA)',
            'Check for password reuse on other accounts',
            'Monitor your accounts for suspicious activity',
          ];

          await Alert.create({
            userId: req.user.id,
            breachId: breach._id,
            identifierId: monitor._id,
            type: 'breach_detected',
            title: `New breach detected: ${breach.name}`,
            status: 'unread',
            severity: analysis.severity,
            message: analysis.summary,
            recommendations: recommendations.map((r) => ({
              action: r,
              priority: 'high',
              description: r,
            })),
          });

          newBreachCount++;

          // Emit real-time alert via Socket.IO
          const io = req.app.get('io');
          if (io) {
            io.to(req.user.id.toString()).emit('breach_alert', {
              type: 'new_breach',
              severity: analysis.severity,
              message: analysis.summary,
              breachName: breach.name,
              timestamp: new Date(),
            });
          }
        }
      }
    }

    monitor.lastChecked = new Date();
    monitor.breachCount = (monitor.breachCount || 0) + newBreachCount;
    await monitor.save();

    res.json({
      success: true,
      message: `Scan complete. ${newBreachCount} new breach(es) detected.`,
      data: {
        totalBreaches: scanResult.exposedBreaches ? scanResult.exposedBreaches.length : 0,
        newBreaches: newBreachCount,
        lastChecked: monitor.lastChecked,
      },
    });
  } catch (error) {
    next(error);
  }
};

exports.toggleMonitor = async (req, res, next) => {
  try {
    const monitor = await MonitoredIdentifier.findOne({
      _id: req.params.id,
      userId: req.user.id,
    });

    if (!monitor) {
      return res.status(404).json({ success: false, message: 'Monitor not found' });
    }

    monitor.status = monitor.status === 'active' ? 'paused' : 'active';
    await monitor.save();

    res.json({
      success: true,
      message: `Monitor ${monitor.status}`,
      data: { status: monitor.status },
    });
  } catch (error) {
    next(error);
  }
};
