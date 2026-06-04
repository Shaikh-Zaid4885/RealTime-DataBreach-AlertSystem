export const API_BASE_URL = 'http://localhost:5000/api';
export const SOCKET_URL = 'http://localhost:5000';

export const SEVERITY = {
  CRITICAL: 'critical',
  HIGH: 'high',
  MEDIUM: 'medium',
  LOW: 'low',
  INFO: 'info',
};

export const SEVERITY_COLORS = {
  critical: '#FF3366',
  high: '#FF6B35',
  medium: '#FFB800',
  low: '#00FF88',
  info: '#4C6FFF',
};

export const SEVERITY_LABELS = {
  critical: 'Critical',
  high: 'High',
  medium: 'Medium',
  low: 'Low',
  info: 'Info',
};

export const DATA_TYPES = [
  'Email Addresses',
  'Passwords',
  'Phone Numbers',
  'Credit Cards',
  'Social Security Numbers',
  'IP Addresses',
  'Physical Addresses',
  'Dates of Birth',
  'Usernames',
  'Bank Account Numbers',
  'Aadhaar Numbers',
  'PAN Numbers',
];

export const MONITOR_TYPES = {
  EMAIL: 'email',
  PHONE: 'phone',
  DOMAIN: 'domain',
  USERNAME: 'username',
};

export const ALERT_STATUS = {
  UNREAD: 'unread',
  READ: 'read',
  ACKNOWLEDGED: 'acknowledged',
  RESOLVED: 'resolved',
};

export const ROUTES = {
  LOGIN: '/login',
  REGISTER: '/register',
  DASHBOARD: '/',
  MONITORS: '/monitors',
  BREACHES: '/breaches',
  BREACH_DETAILS: '/breaches/:id',
  ALERTS: '/alerts',
  ANALYTICS: '/analytics',
  ORG_DASHBOARD: '/organization',
  LEGAL: '/legal',
  SETTINGS: '/settings',
};

export const NAV_ITEMS = [
  { path: '/', label: 'Dashboard', icon: 'LayoutDashboard' },
  { path: '/monitors', label: 'Monitors', icon: 'Radar' },
  { path: '/breaches', label: 'Breaches', icon: 'ShieldAlert' },
  { path: '/alerts', label: 'Alerts', icon: 'Bell' },
  { path: '/analytics', label: 'Analytics', icon: 'BarChart3' },
  { path: '/organization', label: 'Organization', icon: 'Building2' },
  { path: '/legal', label: 'Legal Advisory', icon: 'Scale' },
  { path: '/settings', label: 'Settings', icon: 'Settings' },
];

export const MOCK_USER = {
  _id: '1',
  name: 'Noor Ahmed',
  email: 'noor@breachguard.io',
  role: 'admin',
  organization: 'BreachGuard Security',
  avatar: null,
  createdAt: '2025-01-15T10:30:00Z',
};

export const MOCK_BREACHES = [
  {
    _id: 'b1',
    name: 'MegaCorp Data Leak',
    description: 'A massive breach exposing 150 million user records including emails, hashed passwords, and phone numbers.',
    source: 'MegaCorp Inc.',
    dateReported: '2026-05-28T14:30:00Z',
    dateDiscovered: '2026-05-25T09:00:00Z',
    severity: 'critical',
    recordsAffected: 150000000,
    dataTypes: ['Email Addresses', 'Passwords', 'Phone Numbers'],
    status: 'confirmed',
    region: 'Global',
  },
  {
    _id: 'b2',
    name: 'FinBank Security Incident',
    description: 'Banking credentials and transaction data exposed via unsecured API endpoint.',
    source: 'FinBank International',
    dateReported: '2026-05-30T08:15:00Z',
    dateDiscovered: '2026-05-29T16:45:00Z',
    severity: 'high',
    recordsAffected: 2400000,
    dataTypes: ['Credit Cards', 'Bank Account Numbers', 'Email Addresses'],
    status: 'investigating',
    region: 'Asia Pacific',
  },
  {
    _id: 'b3',
    name: 'HealthPlus Records Exposure',
    description: 'Patient health records and personal information leaked from cloud storage misconfiguration.',
    source: 'HealthPlus Systems',
    dateReported: '2026-05-26T11:00:00Z',
    dateDiscovered: '2026-05-24T07:30:00Z',
    severity: 'high',
    recordsAffected: 8700000,
    dataTypes: ['Social Security Numbers', 'Dates of Birth', 'Physical Addresses'],
    status: 'confirmed',
    region: 'North America',
  },
  {
    _id: 'b4',
    name: 'SocialHub Credential Stuffing',
    description: 'User credentials from previous breaches used in large-scale credential stuffing attack.',
    source: 'SocialHub Platform',
    dateReported: '2026-06-01T06:20:00Z',
    dateDiscovered: '2026-05-31T22:00:00Z',
    severity: 'medium',
    recordsAffected: 520000,
    dataTypes: ['Usernames', 'Passwords', 'Email Addresses'],
    status: 'investigating',
    region: 'Europe',
  },
  {
    _id: 'b5',
    name: 'RetailMax POS Breach',
    description: 'Point-of-sale system compromised at 340 retail locations, credit card data exfiltrated.',
    source: 'RetailMax Corp',
    dateReported: '2026-05-22T15:45:00Z',
    dateDiscovered: '2026-05-20T10:15:00Z',
    severity: 'critical',
    recordsAffected: 34000000,
    dataTypes: ['Credit Cards', 'Physical Addresses', 'Phone Numbers'],
    status: 'confirmed',
    region: 'North America',
  },
  {
    _id: 'b6',
    name: 'EduPortal Student Data Leak',
    description: 'Student records including Aadhaar numbers exposed via SQL injection vulnerability.',
    source: 'EduPortal India',
    dateReported: '2026-05-18T09:30:00Z',
    dateDiscovered: '2026-05-17T14:00:00Z',
    severity: 'medium',
    recordsAffected: 1200000,
    dataTypes: ['Aadhaar Numbers', 'Email Addresses', 'Dates of Birth'],
    status: 'resolved',
    region: 'India',
  },
];

export const MOCK_ALERTS = [
  {
    _id: 'a1',
    title: 'Your email found in MegaCorp breach',
    message: 'noor@breachguard.io was found in the MegaCorp Data Leak affecting 150M records.',
    severity: 'critical',
    type: 'breach_match',
    breachId: 'b1',
    status: 'unread',
    createdAt: '2026-05-28T15:00:00Z',
  },
  {
    _id: 'a2',
    title: 'New high-severity breach detected',
    message: 'FinBank International has reported a security incident affecting banking credentials.',
    severity: 'high',
    type: 'new_breach',
    breachId: 'b2',
    status: 'unread',
    createdAt: '2026-05-30T08:30:00Z',
  },
  {
    _id: 'a3',
    title: 'Monitor triggered: domain match',
    message: 'Your monitored domain breachguard.io appeared in recent credential dumps.',
    severity: 'medium',
    type: 'monitor_trigger',
    breachId: null,
    status: 'read',
    createdAt: '2026-05-29T12:00:00Z',
  },
  {
    _id: 'a4',
    title: 'Credential stuffing activity detected',
    message: 'SocialHub Platform reports credential stuffing targeting accounts linked to your monitors.',
    severity: 'medium',
    type: 'breach_match',
    breachId: 'b4',
    status: 'read',
    createdAt: '2026-06-01T07:00:00Z',
  },
  {
    _id: 'a5',
    title: 'Weekly breach summary',
    message: '3 new breaches reported this week. 2 critical, 1 high severity. Review recommended.',
    severity: 'info',
    type: 'summary',
    breachId: null,
    status: 'acknowledged',
    createdAt: '2026-06-01T09:00:00Z',
  },
];

export const MOCK_MONITORS = [
  { _id: 'm1', type: 'email', value: 'noor@breachguard.io', status: 'active', breachCount: 3, lastChecked: '2026-06-02T10:00:00Z' },
  { _id: 'm2', type: 'email', value: 'admin@company.com', status: 'active', breachCount: 1, lastChecked: '2026-06-02T10:00:00Z' },
  { _id: 'm3', type: 'domain', value: 'breachguard.io', status: 'active', breachCount: 5, lastChecked: '2026-06-02T09:45:00Z' },
  { _id: 'm4', type: 'phone', value: '+91 98765 43210', status: 'active', breachCount: 0, lastChecked: '2026-06-02T09:30:00Z' },
  { _id: 'm5', type: 'username', value: 'noor_ahmed', status: 'paused', breachCount: 2, lastChecked: '2026-05-30T08:00:00Z' },
];

export const MOCK_STATS = {
  totalBreaches: 1247,
  monitoredAssets: 23,
  activeAlerts: 8,
  riskScore: 72,
  breachesThisMonth: 47,
  resolvedThisMonth: 31,
};
