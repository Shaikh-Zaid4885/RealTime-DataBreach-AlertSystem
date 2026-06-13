const cron = require('node-cron');
const config = require('../config/config');
const logger = require('../utils/logger');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const Breach = require('../models/Breach');
const Alert = require('../models/Alert');
const User = require('../models/User');
const xposedOrNotService = require('./xposedOrNotService');
const breachAnalyzer = require('./breachAnalyzer');
const recommendationEngine = require('./recommendationEngine');
const notificationService = require('./notificationService');
const threatIntelService = require('./threatIntelService');
const encryptionService = require('./encryptionService');

class SchedulerService {
  constructor() {
    this.jobs = new Map();
    this.isRunning = false;
  }

  initializeJobs(io) {
    this.io = io;

    // Breach check job
    this.addJob('breachCheck', config.cron.breachCheck, async () => {
      await this.runBreachCheck();
    });

    // Threat intelligence update job
    this.addJob('threatIntelUpdate', config.cron.threatIntel, async () => {
      await this.runThreatIntelUpdate();
    });

    // Weekly report generation
    this.addJob('weeklyReport', config.cron.reportGeneration, async () => {
      await this.runWeeklyDigest();
    });

    // Cleanup expired alerts — daily at midnight
    this.addJob('alertCleanup', '0 0 * * *', async () => {
      await this.cleanupExpiredAlerts();
    });

    logger.info(`Scheduler initialized with ${this.jobs.size} jobs`);
  }

  addJob(name, schedule, handler) {
    if (!cron.validate(schedule)) {
      logger.error(`Invalid cron schedule for job '${name}': ${schedule}`);
      return;
    }

    const job = cron.schedule(schedule, async () => {
      logger.info(`[CRON] Starting job: ${name}`);
      const startTime = Date.now();
      try {
        await handler();
        const duration = Date.now() - startTime;
        logger.info(`[CRON] Job '${name}' completed in ${duration}ms`);
      } catch (error) {
        logger.error(`[CRON] Job '${name}' failed:`, error.message);
      }
    }, {
      scheduled: false,
      timezone: 'Asia/Kolkata',
    });

    this.jobs.set(name, { job, schedule, handler, lastRun: null, status: 'idle' });
    logger.info(`Job '${name}' registered with schedule: ${schedule}`);
  }

  startAll() {
    for (const [name, jobData] of this.jobs) {
      jobData.job.start();
      jobData.status = 'active';
      logger.info(`Job '${name}' started`);
    }
    this.isRunning = true;
    logger.info('All scheduler jobs started');
  }

  stopAll() {
    for (const [name, jobData] of this.jobs) {
      jobData.job.stop();
      jobData.status = 'stopped';
    }
    this.isRunning = false;
    logger.info('All scheduler jobs stopped');
  }

  getJobStatus() {
    const status = {};
    for (const [name, jobData] of this.jobs) {
      status[name] = {
        schedule: jobData.schedule,
        status: jobData.status,
        lastRun: jobData.lastRun,
      };
    }
    return status;
  }

  async runBreachCheck() {
    logger.info('[BREACH CHECK] Starting scheduled breach check for all active monitors');

    const identifiers = await MonitoredIdentifier.find({
      isActive: true,
      status: { $in: ['monitoring', 'clean', 'breached'] },
      type: 'email',
    }).populate('userId', 'name email alertPreferences fcmTokens phone');

    let checkedCount = 0;
    let breachesFound = 0;

    for (const identifier of identifiers) {
      try {
        if (!identifier.userId) continue;

        const email = encryptionService.decrypt(identifier.value);
        const result = await xposedOrNotService.checkEmail(email);

        identifier.lastChecked = new Date();
        identifier.nextCheck = new Date(Date.now() + this._getCheckInterval(identifier.checkFrequency));

        if (result.isBreached && result.breaches.length > 0) {
          for (const breachInfo of result.breaches) {
            const existingBreach = await Breach.findOne({ breachId: breachInfo.name });

            if (existingBreach) {
              const alreadyAffected = existingBreach.affectedIdentifiers.some(
                (ai) => ai.identifierId?.toString() === identifier._id.toString()
              );
              if (alreadyAffected) continue;

              existingBreach.affectedIdentifiers.push({
                identifierId: identifier._id,
                userId: identifier.userId._id,
                identifierValue: encryptionService.maskEmail(email),
                identifierType: 'email',
              });
              await existingBreach.save();
            }

            // Get detailed analytics for better analysis
            let analytics = null;
            try {
              analytics = await xposedOrNotService.getBreachAnalytics(email);
            } catch (analyticsErr) {
              logger.warn(`Could not fetch analytics for ${encryptionService.maskEmail(email)}`);
            }

            const breachDetail = analytics?.exposedBreaches?.find(
              (b) => b.name === breachInfo.name || b.breachId === breachInfo.name
            );

            const breachData = {
              name: breachInfo.name,
              domain: breachDetail?.domain || '',
              breachDate: breachDetail?.breachDate || new Date(),
              pwnCount: breachDetail?.exposedRecords || 0,
              exposedData: breachDetail?.exposedData || [],
              industry: breachDetail?.industry || 'Unknown',
              passwordRisk: breachDetail?.passwordRisk || 'unknown',
              isVerified: breachDetail?.verified || false,
              description: breachDetail?.description || '',
            };

            const analysis = breachAnalyzer.generateSummary(breachData);
            const recommendations = recommendationEngine.generateRecommendations(analysis);

            if (!existingBreach) {
              await Breach.create({
                breachId: breachInfo.name,
                name: breachInfo.name,
                domain: breachData.domain,
                breachDate: breachData.breachDate,
                pwnCount: breachData.pwnCount,
                dataClasses: breachData.exposedData,
                exposedData: breachData.exposedData,
                description: breachData.description,
                severity: analysis.severity,
                severityScore: analysis.severityScore,
                source: 'xposedornot',
                isVerified: breachData.isVerified,
                affectedIdentifiers: [{
                  identifierId: identifier._id,
                  userId: identifier.userId._id,
                  identifierValue: encryptionService.maskEmail(email),
                  identifierType: 'email',
                }],
                analysis: {
                  nlpSummary: analysis.summary,
                  riskFactors: analysis.riskFactors.map((rf) => rf.description),
                  attackVector: analysis.severity,
                  impactAssessment: analysis.summary,
                  recommendations: recommendations.allRecommendations.slice(0, 5).map((r) => r.title),
                },
                legalImplications: {
                  applicableLaws: (analysis.legalImplications || []).map((li) => ({
                    law: li.law,
                    section: li.section,
                    description: li.description,
                    jurisdiction: li.jurisdiction,
                  })),
                },
              });
            }

            // Create alert
            const alert = await Alert.create({
              userId: identifier.userId._id,
              identifierId: identifier._id,
              type: 'breach_detected',
              title: `Data Breach Detected: ${breachInfo.name}`,
              message: analysis.summary || `Your email was found in the ${breachInfo.name} data breach.`,
              severity: analysis.severity,
              metadata: {
                affectedEmail: encryptionService.maskEmail(email),
                breachName: breachInfo.name,
                breachDomain: breachData.domain,
                exposedDataTypes: breachData.exposedData,
                source: 'xposedornot',
              },
              recommendations: recommendations.immediateActions.slice(0, 3).map((r) => ({
                action: r.title,
                priority: r.priority,
                description: r.description,
              })),
              legalInfo: {
                applicableLaws: (analysis.legalImplications || []).map((li) => li.law),
              },
            });

            // Send notifications
            const notifResults = await notificationService.sendBreachAlert(
              identifier.userId,
              breachData,
              analysis,
              alert
            );

            alert.channels = {
              email: { sent: notifResults.email.sent, sentAt: notifResults.email.sent ? new Date() : undefined },
              sms: { sent: notifResults.sms.sent, sentAt: notifResults.sms.sent ? new Date() : undefined },
              push: { sent: notifResults.push.sent, sentAt: notifResults.push.sent ? new Date() : undefined },
              inApp: { sent: true, sentAt: new Date() },
              websocket: { sent: false },
            };

            // WebSocket real-time notification
            if (this.io) {
              this.io.to(identifier.userId._id.toString()).emit('breach:alert', {
                alert: {
                  id: alert._id,
                  type: alert.type,
                  title: alert.title,
                  message: alert.message,
                  severity: alert.severity,
                  metadata: alert.metadata,
                  createdAt: alert.createdAt,
                },
              });
              alert.channels.websocket = { sent: true, sentAt: new Date() };
            }

            await alert.save();
            breachesFound++;
          }

          identifier.status = 'breached';
          identifier.breachCount = result.breaches.length;
          identifier.lastBreachDate = new Date();
          identifier.riskScore = Math.min(100, identifier.riskScore + 20);
        } else {
          identifier.status = 'clean';
        }

        await identifier.save();
        checkedCount++;
      } catch (error) {
        logger.error(`Error checking identifier ${identifier._id}:`, error.message);
        identifier.status = 'error';
        await identifier.save();
      }
    }

    const jobData = this.jobs.get('breachCheck');
    if (jobData) jobData.lastRun = new Date();

    logger.info(`[BREACH CHECK] Completed: ${checkedCount} identifiers checked, ${breachesFound} new breaches found`);
  }

  async runThreatIntelUpdate() {
    logger.info('[THREAT INTEL] Updating threat intelligence feeds');

    try {
      const summary = await threatIntelService.getThreatSummary();

      if (this.io) {
        this.io.emit('threat:update', {
          overview: summary.overview,
          topThreats: summary.topThreats,
          updatedAt: new Date(),
        });
      }

      const jobData = this.jobs.get('threatIntelUpdate');
      if (jobData) jobData.lastRun = new Date();

      logger.info(`[THREAT INTEL] Update complete: ${summary.overview.totalActiveThreats} active threats`);
    } catch (error) {
      logger.error('[THREAT INTEL] Update failed:', error.message);
    }
  }

  async runWeeklyDigest() {
    logger.info('[WEEKLY DIGEST] Generating weekly digests for all users');

    try {
      const users = await User.find({
        isActive: true,
        'alertPreferences.frequency': 'weekly',
      });

      for (const user of users) {
        const oneWeekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

        const [monitoredCount, newBreaches, alertCount] = await Promise.all([
          MonitoredIdentifier.countDocuments({ userId: user._id, isActive: true }),
          Alert.countDocuments({ userId: user._id, createdAt: { $gte: oneWeekAgo }, type: 'breach_detected' }),
          Alert.countDocuments({ userId: user._id, createdAt: { $gte: oneWeekAgo } }),
        ]);

        const digestData = {
          monitoredCount,
          newBreaches,
          alertCount,
          riskLevel: newBreaches > 5 ? 'Critical' : newBreaches > 2 ? 'High' : newBreaches > 0 ? 'Medium' : 'Low',
        };

        await notificationService.sendWeeklyDigest(user, digestData);
      }

      const jobData = this.jobs.get('weeklyReport');
      if (jobData) jobData.lastRun = new Date();

      logger.info(`[WEEKLY DIGEST] Sent digests to ${users.length} users`);
    } catch (error) {
      logger.error('[WEEKLY DIGEST] Failed:', error.message);
    }
  }

  async cleanupExpiredAlerts() {
    try {
      const result = await Alert.deleteMany({
        expiresAt: { $lt: new Date() },
        status: { $in: ['read', 'dismissed'] },
      });
      logger.info(`[CLEANUP] Removed ${result.deletedCount} expired alerts`);
    } catch (error) {
      logger.error('[CLEANUP] Alert cleanup failed:', error.message);
    }
  }

  _getCheckInterval(frequency) {
    const intervals = {
      hourly: 60 * 60 * 1000,
      every6hours: 6 * 60 * 60 * 1000,
      daily: 24 * 60 * 60 * 1000,
      weekly: 7 * 24 * 60 * 60 * 1000,
    };
    return intervals[frequency] || intervals.every6hours;
  }
}

module.exports = new SchedulerService();
