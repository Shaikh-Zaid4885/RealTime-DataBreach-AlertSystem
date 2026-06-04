import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload || payload.length === 0) return null;
  const data = payload[0].payload;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontWeight: 600, marginBottom: 4, fontSize: 'var(--text-sm)' }}>{data.name}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
        Breaches: <span style={{ color: 'var(--accent-blue)', fontWeight: 600 }}>{data.count}</span>
      </div>
    </div>
  );
};

export default function IndustryChart({ data }) {
  const chartData = data || [];

  if (chartData.length === 0) {
    return (
      <div className="chart-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div style={{ color: 'var(--text-muted)' }}>No industry data available.</div>
      </div>
    );
  }

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={chartData} layout="vertical" margin={{ top: 5, right: 30, left: 40, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="rgba(255,255,255,0.05)" />
          <XAxis type="number" stroke="var(--text-muted)" fontSize={12} />
          <YAxis type="category" dataKey="name" stroke="var(--text-muted)" fontSize={11} width={80} tickFormatter={(val) => val.length > 12 ? val.substring(0, 12) + '...' : val} />
          <Tooltip cursor={{ fill: 'var(--bg-hover)' }} content={<CustomTooltip />} />
          <Bar dataKey="count" radius={[0, 4, 4, 0]}>
            {chartData.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={index < 3 ? 'var(--accent-blue)' : 'var(--text-muted)'} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
