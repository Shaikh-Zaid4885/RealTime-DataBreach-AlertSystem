import { AlertTriangle, ShieldAlert, Info, ShieldCheck } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

const severityIcons = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: Info,
  low: ShieldCheck,
};

export default function RecentAlerts({ alerts }) {
  const data = alerts || [];

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No recent alerts to display.
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-1)' }}>
      {data.map((alert, i) => {
        const Icon = severityIcons[alert.severity] || Info;
        return (
          <div key={alert.id || i} className={`alert-item ${alert.status === 'unread' ? 'unread' : ''}`}
            style={{ animationDelay: `${i * 80}ms` }}>
            <div className={`alert-icon-wrapper ${alert.severity}`}>
              <Icon size={18} />
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">{formatTimeAgo(alert.createdAt)}</div>
            </div>
            <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
          </div>
        );
      })}
    </div>
  );
}
