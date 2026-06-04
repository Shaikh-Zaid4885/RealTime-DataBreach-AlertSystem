const logger = require('../utils/logger');
const { v4: uuidv4 } = require('uuid');

class ThreatIntelService {
  constructor() {
    this.feeds = this._initializeFeeds();
    this.darkWebMentions = this._initializeDarkWebData();
    this.activeThreatActors = this._initializeThreatActors();
    this.lastFeedUpdate = new Date();
  }

  _initializeFeeds() {
    return [
      {
        id: uuidv4(),
        name: 'Dark Web Forum Monitor',
        type: 'dark_web',
        status: 'active',
        lastUpdate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        entries: [
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000),
            source: 'BreachForums Mirror',
            title: 'New database dump: Indian e-commerce platform — 2.3M records',
            description: 'A threat actor "DarkShadow_IN" posted a fresh database containing emails, hashed passwords, phone numbers, and addresses from an Indian e-commerce site. Data verified as authentic. PAN card numbers found in 15% of records.',
            severity: 'CRITICAL',
            dataTypes: ['email', 'password', 'phone', 'address', 'pan_card'],
            affectedRegions: ['India', 'South Asia'],
            estimatedRecords: 2300000,
            verificationStatus: 'confirmed',
            indicators: ['credential_dump', 'pii_exposure', 'financial_data'],
            tags: ['ecommerce', 'india', 'pan_card', 'fresh_dump'],
          },
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000),
            source: 'Tor Hidden Service Marketplace',
            title: 'Healthcare data for sale — 500K patient records',
            description: 'Medical records including Aadhaar numbers, diagnoses, and insurance details from a hospital chain. HIPAA and DPDP Act implications. Seller claims data is from 2025 breach.',
            severity: 'CRITICAL',
            dataTypes: ['medical', 'aadhaar', 'email', 'phone', 'dob', 'address'],
            affectedRegions: ['India'],
            estimatedRecords: 500000,
            verificationStatus: 'unverified',
            indicators: ['healthcare_breach', 'aadhaar_exposure', 'hipaa_violation'],
            tags: ['healthcare', 'aadhaar', 'hipaa', 'medical_records'],
          },
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000),
            source: 'Russian Cybercrime Forum',
            title: 'Credential stuffing combo list — 10M email:password pairs',
            description: 'Aggregated combo list from multiple breaches. Includes data from LinkedIn, Adobe, and Canva breaches. High success rate reported against Indian banking portals.',
            severity: 'HIGH',
            dataTypes: ['email', 'password'],
            affectedRegions: ['Global', 'India'],
            estimatedRecords: 10000000,
            verificationStatus: 'partially_verified',
            indicators: ['combo_list', 'credential_stuffing', 'banking_threat'],
            tags: ['credential_stuffing', 'banking', 'combo_list'],
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Paste Site Monitor',
        type: 'paste_monitor',
        status: 'active',
        lastUpdate: new Date(Date.now() - 30 * 60 * 1000),
        entries: [
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 45 * 60 * 1000),
            source: 'Pastebin (removed)',
            title: 'Corporate email credentials — Technology company',
            description: 'Paste containing 150 corporate email:password combinations from a tech company. Includes admin and executive accounts. Paste was removed within 2 hours.',
            severity: 'HIGH',
            dataTypes: ['email', 'password'],
            estimatedRecords: 150,
            verificationStatus: 'confirmed',
            indicators: ['corporate_breach', 'executive_access', 'paste_dump'],
            tags: ['corporate', 'technology', 'admin_credentials'],
          },
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000),
            source: 'GitHub Gist (public)',
            title: 'API keys and database credentials accidentally committed',
            description: 'Developer accidentally pushed production database credentials, AWS keys, and Stripe API keys to a public repository. Repository has since been made private.',
            severity: 'HIGH',
            dataTypes: ['api_key', 'database_credentials'],
            estimatedRecords: 1,
            verificationStatus: 'confirmed',
            indicators: ['accidental_exposure', 'api_key_leak', 'cloud_credentials'],
            tags: ['github', 'api_keys', 'developer_error'],
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Ransomware Leak Site Monitor',
        type: 'ransomware',
        status: 'active',
        lastUpdate: new Date(Date.now() - 6 * 60 * 60 * 1000),
        entries: [
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
            source: 'LockBit 4.0 Leak Site',
            title: 'Indian financial services company — ransom deadline approaching',
            description: 'LockBit group claims to have exfiltrated 150GB of data from an Indian NBFC, including customer KYC documents (Aadhaar, PAN), loan records, and internal communications. 72-hour deadline for ransom payment.',
            severity: 'CRITICAL',
            dataTypes: ['aadhaar', 'pan_card', 'bank_account', 'email', 'phone', 'address'],
            affectedRegions: ['India'],
            estimatedRecords: 750000,
            verificationStatus: 'confirmed',
            indicators: ['ransomware', 'data_exfiltration', 'kyc_exposure', 'nbfc_breach'],
            tags: ['lockbit', 'ransomware', 'financial_services', 'kyc'],
          },
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000),
            source: 'BlackCat/ALPHV Successor Site',
            title: 'European healthcare provider — data published',
            description: 'Full data dump published after failed ransom negotiation. Contains patient records, insurance information, and medical histories. GDPR Article 33 notification deadline has passed.',
            severity: 'CRITICAL',
            dataTypes: ['medical', 'ssn', 'email', 'phone', 'address', 'dob'],
            affectedRegions: ['EU', 'Germany', 'France'],
            estimatedRecords: 320000,
            verificationStatus: 'confirmed',
            indicators: ['ransomware', 'full_dump', 'healthcare', 'gdpr_violation'],
            tags: ['blackcat', 'healthcare', 'gdpr', 'full_dump'],
          },
        ],
      },
      {
        id: uuidv4(),
        name: 'Vulnerability Intelligence',
        type: 'vulnerability',
        status: 'active',
        lastUpdate: new Date(Date.now() - 1 * 60 * 60 * 1000),
        entries: [
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000),
            source: 'CVE Intelligence Feed',
            title: 'Critical RCE in popular CMS — active exploitation detected',
            description: 'CVE-2026-XXXX: Remote code execution vulnerability in widely-used CMS platform. Active exploitation observed in the wild, with attackers targeting databases for credential theft.',
            severity: 'CRITICAL',
            indicators: ['rce', 'zero_day', 'active_exploitation', 'cms'],
            tags: ['cve', 'rce', 'cms', 'active_exploit'],
          },
          {
            id: uuidv4(),
            timestamp: new Date(Date.now() - 6 * 60 * 60 * 1000),
            source: 'Security Research Feed',
            title: 'SQL Injection in Indian government portal — patch pending',
            description: 'Researchers discovered SQLi vulnerability in a state government citizen portal. Potential exposure of Aadhaar numbers and personal data. Responsible disclosure in progress.',
            severity: 'HIGH',
            indicators: ['sqli', 'government', 'aadhaar_risk'],
            tags: ['sqli', 'government', 'india', 'responsible_disclosure'],
          },
        ],
      },
    ];
  }

  _initializeDarkWebData() {
    return [
      {
        id: uuidv4(),
        mentionDate: new Date(Date.now() - 2 * 60 * 60 * 1000),
        platform: 'Dark Web Forum',
        type: 'credential_sale',
        content: 'Selling fresh Indian banking credentials. 5000+ accounts with OTP bypass. Verified 85% success rate on major Indian banks.',
        severity: 'CRITICAL',
        relevantDataTypes: ['email', 'password', 'bank_account', 'phone'],
        threatActorId: 'TA-IND-042',
        confidence: 'high',
        actionRequired: true,
      },
      {
        id: uuidv4(),
        mentionDate: new Date(Date.now() - 5 * 60 * 60 * 1000),
        platform: 'Telegram Channel',
        type: 'data_leak',
        content: 'Free sample: 10,000 user records from Indian EdTech platform. Full dump available for $500.',
        severity: 'HIGH',
        relevantDataTypes: ['email', 'phone', 'username', 'dob'],
        threatActorId: 'TA-GLOB-128',
        confidence: 'medium',
        actionRequired: true,
      },
      {
        id: uuidv4(),
        mentionDate: new Date(Date.now() - 12 * 60 * 60 * 1000),
        platform: 'Underground Marketplace',
        type: 'identity_sale',
        content: 'Selling verified KYC kits — Aadhaar + PAN + selfie combinations. Prices from $20 per kit. Bulk discounts available.',
        severity: 'CRITICAL',
        relevantDataTypes: ['aadhaar', 'pan_card', 'biometric'],
        threatActorId: 'TA-IND-067',
        confidence: 'high',
        actionRequired: true,
      },
      {
        id: uuidv4(),
        mentionDate: new Date(Date.now() - 18 * 60 * 60 * 1000),
        platform: 'Hacker Forum',
        type: 'exploit_sale',
        content: 'Zero-day exploit for popular Indian UPI payment app. Allows transaction interception. Demo available.',
        severity: 'CRITICAL',
        relevantDataTypes: ['bank_account', 'phone'],
        threatActorId: 'TA-IND-091',
        confidence: 'low',
        actionRequired: true,
      },
      {
        id: uuidv4(),
        mentionDate: new Date(Date.now() - 36 * 60 * 60 * 1000),
        platform: 'Ransomware Blog',
        type: 'ransomware_victim',
        content: 'Countdown timer: Indian insurance company. 48 hours remaining. 200GB data including policy holder details and medical records.',
        severity: 'HIGH',
        relevantDataTypes: ['email', 'phone', 'medical', 'address', 'pan_card'],
        threatActorId: 'TA-RW-LB4',
        confidence: 'high',
        actionRequired: true,
      },
    ];
  }

  _initializeThreatActors() {
    return [
      {
        id: 'TA-IND-042',
        alias: 'DarkShadow_IN',
        firstSeen: '2024-03-15',
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000),
        targetRegions: ['India', 'South Asia'],
        targetSectors: ['Banking', 'Finance', 'E-commerce'],
        ttps: ['credential_theft', 'phishing', 'otp_bypass'],
        riskLevel: 'CRITICAL',
        knownBreaches: 12,
        totalRecordsCompromised: 5500000,
      },
      {
        id: 'TA-GLOB-128',
        alias: 'DataHarvester',
        firstSeen: '2023-08-20',
        lastActive: new Date(Date.now() - 5 * 60 * 60 * 1000),
        targetRegions: ['Global'],
        targetSectors: ['EdTech', 'Technology', 'SaaS'],
        ttps: ['sql_injection', 'api_abuse', 'web_scraping'],
        riskLevel: 'HIGH',
        knownBreaches: 28,
        totalRecordsCompromised: 15000000,
      },
      {
        id: 'TA-IND-067',
        alias: 'KYC_Kingpin',
        firstSeen: '2024-01-10',
        lastActive: new Date(Date.now() - 12 * 60 * 60 * 1000),
        targetRegions: ['India'],
        targetSectors: ['Financial Services', 'Fintech', 'Telecom'],
        ttps: ['identity_theft', 'social_engineering', 'insider_threat'],
        riskLevel: 'CRITICAL',
        knownBreaches: 8,
        totalRecordsCompromised: 2000000,
      },
      {
        id: 'TA-RW-LB4',
        alias: 'LockBit 4.0 Affiliate',
        firstSeen: '2025-06-01',
        lastActive: new Date(Date.now() - 24 * 60 * 60 * 1000),
        targetRegions: ['India', 'Southeast Asia', 'EU'],
        targetSectors: ['Healthcare', 'Financial Services', 'Manufacturing'],
        ttps: ['ransomware', 'data_exfiltration', 'double_extortion'],
        riskLevel: 'CRITICAL',
        knownBreaches: 45,
        totalRecordsCompromised: 30000000,
      },
    ];
  }

  async getLatestThreats(options = {}) {
    const { limit = 10, severity = null, type = null, region = null } = options;

    logger.info('Fetching latest threat intelligence data');

    let allEntries = [];
    for (const feed of this.feeds) {
      for (const entry of feed.entries) {
        allEntries.push({
          ...entry,
          feedName: feed.name,
          feedType: feed.type,
        });
      }
    }

    if (severity) {
      allEntries = allEntries.filter((e) => e.severity === severity);
    }
    if (type) {
      allEntries = allEntries.filter((e) => e.feedType === type || (e.indicators && e.indicators.includes(type)));
    }
    if (region) {
      allEntries = allEntries.filter(
        (e) => e.affectedRegions && e.affectedRegions.some((r) => r.toLowerCase().includes(region.toLowerCase()))
      );
    }

    allEntries.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

    return {
      threats: allEntries.slice(0, limit),
      totalCount: allEntries.length,
      lastUpdated: this.lastFeedUpdate,
      feedsActive: this.feeds.filter((f) => f.status === 'active').length,
    };
  }

  async getDarkWebMentions(options = {}) {
    const { limit = 10, severity = null, dataType = null } = options;

    logger.info('Fetching dark web mentions');

    let mentions = [...this.darkWebMentions];

    if (severity) {
      mentions = mentions.filter((m) => m.severity === severity);
    }
    if (dataType) {
      mentions = mentions.filter((m) => m.relevantDataTypes.includes(dataType));
    }

    mentions.sort((a, b) => new Date(b.mentionDate) - new Date(a.mentionDate));

    return {
      mentions: mentions.slice(0, limit),
      totalCount: mentions.length,
      criticalCount: mentions.filter((m) => m.severity === 'CRITICAL').length,
      actionRequired: mentions.filter((m) => m.actionRequired).length,
    };
  }

  async getThreatActors(options = {}) {
    const { region = null, sector = null } = options;

    let actors = [...this.activeThreatActors];

    if (region) {
      actors = actors.filter((a) =>
        a.targetRegions.some((r) => r.toLowerCase().includes(region.toLowerCase()))
      );
    }
    if (sector) {
      actors = actors.filter((a) =>
        a.targetSectors.some((s) => s.toLowerCase().includes(sector.toLowerCase()))
      );
    }

    return {
      actors,
      totalActive: actors.length,
      highestRisk: actors.reduce(
        (max, a) => (a.totalRecordsCompromised > max.totalRecordsCompromised ? a : max),
        actors[0]
      ),
    };
  }

  async searchByIdentifier(identifier) {
    logger.info(`Searching threat intel for identifier (simulated): ${identifier.substring(0, 3)}***`);

    const simulatedResults = {
      identifier: identifier.substring(0, 3) + '***',
      found: Math.random() > 0.6,
      mentions: [],
      riskLevel: 'LOW',
    };

    if (simulatedResults.found) {
      simulatedResults.mentions = [
        {
          source: 'Dark Web Paste',
          date: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000),
          context: 'Found in a credential dump associated with a recent e-commerce breach',
          confidence: 'medium',
        },
      ];
      simulatedResults.riskLevel = 'HIGH';
    }

    return simulatedResults;
  }

  async getThreatSummary() {
    const threats = await this.getLatestThreats({ limit: 100 });
    const darkWeb = await this.getDarkWebMentions({ limit: 100 });
    const actors = await this.getThreatActors();

    const severityCounts = { CRITICAL: 0, HIGH: 0, MEDIUM: 0, LOW: 0, INFO: 0 };
    threats.threats.forEach((t) => {
      if (severityCounts[t.severity] !== undefined) severityCounts[t.severity]++;
    });

    return {
      overview: {
        totalActiveThreats: threats.totalCount,
        totalDarkWebMentions: darkWeb.totalCount,
        activeThreatActors: actors.totalActive,
        criticalAlerts: severityCounts.CRITICAL,
        lastUpdated: this.lastFeedUpdate,
      },
      severityDistribution: severityCounts,
      topThreats: threats.threats.slice(0, 5),
      recentDarkWebMentions: darkWeb.mentions.slice(0, 3),
      topThreatActors: actors.actors.slice(0, 3),
      legalImplications: {
        indianLaw: {
          dpdpAct: 'Under DPDP Act 2023 Section 8, data breaches must be notified within 72 hours.',
          itAct: 'IT Act 2000 Section 43A mandates compensation for negligent data handling.',
        },
        internationalLaw: {
          gdpr: 'GDPR Article 33 requires 72-hour breach notification to supervisory authorities.',
          ccpa: 'CCPA grants private right of action with statutory damages of $100-$750 per consumer.',
          hipaa: 'HIPAA requires notification within 60 days for breaches of unsecured PHI.',
        },
      },
    };
  }
}

module.exports = new ThreatIntelService();
