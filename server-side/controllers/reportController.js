const Alert = require('../models/Alert');
const Breach = require('../models/Breach');
const MonitoredIdentifier = require('../models/MonitoredIdentifier');
const logger = require('../utils/logger');

exports.generateReport = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const { startDate, endDate, type = 'summary' } = req.query;

    const dateFilter = {};
    if (startDate) dateFilter.$gte = new Date(startDate);
    if (endDate) dateFilter.$lte = new Date(endDate);

    const alertFilter = { userId };
    if (Object.keys(dateFilter).length) alertFilter.createdAt = dateFilter;

    const alerts = await Alert.find(alertFilter).populate('breachId').sort('-createdAt');
    const monitors = await MonitoredIdentifier.find({ userId });

    const report = {
      generatedAt: new Date(),
      period: { startDate: startDate || 'All time', endDate: endDate || 'Present' },
      type,
      summary: {
        totalAlerts: alerts.length,
        criticalAlerts: alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'critical').length,
        highAlerts: alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'high').length,
        mediumAlerts: alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'medium').length,
        lowAlerts: alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'low').length,
        actionedAlerts: alerts.filter((a) => a.status === 'resolved').length,
        totalMonitors: monitors.length,
        activeMonitors: monitors.filter((m) => m.status === 'active').length,
      },
      breachDetails: alerts
        .filter((a) => a.breachId)
        .map((a) => ({
          breachName: a.breachId.name,
          severity: a.severity,
          date: a.createdAt,
          dataTypes: a.breachId.dataClasses,
          records: a.breachId.pwnCount,
          recommendations: a.recommendations,
          actioned: a.status === 'resolved',
        })),
      riskAssessment: {
        overallRisk: _calculateOverallRisk(alerts),
        topVulnerabilities: _getTopVulnerabilities(alerts),
        complianceGaps: _getComplianceGaps(alerts),
      },
    };

    logger.info(`Report generated for user ${userId}: ${type}`);
    res.json({ success: true, data: { report } });
  } catch (error) {
    next(error);
  }
};

exports.getLegalAdvisories = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Fetch user's alerts and populate the breach details
    const alerts = await Alert.find({ userId }).populate('breachId').lean();
    
    const activeThreatsMap = new Map();
    const exposedDataTypes = new Set();
    
    for (const alert of alerts) {
      if (alert.breachId && alert.status !== 'resolved') {
        const breachIdStr = alert.breachId._id.toString();
        
        if (!activeThreatsMap.has(breachIdStr)) {
          activeThreatsMap.set(breachIdStr, {
            id: alert.breachId._id,
            name: alert.breachId.name,
            date: alert.breachId.breachDate,
            severity: alert.severity,
            dataClasses: alert.breachId.dataClasses || []
          });
        }
        
        if (alert.breachId.dataClasses) {
          alert.breachId.dataClasses.forEach(dt => exposedDataTypes.add(dt.toLowerCase()));
        }
      }
    }
    
    const activeThreats = Array.from(activeThreatsMap.values());
    
    // Sort threats by severity
    const severityMap = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1, 'info': 0 };
    activeThreats.sort((a, b) => (severityMap[b.severity] || 0) - (severityMap[a.severity] || 0));

    // Generate dynamic security checklist based on exposed data
    const checklist = [];
    const types = Array.from(exposedDataTypes);
    
    if (types.some(t => t.includes('password'))) {
      checklist.push({ task: 'Change passwords for affected accounts immediately', status: 'fail' });
      checklist.push({ task: 'Enable Two-Factor Authentication (2FA)', status: 'fail' });
    } else {
      checklist.push({ task: 'Password security maintained', status: 'pass' });
    }
    
    if (types.some(t => t.includes('credit card') || t.includes('bank') || t.includes('financial'))) {
      checklist.push({ task: 'Monitor bank statements for fraudulent activity', status: 'fail' });
      checklist.push({ task: 'Consider placing a freeze on your credit report', status: 'partial' });
    } else {
      checklist.push({ task: 'Financial data secure', status: 'pass' });
    }
    
    if (types.some(t => t.includes('ssn') || t.includes('social security') || t.includes('aadhaar'))) {
      checklist.push({ task: 'Setup identity theft monitoring', status: 'fail' });
    } else {
      checklist.push({ task: 'Identity documents secure', status: 'pass' });
    }
    
    if (types.some(t => t.includes('email') || t.includes('phone'))) {
      checklist.push({ task: 'Beware of targeted phishing emails or SMS (Smishing)', status: 'fail' });
    }

    if (activeThreats.length === 0) {
      checklist.push({ task: 'No active breaches detected. Keep up the good security hygiene!', status: 'pass' });
    }

    const advisories = [
      {
        id: 'gdpr-1',
        law: 'GDPR (EU)',
        title: 'General Data Protection Regulation',
        articles: [
          { article: 'Article 17', title: 'Right to Erasure (Right to be Forgotten)', description: 'You have the right to demand the breached company deletes all your remaining personal data.' },
          { article: 'Article 15', title: 'Right of Access', description: 'You can demand the company provides a copy of exactly what data of yours they still hold.' },
        ],
        penalties: 'Up to €20 million for companies who fail to protect your data',
        region: 'European Union',
      },
      {
        id: 'ccpa-1',
        law: 'CCPA (California)',
        title: 'California Consumer Privacy Act',
        articles: [
          { article: 'Section 1798.150', title: 'Private right of action', description: 'If your unencrypted data was stolen, you can legally sue the company for damages.' },
          { article: 'Section 1798.105', title: 'Right to Delete', description: 'You have the right to request deletion of personal information collected from you.' },
        ],
        penalties: '$100-$750 per consumer per incident in statutory damages',
        region: 'California, USA',
      },
      {
        id: 'dpdp-2023',
        law: 'DPDP Act 2023 (India)',
        title: 'Digital Personal Data Protection Act, 2023',
        articles: [
          { article: 'Section 12', title: 'Right to Correction & Erasure', description: 'You have the right to demand the data fiduciary corrects or entirely deletes your personal data.' },
          { article: 'Section 13', title: 'Right of Grievance Redressal', description: 'You can file a formal complaint with the Data Protection Board if the company fails to respond.' },
        ],
        penalties: 'Up to ₹250 crore penalty on companies for failing to protect your data',
        region: 'India',
      },
    ];

    res.json({ success: true, data: { advisories, checklist, activeThreats } });
  } catch (error) {
    next(error);
  }
};

exports.getComplianceGuidance = async (req, res, next) => {
  try {
    const breach = await Breach.findById(req.params.breachId);
    if (!breach) {
      return res.status(404).json({ success: false, message: 'Breach not found' });
    }

    const guidance = {
      breachName: breach.name,
      severity: breach.severity,
      applicableLaws: [],
      complianceChecklist: [],
      deadlines: [],
    };

    // GDPR applicability
    guidance.applicableLaws.push({
      law: 'GDPR',
      applicable: true,
      reason: 'Applies if any EU residents are affected',
      actions: [
        'Notify supervisory authority within 72 hours',
        'Document the breach in internal records',
        'Notify affected individuals if high risk',
        'Conduct a Data Protection Impact Assessment',
      ],
    });

    // Indian IT laws
    guidance.applicableLaws.push({
      law: 'IT Act 2000 / DPDP Act 2023',
      applicable: true,
      reason: 'Applies to data processed in India or of Indian citizens',
      actions: [
        'Inform the Data Protection Board of India',
        'Notify affected data principals',
        'Document security safeguards in place',
        'Review and update security measures',
      ],
    });

    // CCPA
    guidance.applicableLaws.push({
      law: 'CCPA',
      applicable: true,
      reason: 'Applies if California residents are affected',
      actions: [
        'Notify affected consumers expeditiously',
        'Provide clear description of the breach',
        'Offer identity theft prevention services if warranted',
      ],
    });

    // HIPAA if health data
    const hasHealthData = breach.dataClasses.some((d) =>
      /health|medical|patient|prescription|diagnosis/i.test(d)
    );
    if (hasHealthData) {
      guidance.applicableLaws.push({
        law: 'HIPAA',
        applicable: true,
        reason: 'Health-related data was exposed',
        actions: [
          'Notify HHS within 60 days',
          'Notify affected individuals within 60 days',
          'If 500+ individuals affected, notify prominent media outlets',
          'Conduct risk assessment under HIPAA Breach Notification Rule',
        ],
      });
    }

    guidance.complianceChecklist = [
      { task: 'Document breach details and timeline', priority: 'immediate', completed: false },
      { task: 'Assess scope of affected data and individuals', priority: 'immediate', completed: false },
      { task: 'Notify relevant regulatory authorities', priority: 'immediate', completed: false },
      { task: 'Notify affected individuals', priority: 'high', completed: false },
      { task: 'Contain the breach and prevent further exposure', priority: 'immediate', completed: false },
      { task: 'Preserve evidence for investigation', priority: 'high', completed: false },
      { task: 'Engage legal counsel', priority: 'high', completed: false },
      { task: 'Review and strengthen security measures', priority: 'medium', completed: false },
      { task: 'Conduct post-incident review', priority: 'medium', completed: false },
      { task: 'Update incident response plan', priority: 'low', completed: false },
    ];

    guidance.deadlines = [
      { law: 'GDPR', action: 'Notify supervisory authority', deadline: '72 hours from awareness' },
      { law: 'DPDP Act', action: 'Notify Data Protection Board', deadline: 'Without unreasonable delay' },
      { law: 'HIPAA', action: 'Notify HHS and individuals', deadline: '60 days from discovery' },
      { law: 'CCPA', action: 'Notify consumers', deadline: 'Expeditiously, without unreasonable delay' },
    ];

    res.json({ success: true, data: { guidance } });
  } catch (error) {
    next(error);
  }
};

function _calculateOverallRisk(alerts) {
  if (alerts.length === 0) return 'low';
  const critical = alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'critical').length;
  const high = alerts.filter((a) => a.severity && a.severity.toLowerCase() === 'high').length;
  if (critical > 2) return 'critical';
  if (critical > 0 || high > 3) return 'high';
  if (high > 0) return 'medium';
  return 'low';
}

function _getTopVulnerabilities(alerts) {
  const dataTypes = {};
  for (const alert of alerts) {
    if (alert.breachId && alert.breachId.dataClasses) {
      for (const dt of alert.breachId.dataClasses) {
        dataTypes[dt] = (dataTypes[dt] || 0) + 1;
      }
    }
  }
  return Object.entries(dataTypes)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([type, count]) => ({ type, count }));
}

function _getComplianceGaps(alerts) {
  const gaps = [];
  const unactioned = alerts.filter((a) => a.status !== 'resolved' && a.severity && a.severity.toLowerCase() === 'critical');
  if (unactioned.length > 0) {
    gaps.push({ area: 'Incident Response', gap: `${unactioned.length} critical alerts without remediation action`, priority: 'high' });
  }
  return gaps;
}
