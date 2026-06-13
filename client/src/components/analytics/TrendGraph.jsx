import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { year: 2018, breaches: 12 },
  { year: 2019, breaches: 18 },
  { year: 2020, breaches: 25 },
  { year: 2021, breaches: 30 },
  { year: 2022, breaches: 22 },
  { year: 2023, breaches: 35 },
  { year: 2024, breaches: 28 },
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
