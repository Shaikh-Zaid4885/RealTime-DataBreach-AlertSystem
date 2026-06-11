export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://realtime-databreach-alertsystem.onrender.com/api';
export const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'https://realtime-databreach-alertsystem.onrender.com';

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


