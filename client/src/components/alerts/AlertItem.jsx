import { AlertTriangle, ShieldAlert, Info, ShieldCheck, CheckCircle } from 'lucide-react';
import { formatTimeAgo } from '../../utils/helpers';

const severityIcons = { critical: ShieldAlert, high: AlertTriangle, medium: Info, low: ShieldCheck };

export default function AlertItem({ alert, onMarkRead, onAction }) {
  const Icon = severityIcons[alert.severity] || Info;

  return (
    <div id={`alert-${alert._id || alert.id}`} className={`alert-item ${alert.status === 'unread' ? 'unread' : ''}`}>
      <div className={`alert-icon-wrapper ${alert.severity}`}>
        <Icon size={18} />
      </div>
      <div className="alert-content" style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
        <div className="alert-title" style={{ fontSize: 'var(--text-base)', fontWeight: 600, color: 'var(--text-primary)' }}>
          {alert.title || alert.message?.slice(0, 60)}
        </div>
        <div className="alert-message" style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {alert.message}
        </div>

        <div className="alert-time" style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 'var(--space-2)', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span>{formatTimeAgo(alert.createdAt)}</span>
          {alert.monitorValue && (
            <>
              <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: 'var(--border-secondary)' }} />
              <span>Related to: <strong style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{alert.monitorValue}</strong></span>
            </>
          )}
        </div>

        {alert.recommendations && alert.recommendations.length > 0 && (
          <div style={{ marginTop: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: '8px', background: 'var(--bg-tertiary)', padding: 'var(--space-3)', borderRadius: 'var(--radius-lg)', border: '1px solid var(--bg-modifier-border)' }}>
            <div style={{ fontSize: 'var(--text-xs)', fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>Recommended Actions</div>
            <ul style={{ margin: 0, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px', listStyleType: 'disc' }}>
              {alert.recommendations.slice(0, 3).map((rec, i) => (
                <li key={i} style={{ fontSize: 'var(--text-sm)', color: 'var(--text-primary)', display: 'list-item' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <span style={{ fontWeight: 500 }}>{rec.action}</span>
                    {rec.description && rec.description !== rec.action && (
                      <span style={{ color: 'var(--text-secondary)', fontSize: 'var(--text-xs)', lineHeight: 1.4 }}>
                        {rec.description}
                      </span>
                    )}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
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
