import { Globe, Calendar, Users, Database } from 'lucide-react';
import SeverityBadge from './SeverityBadge';

export default function BreachCard({ breach, onClick }) {
  const formatCount = (n) => {
    if (!n) return '0';
    if (n >= 1000000000) return `${(n / 1000000000).toFixed(1)}B`;
    if (n >= 1000000) return `${(n / 1000000).toFixed(1)}M`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}K`;
    return n.toString();
  };

  return (
    <div className="breach-card" onClick={() => onClick?.(breach)}>
      <div className="breach-card-header">
        <div>
          <div className="breach-card-title">{breach.name || breach.title}</div>
          <div className="breach-card-source">{breach.domain || 'Unknown source'}</div>
        </div>
        <SeverityBadge severity={breach.severity} />
      </div>

      <div className="breach-card-body">
        {breach.description
          ? breach.description.replace(/<[^>]*>/g, '').slice(0, 150) + '...'
          : 'No description available for this breach.'}
      </div>

      <div className="breach-card-meta">
        <div className="breach-card-meta-item">
          <Calendar size={14} />
          {breach.breachDate
            ? new Date(breach.breachDate).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })
            : 'Unknown date'}
        </div>
        <div className="breach-card-meta-item">
          <Users size={14} />
          {formatCount(breach.pwnCount)} records
        </div>
        <div className="breach-card-meta-item">
          <Database size={14} />
          {(breach.dataClasses || []).length} data types
        </div>
      </div>

      {breach.dataClasses && breach.dataClasses.length > 0 && (
        <div className="breach-data-types">
          {breach.dataClasses.slice(0, 5).map((type, i) => (
            <span key={i} className="data-type-tag">{type}</span>
          ))}
          {breach.dataClasses.length > 5 && (
            <span className="data-type-tag">+{breach.dataClasses.length - 5} more</span>
          )}
        </div>
      )}
    </div>
  );
}
