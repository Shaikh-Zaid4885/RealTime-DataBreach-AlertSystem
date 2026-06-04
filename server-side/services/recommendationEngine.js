const logger = require('../utils/logger');

class RecommendationEngine {
  constructor() {
    this.recommendations = this._buildRecommendationDatabase();
  }

  _buildRecommendationDatabase() {
    return {
      password: [
        {
          id: 'pwd-001',
          title: 'Change Compromised Passwords Immediately',
          priority: 'immediate',
          category: 'credential_security',
          description: 'Your password was found in a data breach. Change it immediately on the affected service and on any other service where you used the same or a similar password.',
          steps: [
            'Go to the affected service and reset your password',
            'Use a password manager to generate a strong, unique password (16+ characters)',
            'Never reuse passwords across different services',
            'Update the password in your password manager',
          ],
          tools: ['Bitwarden (free)', '1Password', 'KeePassXC (free, offline)'],
          timeToImplement: '15 minutes',
          riskReduction: 'HIGH',
        },
        {
          id: 'pwd-002',
          title: 'Enable Two-Factor Authentication (2FA)',
          priority: 'immediate',
          category: 'account_security',
          description: 'Add an extra layer of protection so that even if your password is compromised, attackers cannot access your account without the second factor.',
          steps: [
            'Go to the security settings of each affected account',
            'Enable 2FA using an authenticator app (NOT SMS where possible)',
            'Save backup codes in a secure location',
            'Prefer hardware security keys (YubiKey) for critical accounts',
          ],
          tools: ['Google Authenticator', 'Authy', 'Microsoft Authenticator', 'YubiKey'],
          timeToImplement: '10 minutes per account',
          riskReduction: 'CRITICAL',
        },
        {
          id: 'pwd-003',
          title: 'Audit All Accounts Using Same Password',
          priority: 'high',
          category: 'credential_security',
          description: 'Credential stuffing attacks try leaked passwords against many services. Identify and update all accounts that share the compromised password.',
          steps: [
            'Review saved passwords in your browser or password manager',
            'Identify accounts using the same or similar password',
            'Change each to a unique, strong password',
            'Enable 2FA on each account',
          ],
          timeToImplement: '30-60 minutes',
          riskReduction: 'HIGH',
        },
      ],
      email: [
        {
          id: 'email-001',
          title: 'Watch for Phishing Attempts',
          priority: 'high',
          category: 'email_security',
          description: 'Your email address was exposed in a breach. Expect an increase in targeted phishing emails that may reference the breached service to gain your trust.',
          steps: [
            'Be suspicious of any email claiming to be from the breached service',
            'Do not click links in emails — navigate to websites directly',
            'Check sender addresses carefully for spoofing',
            'Report phishing emails to your email provider',
            'Enable email filtering and spam protection',
          ],
          timeToImplement: 'Ongoing vigilance',
          riskReduction: 'MEDIUM',
        },
        {
          id: 'email-002',
          title: 'Set Up Email Aliases for Future Registrations',
          priority: 'medium',
          category: 'privacy',
          description: 'Use unique email aliases for each service to limit exposure and identify which service leaked your data in future breaches.',
          steps: [
            'Use email aliasing services like SimpleLogin or Apple Hide My Email',
            'Create unique aliases for each service you register with',
            'If an alias starts receiving spam, disable it to identify the source',
          ],
          tools: ['SimpleLogin (free tier)', 'Apple Hide My Email', 'Firefox Relay'],
          timeToImplement: '20 minutes setup',
          riskReduction: 'MEDIUM',
        },
      ],
      financial: [
        {
          id: 'fin-001',
          title: 'Freeze Credit and Monitor Financial Accounts',
          priority: 'immediate',
          category: 'financial_security',
          description: 'Financial data exposure requires immediate credit monitoring and proactive fraud prevention.',
          steps: [
            'Place a credit freeze with CIBIL (India) or credit bureaus',
            'Set up transaction alerts on all bank accounts',
            'Review recent bank and credit card statements for unauthorized charges',
            'Report suspicious transactions immediately to your bank',
            'File a cyber crime complaint at cybercrime.gov.in if fraud is detected',
          ],
          tools: ['CIBIL credit monitoring', 'Bank mobile apps', 'cybercrime.gov.in'],
          timeToImplement: '1-2 hours',
          riskReduction: 'CRITICAL',
        },
        {
          id: 'fin-002',
          title: 'Request New Credit/Debit Cards',
          priority: 'high',
          category: 'financial_security',
          description: 'If credit or debit card numbers were exposed, request replacement cards with new numbers.',
          steps: [
            'Contact your bank to report the breach',
            'Request new cards with new numbers',
            'Update card details on legitimate subscription services',
            'Enable transaction notifications on new cards',
          ],
          timeToImplement: '30 minutes + card delivery time',
          riskReduction: 'HIGH',
        },
      ],
      identity: [
        {
          id: 'id-001',
          title: 'Lock Aadhaar Biometrics',
          priority: 'immediate',
          category: 'identity_protection',
          description: 'If your Aadhaar number was exposed, lock biometric authentication to prevent misuse for identity verification.',
          steps: [
            'Download the mAadhaar app from official app store',
            'Log in and navigate to "Lock Biometrics"',
            'Lock your Aadhaar biometric data',
            'Generate a Virtual ID (VID) for future authentication',
            'File a complaint with UIDAI if misuse is suspected',
          ],
          tools: ['mAadhaar app', 'UIDAI portal (uidai.gov.in)'],
          timeToImplement: '15 minutes',
          riskReduction: 'CRITICAL',
        },
        {
          id: 'id-002',
          title: 'Monitor PAN Card Usage',
          priority: 'high',
          category: 'identity_protection',
          description: 'Exposed PAN numbers can be used for tax fraud and unauthorized financial activities.',
          steps: [
            'Register on the Income Tax e-filing portal to monitor filings',
            'Check Form 26AS for unauthorized tax deductions',
            'Set up SMS alerts for any PAN-linked transactions',
            'File police complaint if PAN misuse is detected',
            'Consider filing Form 13 for PAN replacement if severely compromised',
          ],
          tools: ['Income Tax Portal (incometax.gov.in)', 'TRACES portal'],
          timeToImplement: '30 minutes',
          riskReduction: 'HIGH',
        },
        {
          id: 'id-003',
          title: 'File a Cyber Crime Complaint',
          priority: 'high',
          category: 'legal_action',
          description: 'Report the data breach to Indian cyber crime authorities for investigation and legal protection.',
          steps: [
            'Visit cybercrime.gov.in and file an online complaint',
            'Alternatively, call the Cyber Crime Helpline: 1930',
            'Provide all evidence including breach notification details',
            'Keep the complaint number for reference',
            'Follow up with local cyber cell if needed',
          ],
          tools: ['cybercrime.gov.in', 'Cyber Crime Helpline: 1930'],
          timeToImplement: '30 minutes',
          riskReduction: 'MEDIUM',
        },
      ],
      medical: [
        {
          id: 'med-001',
          title: 'Monitor Medical Records and Insurance Claims',
          priority: 'immediate',
          category: 'medical_security',
          description: 'Exposed medical data can be used for insurance fraud and medical identity theft.',
          steps: [
            'Contact your healthcare provider to verify your records',
            'Review recent insurance claims for unauthorized activity',
            'Request a copy of your medical records to check for alterations',
            'Notify your insurance provider about the breach',
            'Place a fraud alert on your insurance account',
          ],
          timeToImplement: '1-2 hours',
          riskReduction: 'HIGH',
        },
      ],
      general: [
        {
          id: 'gen-001',
          title: 'Enable Account Activity Monitoring',
          priority: 'high',
          category: 'monitoring',
          description: 'Set up active monitoring on all accounts to detect unauthorized access early.',
          steps: [
            'Enable login notifications on all important accounts',
            'Review active sessions and revoke unfamiliar ones',
            'Set up Google/Microsoft account security alerts',
            'Use a breach monitoring service for ongoing protection',
          ],
          timeToImplement: '20 minutes',
          riskReduction: 'MEDIUM',
        },
        {
          id: 'gen-002',
          title: 'Review and Reduce Digital Footprint',
          priority: 'low',
          category: 'privacy',
          description: 'Reduce your exposure by cleaning up old accounts and minimizing personal data shared online.',
          steps: [
            'Delete accounts on services you no longer use',
            'Remove personal information from people-search sites',
            'Review privacy settings on social media accounts',
            'Use privacy-focused alternatives where possible',
          ],
          tools: ['JustDelete.me', 'AccountKiller.com', 'Privacy-focused browsers'],
          timeToImplement: '2-3 hours',
          riskReduction: 'LOW',
        },
      ],
    };
  }

  generateRecommendations(breachAnalysis) {
    logger.info(`Generating recommendations for breach: ${breachAnalysis.breachName || 'Unknown'}`);

    const recommendations = [];
    const dataTypes = (breachAnalysis.dataTypesExposed || []).map((d) => d.toLowerCase());
    const severity = breachAnalysis.severity;
    const score = breachAnalysis.severityScore;

    // Password-related recommendations
    if (dataTypes.some((d) => d.includes('password') || d.includes('credential'))) {
      recommendations.push(...this.recommendations.password);
    }

    // Email-related recommendations
    if (dataTypes.some((d) => d.includes('email'))) {
      recommendations.push(...this.recommendations.email);
    }

    // Financial data recommendations
    if (dataTypes.some((d) => ['credit_card', 'credit card', 'bank', 'bank_account', 'financial'].some((k) => d.includes(k)))) {
      recommendations.push(...this.recommendations.financial);
    }

    // Identity document recommendations
    if (dataTypes.some((d) => ['aadhaar', 'pan', 'pan_card', 'ssn', 'passport'].some((k) => d.includes(k)))) {
      recommendations.push(...this.recommendations.identity);
    }

    // Medical data recommendations
    if (dataTypes.some((d) => d.includes('medical') || d.includes('health'))) {
      recommendations.push(...this.recommendations.medical);
    }

    // Always include general recommendations for MEDIUM+ severity
    if (['CRITICAL', 'HIGH', 'MEDIUM'].includes(severity)) {
      recommendations.push(...this.recommendations.general);
    }

    // Deduplicate by ID
    const uniqueRecommendations = [];
    const seenIds = new Set();
    for (const rec of recommendations) {
      if (!seenIds.has(rec.id)) {
        seenIds.add(rec.id);
        uniqueRecommendations.push(rec);
      }
    }

    // Sort by priority
    const priorityOrder = { immediate: 0, critical: 1, high: 2, medium: 3, low: 4 };
    uniqueRecommendations.sort(
      (a, b) => (priorityOrder[a.priority] || 5) - (priorityOrder[b.priority] || 5)
    );

    logger.info(`Generated ${uniqueRecommendations.length} recommendations`);

    return {
      breachName: breachAnalysis.breachName,
      severity,
      severityScore: score,
      totalRecommendations: uniqueRecommendations.length,
      immediateActions: uniqueRecommendations.filter((r) => r.priority === 'immediate'),
      highPriorityActions: uniqueRecommendations.filter((r) => r.priority === 'high'),
      mediumPriorityActions: uniqueRecommendations.filter((r) => r.priority === 'medium'),
      lowPriorityActions: uniqueRecommendations.filter((r) => r.priority === 'low'),
      allRecommendations: uniqueRecommendations,
      generatedAt: new Date(),
    };
  }

  getRecommendationById(id) {
    for (const category of Object.values(this.recommendations)) {
      const found = category.find((r) => r.id === id);
      if (found) return found;
    }
    return null;
  }

  getRecommendationsByCategory(category) {
    const results = [];
    for (const recs of Object.values(this.recommendations)) {
      results.push(...recs.filter((r) => r.category === category));
    }
    return results;
  }

  generateQuickActions(severity, exposedDataTypes) {
    const quickActions = [];

    if (severity === 'CRITICAL' || severity === 'HIGH') {
      quickActions.push({
        action: 'Change all passwords on affected accounts immediately',
        urgency: 'IMMEDIATE',
        icon: 'lock',
      });
      quickActions.push({
        action: 'Enable 2FA on all critical accounts',
        urgency: 'IMMEDIATE',
        icon: 'shield',
      });
    }

    if (exposedDataTypes.some((d) => d.toLowerCase().includes('aadhaar'))) {
      quickActions.push({
        action: 'Lock Aadhaar biometrics via mAadhaar app',
        urgency: 'IMMEDIATE',
        icon: 'fingerprint',
      });
    }

    if (exposedDataTypes.some((d) => ['credit_card', 'bank'].some((k) => d.toLowerCase().includes(k)))) {
      quickActions.push({
        action: 'Contact your bank and freeze compromised cards',
        urgency: 'IMMEDIATE',
        icon: 'credit-card',
      });
    }

    if (severity === 'CRITICAL') {
      quickActions.push({
        action: 'File complaint at cybercrime.gov.in or call 1930',
        urgency: 'HIGH',
        icon: 'alert-triangle',
      });
    }

    return quickActions;
  }
}

module.exports = new RecommendationEngine();
