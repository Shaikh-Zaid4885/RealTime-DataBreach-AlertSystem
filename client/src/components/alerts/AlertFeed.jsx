import AlertItem from './AlertItem';

export default function AlertFeed({ alerts, onMarkRead, onAction }) {
  const data = alerts || [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {data.map((alert, i) => (
        <AlertItem key={alert.id || alert._id || i} alert={alert} onMarkRead={onMarkRead} onAction={onAction} />
      ))}
      {data.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No alerts</div>
          <div className="empty-state-text">You're all caught up! No alerts match your filters.</div>
        </div>
      )}
    </div>
  );
}
