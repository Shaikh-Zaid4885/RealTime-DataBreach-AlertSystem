import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { month: 'Jan', critical: 3, high: 5, medium: 8, low: 12 },
  { month: 'Feb', critical: 2, high: 4, medium: 6, low: 10 },
  { month: 'Mar', critical: 5, high: 8, medium: 10, low: 15 },
  { month: 'Apr', critical: 4, high: 6, medium: 12, low: 18 },
  { month: 'May', critical: 6, high: 9, medium: 8, low: 14 },
  { month: 'Jun', critical: 8, high: 12, medium: 15, low: 20 },
  { month: 'Jul', critical: 7, high: 10, medium: 13, low: 22 },
  { month: 'Aug', critical: 5, high: 7, medium: 9, low: 16 },
  { month: 'Sep', critical: 9, high: 14, medium: 18, low: 25 },
  { month: 'Oct', critical: 6, high: 11, medium: 14, low: 19 },
  { month: 'Nov', critical: 10, high: 15, medium: 20, low: 28 },
  { month: 'Dec', critical: 8, high: 13, medium: 17, low: 23 },
];

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload) return null;
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '12px 16px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontWeight: 600, marginBottom: 6, fontSize: 'var(--text-sm)' }}>{label}</div>
      {payload.map((p, i) => (
        <div key={i} style={{ fontSize: 'var(--text-xs)', color: p.color, marginBottom: 2 }}>
          {p.name}: {p.value}
        </div>
      ))}
    </div>
  );
};

export default function TrendGraph({ data }) {
  const chartData = data || mockData;

  return (
    <div className="chart-container-lg">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={chartData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(76,111,255,0.08)" />
          <XAxis dataKey="year" stroke="var(--text-muted)" fontSize={12} />
          <YAxis stroke="var(--text-muted)" fontSize={12} />
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 12, color: 'var(--text-secondary)' }} />
          <Line type="monotone" dataKey="breaches" stroke="#FF3366" strokeWidth={2} dot={{ r: 4, fill: '#FF3366' }} name="Total Breaches" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
