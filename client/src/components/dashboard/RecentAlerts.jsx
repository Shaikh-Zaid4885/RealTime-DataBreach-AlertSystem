import { AlertTriangle, ShieldAlert, Info, ShieldCheck } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { formatTimeAgo } from '../../utils/helpers';

const severityIcons = {
  critical: ShieldAlert,
  high: AlertTriangle,
  medium: Info,
  low: ShieldCheck,
};

export default function RecentAlerts({ alerts }) {
  const navigate = useNavigate();
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
          <div key={alert._id || alert.id || i} className={`alert-item ${alert.status === 'unread' ? 'unread' : ''}`}
            onClick={() => navigate(`/alerts#alert-${alert._id || alert.id}`)}
            style={{ animationDelay: `${i * 80}ms`, cursor: 'pointer' }}>
            <div className={`alert-icon-wrapper ${alert.severity}`}>
              <Icon size={18} />
            </div>
            <div className="alert-content">
              <div className="alert-title">{alert.title}</div>
              <div className="alert-message">{alert.message}</div>
              <div className="alert-time">
                {formatTimeAgo(alert.createdAt)}
                {alert.monitorValue && <span style={{ marginLeft: '8px', color: 'var(--text-muted)' }}>· Related to: {alert.monitorValue}</span>}
              </div>
            </div>
            <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
          </div>
        );
      })}
    </div>
  );
}
