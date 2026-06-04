export default function BreachTimeline({ breaches }) {
  const data = [...(breaches || [])].sort((a, b) => {
    const dateA = new Date(a.date || a.breachDate).getTime();
    const dateB = new Date(b.date || b.breachDate).getTime();
    return dateB - dateA;
  });

  const groupedBreaches = data.reduce((acc, current) => {
    const breachName = current.title || current.name;
    const existing = acc.find(b => (b.title || b.name) === breachName);
    
    if (existing) {
      if (current.monitorValue && !existing.monitorValues.includes(current.monitorValue)) {
        existing.monitorValues.push(current.monitorValue);
      }
    } else {
      acc.push({
        ...current,
        monitorValues: current.monitorValue ? [current.monitorValue] : []
      });
    }
    return acc;
  }, []);

  if (groupedBreaches.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
        No breaches to display yet.
      </div>
    );
  }

  return (
    <div className="timeline">
      {groupedBreaches.map((item, i) => (
        <div key={item.id || i} className="timeline-item" style={{ animationDelay: `${i * 100}ms` }}>
          <div className={`timeline-dot ${item.severity}`} />
          <div className="timeline-content">
            <div className="timeline-title">{item.title || item.name}</div>
            <div className="timeline-date">
              {new Date(item.date || item.breachDate).toLocaleDateString('en-US', {
                year: 'numeric', month: 'short', day: 'numeric',
              })}
              {item.records && ` · ${item.records}`}
              {item.monitorValues && item.monitorValues.length > 0 && ` · Related to: ${item.monitorValues.join(', ')}`}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
