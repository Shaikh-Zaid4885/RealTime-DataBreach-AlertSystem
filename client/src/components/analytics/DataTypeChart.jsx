import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const mockData = [
  { name: 'Email Addresses', value: 847, color: '#4C6FFF' },
  { name: 'Passwords', value: 623, color: '#FF3366' },
  { name: 'Usernames', value: 512, color: '#00FF88' },
  { name: 'Phone Numbers', value: 389, color: '#FFB800' },
  { name: 'IP Addresses', value: 234, color: '#A855F7' },
  { name: 'Physical Addresses', value: 178, color: '#06B6D4' },
  { name: 'Dates of Birth', value: 145, color: '#FF6B35' },
  { name: 'Credit Cards', value: 67, color: '#EC4899' },
];

const CustomTooltip = ({ active, payload }) => {
  if (!active || !payload?.[0]) return null;
  const d = payload[0];
  return (
    <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-md)', padding: '10px 14px', boxShadow: 'var(--shadow-lg)' }}>
      <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)', color: d.payload.color }}>{d.name}</div>
      <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>{d.value} occurrences</div>
    </div>
  );
};

export default function DataTypeChart({ data }) {
  const chartData = data || mockData;

  return (
    <div className="chart-container">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={chartData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" stroke="none">
            {chartData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend wrapperStyle={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
