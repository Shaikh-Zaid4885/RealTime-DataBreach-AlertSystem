import { useMemo } from 'react';

export default function RiskGauge({ score = 62 }) {
  const clampedScore = Math.max(0, Math.min(100, score));

  const getColor = (s) => {
    if (s >= 80) return '#FF3366';
    if (s >= 60) return '#FF6B35';
    if (s >= 35) return '#FFB800';
    return '#00FF88';
  };

  const getLabel = (s) => {
    if (s >= 80) return 'Critical Risk';
    if (s >= 60) return 'High Risk';
    if (s >= 35) return 'Medium Risk';
    return 'Low Risk';
  };

  const color = getColor(clampedScore);
  const label = getLabel(clampedScore);

  const radius = 80;
  const strokeWidth = 12;
  const normalizedRadius = radius - strokeWidth / 2;
  const circumference = Math.PI * normalizedRadius;
  const strokeDashoffset = circumference - (clampedScore / 100) * circumference;

  return (
    <div className="risk-gauge">
      <svg className="risk-gauge-svg" viewBox="0 0 200 120" style={{ overflow: 'visible' }}>
        {/* Background arc */}
        <path
          d={`M ${100 - normalizedRadius} 100 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${100 + normalizedRadius} 100`}
          fill="none"
          stroke="rgba(76, 111, 255, 0.1)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Value arc */}
        <path
          d={`M ${100 - normalizedRadius} 100 A ${normalizedRadius} ${normalizedRadius} 0 0 1 ${100 + normalizedRadius} 100`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s ease-out, stroke 0.5s ease',
            filter: `drop-shadow(0 0 8px ${color}60)`,
          }}
        />
        {/* Labels */}
        <text x="20" y="115" fill="var(--text-muted)" fontSize="10" textAnchor="start">0</text>
        <text x="180" y="115" fill="var(--text-muted)" fontSize="10" textAnchor="end">100</text>
      </svg>
      <div className="risk-gauge-value" style={{ color }}>{clampedScore}</div>
      <div className="risk-gauge-label">{label}</div>
    </div>
  );
}
