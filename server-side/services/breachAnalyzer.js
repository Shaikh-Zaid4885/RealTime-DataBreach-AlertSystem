const logger = require('../utils/logger');

const DATA_TYPE_WEIGHTS = {
  'Passwords': 30,
  'Credit cards': 28,
  'Bank account numbers': 28,
  'Social security numbers': 27,
  'Financial data': 25,
  'Credit card CVV': 25,
  'PINs': 24,
  'Payment histories': 22,
  'Private messages': 20,
  'Authentication tokens': 20,
  'IP addresses': 15,
  'Phone numbers': 14,
  'Physical addresses': 14,
  'Dates of birth': 13,
  'Email addresses': 10,
  'Usernames': 8,
  'Names': 5,
  'Genders': 3,
  'Geographic locations': 3,
};

const INDUSTRY_RISK = {
  'Finance': 1.5,
  'Banking': 1.5,
  'Healthcare': 1.4,
  'Government': 1.4,
  'Insurance': 1.3,
  'Legal': 1.3,
  'Technology': 1.1,
  'Education': 1.0,
  'Social Media': 1.0,
  'Retail': 0.9,
  'Gaming': 0.8,
  'Entertainment': 0.7,
  'Unknown': 1.0,
};

const RISK_KEYWORDS = {
  critical: ['password', 'credential', 'financial', 'credit card', 'ssn', 'social security', 'bank', 'payment', 'cvv', 'pin'],
  high: ['personal', 'private', 'identity', 'authentication', 'token', 'session', 'medical', 'health'],
  medium: ['email', 'phone', 'address', 'name', 'date of birth', 'username', 'ip address'],
  low: ['gender', 'location', 'language', 'timezone', 'preference'],
};

class BreachAnalyzer {
  calculateSeverityScore(breachData) {
    try {
      let score = 0;

      // Factor 1: Data types exposed (max 40 points)
      const dataClasses = breachData.dataClasses || breachData.exposedData || [];
      let dataTypeScore = 0;
      for (const dataType of dataClasses) {
        const normalizedType = this._normalizeDataType(dataType);
        dataTypeScore += DATA_TYPE_WEIGHTS[normalizedType] || 5;
      }
      score += Math.min(dataTypeScore, 40);

      // Factor 2: Number of records (max 25 points)
      const recordCount = breachData.pwnCount || breachData.exposedRecords || 0;
      if (recordCount > 100000000) score += 25;
      else if (recordCount > 10000000) score += 20;
      else if (recordCount > 1000000) score += 15;
      else if (recordCount > 100000) score += 10;
      else if (recordCount > 10000) score += 7;
      else if (recordCount > 1000) score += 5;
      else score += 2;

      // Factor 3: Recency (max 15 points)
      const breachDate = new Date(breachData.breachDate || breachData.xposed_date);
      if (!isNaN(breachDate.getTime())) {
        const ageMonths = (Date.now() - breachDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
        if (ageMonths < 1) score += 15;
        else if (ageMonths < 3) score += 13;
        else if (ageMonths < 6) score += 10;
        else if (ageMonths < 12) score += 7;
        else if (ageMonths < 24) score += 4;
        else score += 2;
      }

      // Factor 4: Industry risk multiplier (max 10 points)
      const industry = breachData.industry || 'Unknown';
      const industryMultiplier = INDUSTRY_RISK[industry] || 1.0;
      score += Math.round(10 * industryMultiplier);

      // Factor 5: Verification and sensitivity (max 10 points)
      if (breachData.isVerified || breachData.verified) score += 5;
      if (breachData.isSensitive || breachData.passwordRisk === 'high') score += 5;

      return Math.min(Math.round(score), 100);
    } catch (error) {
      logger.error('Error calculating severity score:', error.message);
      return 50;
    }
  }

  getSeverityLevel(score) {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 35) return 'MEDIUM';
    return 'LOW';
  }

  extractKeywords(description) {
    if (!description || typeof description !== 'string') return [];

    const text = description.toLowerCase().replace(/<[^>]*>/g, ' ');
    const keywords = new Set();

    for (const [level, terms] of Object.entries(RISK_KEYWORDS)) {
      for (const term of terms) {
        if (text.includes(term)) {
          keywords.add(term);
        }
      }
    }

    // Extract dates mentioned
    const datePattern = /\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{4}\b/gi;
    const dates = text.match(datePattern) || [];
    dates.forEach((d) => keywords.add(d.trim()));

    // Extract numbers of records mentioned
    const numberPattern = /(\d[\d,]+)\s*(million|billion|thousand|records|accounts|users)/gi;
    const numbers = text.match(numberPattern) || [];
    numbers.forEach((n) => keywords.add(n.trim()));

    return [...keywords];
  }

  identifyRiskFactors(breachData) {
    const factors = [];
    const dataClasses = breachData.dataClasses || breachData.exposedData || [];

    const hasPasswords = dataClasses.some((d) => /password/i.test(d));
    const hasFinancial = dataClasses.some((d) => /credit|bank|financial|payment/i.test(d));
    const hasIdentity = dataClasses.some((d) => /social security|ssn|passport|national id/i.test(d));
    const hasPersonal = dataClasses.some((d) => /phone|address|date of birth/i.test(d));

    if (hasPasswords) {
      factors.push({
        type: 'credential_exposure',
        severity: 'critical',
        description: 'Login credentials were exposed. Immediate password changes required for all accounts using the same password.',
      });
    }

    if (hasFinancial) {
      factors.push({
        type: 'financial_exposure',
        severity: 'critical',
        description: 'Financial data was exposed. Monitor bank accounts and credit reports immediately.',
      });
    }

    if (hasIdentity) {
      factors.push({
        type: 'identity_theft_risk',
        severity: 'critical',
        description: 'Identity documents were exposed. Consider placing a fraud alert and credit freeze.',
      });
    }

    if (hasPersonal) {
      factors.push({
        type: 'personal_data_exposure',
        severity: 'high',
        description: 'Personal contact information was exposed. Watch for phishing attempts and social engineering.',
      });
    }

    const recordCount = breachData.pwnCount || breachData.exposedRecords || 0;
    if (recordCount > 1000000) {
      factors.push({
        type: 'large_scale_breach',
        severity: 'high',
        description: `Large-scale breach affecting ${(recordCount / 1000000).toFixed(1)}M+ records. Data likely widely distributed.`,
      });
    }

    const breachDate = new Date(breachData.breachDate || breachData.xposed_date);
    if (!isNaN(breachDate.getTime())) {
      const ageMonths = (Date.now() - breachDate.getTime()) / (1000 * 60 * 60 * 24 * 30);
      if (ageMonths < 3) {
        factors.push({
          type: 'recent_breach',
          severity: 'high',
          description: 'This is a recent breach. Exposed data may be actively traded or exploited.',
        });
      }
    }

    return factors;
  }

  generateSummary(breachData) {
    const score = this.calculateSeverityScore(breachData);
    const severity = this.getSeverityLevel(score);
    const keywords = this.extractKeywords(breachData.description || '');
    const riskFactors = this.identifyRiskFactors(breachData);

    const dataClasses = breachData.dataClasses || breachData.exposedData || [];
    const recordCount = breachData.pwnCount || breachData.exposedRecords || 0;
    const formattedCount = recordCount > 1000000
      ? `${(recordCount / 1000000).toFixed(1)} million`
      : recordCount > 1000
      ? `${(recordCount / 1000).toFixed(0)} thousand`
      : recordCount.toString();

    const summary = `${breachData.name || 'Unknown entity'} experienced a data breach` +
      (breachData.breachDate ? ` on ${new Date(breachData.breachDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}` : '') +
      `. Approximately ${formattedCount} records were exposed, including ${dataClasses.slice(0, 3).join(', ')}` +
      (dataClasses.length > 3 ? ` and ${dataClasses.length - 3} other data types` : '') +
      `. Severity: ${severity.toUpperCase()} (${score}/100).`;

    return {
      severity,
      severityScore: score,
      keywords,
      riskFactors,
      summary,
      dataClassCount: dataClasses.length,
      recordCount,
    };
  }

  analyzeBatch(breaches) {
    return breaches.map((breach) => ({
      ...breach,
      analysis: this.generateSummary(breach),
    }));
  }

  detectAnomalies(breachHistory) {
    if (!breachHistory || breachHistory.length < 2) return [];

    const anomalies = [];
    const avgInterval = this._calculateAvgInterval(breachHistory);
    const avgSeverity = breachHistory.reduce((s, b) => s + (b.severityScore || 50), 0) / breachHistory.length;

    // Check for breach frequency spikes
    for (let i = 1; i < breachHistory.length; i++) {
      const current = new Date(breachHistory[i].createdAt || breachHistory[i].breachDate);
      const previous = new Date(breachHistory[i - 1].createdAt || breachHistory[i - 1].breachDate);
      const interval = Math.abs(current - previous) / (1000 * 60 * 60 * 24);

      if (avgInterval > 0 && interval < avgInterval * 0.3) {
        anomalies.push({
          type: 'frequency_spike',
          severity: 'warning',
          message: `Unusual spike in breach frequency detected. Interval: ${Math.round(interval)} days vs average ${Math.round(avgInterval)} days.`,
          detectedAt: new Date(),
        });
      }
    }

    // Check for severity escalation
    const recentBreaches = breachHistory.slice(-3);
    const recentAvgSeverity = recentBreaches.reduce((s, b) => s + (b.severityScore || 50), 0) / recentBreaches.length;
    if (recentAvgSeverity > avgSeverity * 1.5) {
      anomalies.push({
        type: 'severity_escalation',
        severity: 'warning',
        message: 'Recent breaches show escalating severity. Enhanced monitoring recommended.',
        detectedAt: new Date(),
      });
    }

    return anomalies;
  }

  _normalizeDataType(dataType) {
    for (const key of Object.keys(DATA_TYPE_WEIGHTS)) {
      if (key.toLowerCase() === dataType.toLowerCase()) return key;
    }
    return dataType;
  }

  _calculateAvgInterval(breaches) {
    if (breaches.length < 2) return 0;
    const dates = breaches
      .map((b) => new Date(b.createdAt || b.breachDate))
      .filter((d) => !isNaN(d.getTime()))
      .sort((a, b) => a - b);

    if (dates.length < 2) return 0;
    let totalInterval = 0;
    for (let i = 1; i < dates.length; i++) {
      totalInterval += (dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24);
    }
    return totalInterval / (dates.length - 1);
  }
}

module.exports = new BreachAnalyzer();
