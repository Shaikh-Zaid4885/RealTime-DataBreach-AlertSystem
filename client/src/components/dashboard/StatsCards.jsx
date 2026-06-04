import { Shield, AlertTriangle, Bell, Eye, TrendingUp, TrendingDown } from 'lucide-react';

export default function StatsCards({ stats }) {
  const data = stats || [
    { label: 'Active Monitors', value: '0', icon: Eye, color: 'green' },
    { label: 'Total Breaches', value: '0', icon: AlertTriangle, color: 'red' },
    { label: 'Unread Alerts', value: '0', icon: Bell, color: 'amber' },
    { label: 'Risk Score', value: '0', icon: Shield, color: 'blue' },
  ];

  return (
    <div className="stats-grid">
      {data.map((stat, i) => {
        const Icon = stat.icon;
        return (
          <div key={i} className={`stat-card ${stat.color}`}>
            <div className={`stat-icon ${stat.color}`}>
              <Icon size={24} />
            </div>
            <div className="stat-content">
              <div className="stat-label">{stat.label}</div>
              <div className="stat-value">{stat.value}</div>
              {stat.change && (
                <div className={`stat-change ${stat.positive ? 'positive' : 'negative'}`}>
                  {stat.positive ? <TrendingDown size={12} /> : <TrendingUp size={12} />}
                  {stat.change}
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
