import { Scale, ExternalLink } from 'lucide-react';

export default function LegalCard({ law }) {
  return (
    <div className="legal-card">
      <div className="legal-card-header">
        <div className="legal-card-icon"><Scale size={20} /></div>
        <div>
          <div className="legal-card-title">{law.law}</div>
          <div className="legal-card-region">{law.region} · {law.title}</div>
        </div>
      </div>
      <div className="legal-card-body">
        <ul>
          {law.articles?.map((article, i) => (
            <li key={i}>
              <strong>{article.article}</strong> — {article.title}
              <div style={{ color: 'var(--text-muted)', fontSize: 'var(--text-xs)', marginTop: 2 }}>
                {article.description}
              </div>
            </li>
          ))}
        </ul>
        {law.penalties && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-3) var(--space-4)', background: 'rgba(255,51,102,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(255,51,102,0.15)' }}>
            <strong style={{ color: 'var(--accent-red)', fontSize: 'var(--text-xs)' }}>Penalties:</strong>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)', marginLeft: 8 }}>{law.penalties}</span>
          </div>
        )}
      </div>
    </div>
  );
}
