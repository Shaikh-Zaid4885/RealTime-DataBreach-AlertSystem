import { Mail, Globe, Phone, Trash2, RefreshCw, Pause, Play, Loader } from 'lucide-react';

const typeIcons = { email: Mail, domain: Globe, phone: Phone };

export default function MonitorList({ monitors, onDelete, onScan, onToggle, scanningId }) {
  const data = monitors || [];

  return (
    <div className="monitor-list">
      {data.map((m) => {
        const Icon = typeIcons[m.type] || Mail;
        return (
          <div key={m.id} className="monitor-item">
            <div className={`monitor-icon ${m.type}`}>
              <Icon size={20} />
            </div>
            <div className="monitor-info">
              <div className="monitor-value">{m.value}</div>
              <div className="monitor-type">{m.type} · {m.breachCount || 0} breaches found</div>
            </div>
            <div className="monitor-status">
              <span className={`monitor-status-dot ${m.status}`} />
              <span>{m.status}</span>
            </div>
            <div style={{ display: 'flex', gap: 'var(--space-2)' }}>

              <button className="btn-icon btn-ghost sm" title={m.status === 'active' ? 'Pause' : 'Resume'} onClick={() => onToggle?.(m.id)} style={{ display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', padding: '4px 10px' }}>
                {m.status === 'active' ? <><Pause size={14} /> Pause</> : <><Play size={14} /> Resume</>}
              </button>
              <button className="btn-icon btn-ghost sm" title="Scan Now" onClick={() => onScan?.(m.id)} disabled={scanningId === m.id} style={{ color: 'var(--accent-blue)', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', padding: '4px 10px' }}>
                {scanningId === m.id ? <><Loader size={14} className="spin" /> Scanning...</> : <><RefreshCw size={14} /> Scan</>}
              </button>
              <button className="btn-icon btn-ghost sm" title="Delete" onClick={() => onDelete?.(m.id)} style={{ color: 'var(--accent-red)', display: 'flex', alignItems: 'center', gap: '4px', width: 'auto', padding: '4px 10px' }}>
                <Trash2 size={14} /> Delete
              </button>
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No monitors yet</div>
          <div className="empty-state-text">Add an email, domain, or phone to start monitoring.</div>
        </div>
      )}
    </div>
  );
}
