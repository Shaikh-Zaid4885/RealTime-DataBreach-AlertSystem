import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const statusIcons = { pass: CheckCircle, fail: XCircle, partial: AlertCircle };
const statusLabels = { pass: 'Secure', fail: 'Action Required', partial: 'Warning' };

export default function SecurityChecklist({ items = [] }) {
  const data = items.length > 0 ? items : [{ task: 'No active breaches detected. Keep up the good security hygiene!', status: 'pass' }];
  const passCount = data.filter((i) => i.status === 'pass').length;
  const percentage = Math.round((passCount / data.length) * 100);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Security Posture Score</span>
        <span style={{ fontSize: 'var(--text-xl)', fontWeight: 800, fontFamily: 'var(--font-mono)', color: percentage >= 80 ? 'var(--accent-green)' : percentage >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)' }}>
          {percentage}%
        </span>
      </div>
      <div style={{ height: 6, background: 'var(--bg-tertiary)', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-5)', overflow: 'hidden' }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: percentage >= 80 ? 'var(--accent-green)' : percentage >= 50 ? 'var(--accent-amber)' : 'var(--accent-red)', borderRadius: 'var(--radius-full)', transition: 'width 1s ease-out' }} />
      </div>
      <div className="compliance-list">
        {data.map((item, i) => {
          const Icon = statusIcons[item.status];
          return (
            <div key={i} className="compliance-item">
              <div className={`compliance-check ${item.status}`}>
                <Icon size={14} />
              </div>
              <span className="compliance-label">{item.task}</span>
              <span className={`compliance-status-text`} style={{ color: item.status === 'pass' ? 'var(--accent-green)' : item.status === 'fail' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>
                {statusLabels[item.status]}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
