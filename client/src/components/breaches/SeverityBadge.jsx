export default function SeverityBadge({ severity }) {
  return (
    <span className={`severity-badge ${severity || 'info'}`}>
      <span className={`severity-dot ${severity || 'info'}`} />
      {severity || 'info'}
    </span>
  );
}
