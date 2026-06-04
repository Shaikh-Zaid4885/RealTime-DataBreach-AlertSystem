export default function BreachTimeline({ breaches }) {
  const data = breaches || [];

  if (data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No breaches to display yet.
      </div>
    );
  }

  return (
    <div className="timeline">
      {data.map((item, i) => (
        <div key={item.id || i} className="timeline-item" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`timeline-dot ${item.severity}`} />
          <div className="timeline-content">
            <div className="timeline-title">{item.title || item.name}</div>
            <div className="timeline-date">
              {new Date(item.date || item.breachDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
              {item.records && ` · ${item.records}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
