import { AlertTriangle, ShieldAlert, Info, ShieldCheck, CheckCircle } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

const severityIcons = { critical: ShieldAlert, high: AlertTriangle, medium: Info, low: ShieldCheck };

export default function AlertItem({ alert, onMarkRead, onAction }) {
  const Icon = severityIcons[alert.severity] || Info;

  return (
    <div className={`alert-item ${alert.status === 'unread' ? 'unread' : ''}`}>
      <div className={`alert-icon-wrapper ${alert.severity}`}>
        <Icon size={18} />
      </div>
      <div className="alert-content">
        <div className="alert-title">{alert.title || alert.message?.slice(0, 60)}</div>
        <div className="alert-message">{alert.message}</div>

        {alert.recommendations && alert.recommendations.length > 0 && (
          <div style={{ marginTop: 'var(--space-3)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {alert.recommendations.slice(0, 3).map((rec, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)', fontSize: 'var(--text-xs)' }}>
                <button
                  onClick={() => onAction?.(alert._id || alert.id, i)}
                  style={{
                    width: 18, height: 18, borderRadius: 'var(--radius-full)', border: '1px solid',
                    borderColor: rec.completed ? 'var(--accent-green)' : 'var(--border-secondary)',
                    background: rec.completed ? 'rgba(0,255,136,0.15)' : 'transparent',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, cursor: 'pointer',
                  }}
                >
                  {rec.completed && <CheckCircle size={12} style={{ color: 'var(--accent-green)' }} />}
                </button>
                <span style={{ color: rec.completed ? 'var(--text-muted)' : 'var(--text-secondary)', textDecoration: rec.completed ? 'line-through' : 'none' }}>
                  {rec.action}
                </span>
              </div>
            ))}
          </div>
        )}

        <div className="alert-time">{formatTimeAgo(alert.createdAt)}</div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 'var(--space-2)' }}>
        <span className={`severity-badge ${alert.severity}`}>{alert.severity}</span>
        {alert.status === 'unread' && (
          <button className="btn btn-ghost btn-sm" onClick={() => onMarkRead?.(alert._id || alert.id)}>
            Mark read
          </button>
        )}
      </div>
    </div>
  );
}
