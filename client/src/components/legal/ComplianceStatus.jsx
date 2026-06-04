import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

const defaultItems = [
  { task: 'Breach notification procedures documented', status: 'pass' },
  { task: 'Data encryption at rest implemented', status: 'pass' },
  { task: 'Incident response plan updated', status: 'partial' },
  { task: 'Regular security audits scheduled', status: 'pass' },
  { task: 'Employee cybersecurity training completed', status: 'fail' },
  { task: 'Data processing records maintained', status: 'pass' },
  { task: 'Third-party vendor security assessments', status: 'partial' },
  { task: 'Data retention policies enforced', status: 'pass' },
];

const statusIcons = { pass: CheckCircle, fail: XCircle, partial: AlertCircle };
const statusLabels = { pass: 'Compliant', fail: 'Non-compliant', partial: 'Partial' };

export default function ComplianceStatus({ items }) {
  const data = items || defaultItems;
  const passCount = data.filter((i) => i.status === 'pass').length;
  const percentage = Math.round((passCount / data.length) * 100);

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
        <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>Overall Compliance</span>
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
