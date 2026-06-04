export default function AlertFilters({ activeFilter, onFilterChange }) {
  const filters = [
    { key: 'all', label: 'All Alerts' },
    { key: 'unread', label: 'Unread' },
    { key: 'critical', label: 'Critical' },
    { key: 'high', label: 'High' },
    { key: 'medium', label: 'Medium' },
    { key: 'low', label: 'Low' },
  ];

  return (
    <div className="filter-bar">
      {filters.map((f) => (
        <button
          key={f.key}
          className={`filter-chip ${activeFilter === f.key ? 'active' : ''}`}
          onClick={() => onFilterChange?.(f.key)}
        >
          {f.label}
        </button>
      ))}
    </div>
  );
}
