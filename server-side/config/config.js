require('dotenv').config();

const config = {
  env: process.env.NODE_ENV || 'development',
  port: parseInt(process.env.PORT, 10) || 5000,
  apiVersion: process.env.API_VERSION || 'v1',

  mongo: {
    uri: process.env.MONGO_URI || 'mongodb://localhost:27017/breach-alert-system',
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'default_jwt_secret_change_me',
    expiresIn: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d',
    expire: process.env.JWT_EXPIRE || process.env.JWT_EXPIRES_IN || '7d',
    refreshSecret: process.env.JWT_REFRESH_SECRET || 'default_refresh_secret_change_me',
    refreshExpiresIn: process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    refreshExpire: process.env.JWT_REFRESH_EXPIRE || process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  },

  encryption: {
    key: process.env.ENCRYPTION_KEY || 'default_encryption_key_64_hex_chars_change_in_production_now!!',
  },

  xposedOrNot: {
    baseUrl: process.env.XPOSED_OR_NOT_BASE_URL || process.env.XON_BASE_URL || 'https://api.xposedornot.com/v1',
    apiKey: process.env.XPOSED_OR_NOT_API_KEY || process.env.XON_API_KEY || '',
    rateLimitMs: 1100,
  },

  smtp: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT, 10) || 587,
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || '',
    pass: process.env.SMTP_PASS || '',
    from: process.env.EMAIL_FROM || 'noreply@breachalert.com',
    fromName: process.env.EMAIL_FROM_NAME || 'Breach Alert System',
  },

  twilio: {
    accountSid: process.env.TWILIO_ACCOUNT_SID || '',
    authToken: process.env.TWILIO_AUTH_TOKEN || '',
    phoneNumber: process.env.TWILIO_PHONE_NUMBER || '',
  },

  firebase: {
    projectId: process.env.FIREBASE_PROJECT_ID || '',
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL || '',
    privateKey: (process.env.FIREBASE_PRIVATE_KEY || '').replace(/\\n/g, '\n'),
  },

  rateLimit: {
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS, 10) || 900000,
    maxRequests: parseInt(process.env.RATE_LIMIT_MAX_REQUESTS, 10) || 100,
  },

  cors: {
    origins: (process.env.CORS_ORIGINS || 'http://localhost:3000,http://localhost:5173').split(','),
  },

  logging: {
    level: process.env.LOG_LEVEL || 'debug',
    dir: process.env.LOG_DIR || 'logs',
  },

  cron: {
    breachCheck: process.env.BREACH_CHECK_CRON || '0 */6 * * *',
    threatIntel: process.env.THREAT_INTEL_CRON || '0 */12 * * *',
    reportGeneration: process.env.REPORT_GENERATION_CRON || '0 0 * * 1',
  },

  admin: {
    email: process.env.ADMIN_EMAIL || 'admin@breachalert.com',
    defaultPassword: process.env.ADMIN_DEFAULT_PASSWORD || 'ChangeThisPassword123!',
  },

  legalReferences: {
    indian: [
      {
        name: 'Information Technology Act, 2000',
        shortName: 'IT Act 2000',
        sections: [
          { section: '43A', description: 'Compensation for failure to protect data' },
          { section: '72A', description: 'Punishment for disclosure of information in breach of lawful contract' },
          { section: '66', description: 'Computer related offences' },
          { section: '72', description: 'Penalty for breach of confidentiality and privacy' },
        ],
        url: 'https://www.meity.gov.in/content/information-technology-act',
      },
      {
        name: 'Digital Personal Data Protection Act, 2023',
        shortName: 'DPDP Act 2023',
        sections: [
          { section: '8', description: 'Obligations of Data Fiduciary — breach notification within 72 hours' },
          { section: '9', description: 'Processing of personal data of children' },
          { section: '15', description: 'Penalties up to ₹250 crore for data breaches' },
          { section: '21', description: 'Data Protection Board of India' },
        ],
        url: 'https://www.meity.gov.in/data-protection-framework',
      },
    ],
    international: [
      {
        name: 'General Data Protection Regulation',
        shortName: 'GDPR',
        articles: [
          { article: '33', description: 'Notification of data breach to supervisory authority within 72 hours' },
          { article: '34', description: 'Communication of data breach to data subject' },
          { article: '83', description: 'Fines up to €20M or 4% of global annual turnover' },
        ],
        url: 'https://gdpr-info.eu/',
      },
      {
        name: 'California Consumer Privacy Act',
        shortName: 'CCPA',
        sections: [
          { section: '1798.150', description: 'Private right of action for data breaches — $100-$750 per consumer per incident' },
          { section: '1798.155', description: 'Administrative fines up to $7,500 per intentional violation' },
        ],
        url: 'https://oag.ca.gov/privacy/ccpa',
      },
      {
        name: 'Health Insurance Portability and Accountability Act',
        shortName: 'HIPAA',
        sections: [
          { section: 'Breach Notification Rule', description: 'Notify affected individuals within 60 days of discovery' },
          { section: 'Security Rule', description: 'Administrative, physical, and technical safeguards' },
          { section: 'Penalties', description: 'Fines from $100 to $50,000 per violation, up to $1.5M per year' },
        ],
        url: 'https://www.hhs.gov/hipaa/',
      },
    ],
  },

  severityLevels: {
    CRITICAL: { value: 5, label: 'Critical', color: '#FF0000' },
    HIGH: { value: 4, label: 'High', color: '#FF4500' },
    MEDIUM: { value: 3, label: 'Medium', color: '#FFA500' },
    LOW: { value: 2, label: 'Low', color: '#FFD700' },
    INFO: { value: 1, label: 'Informational', color: '#00BFFF' },
  },

  dataCategories: [
    'email', 'password', 'username', 'phone', 'address',
    'ssn', 'credit_card', 'bank_account', 'dob', 'ip_address',
    'medical', 'biometric', 'passport', 'aadhaar', 'pan_card',
  ],

  // Convenience accessors used by server.js
  get nodeEnv() { return this.env; },
  get corsOrigins() { return this.cors.origins; },
};

module.exports = config;
