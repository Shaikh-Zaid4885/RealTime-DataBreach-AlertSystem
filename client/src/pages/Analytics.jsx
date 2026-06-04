import { useEffect } from 'react';
import { BarChart3, TrendingUp } from 'lucide-react';
import BreachChart from '../components/analytics/BreachChart';
import DataTypeChart from '../components/analytics/DataTypeChart';
import TrendGraph from '../components/analytics/TrendGraph';

export default function Analytics() {
  useEffect(() => { document.title = 'Analytics — BreachGuard'; }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Analytics & Insights</h1>
        <p className="page-subtitle">Comprehensive analysis of breach data and exposure trends</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><BarChart3 size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Breaches Detected</div>
            <div className="stat-value">293</div>
            <div className="stat-change negative"><TrendingUp size={12} /> +18% this month</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><BarChart3 size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Records Exposed</div>
            <div className="stat-value">2.4B</div>
            <div className="stat-change negative"><TrendingUp size={12} /> +12% this month</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><BarChart3 size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Avg Severity Score</div>
            <div className="stat-value">67</div>
            <div className="stat-change negative"><TrendingUp size={12} /> +5 points</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><BarChart3 size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Actions Completed</div>
            <div className="stat-value">84%</div>
            <div className="stat-change positive"><TrendingUp size={12} /> +6% improved</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section dashboard-grid-full">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><TrendingUp size={20} /> Severity Trends Over Time</h2>
          </div>
          <TrendGraph />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><BarChart3 size={20} /> Breach Activity</h2>
          </div>
          <BreachChart />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><BarChart3 size={20} /> Data Types Exposed</h2>
          </div>
          <DataTypeChart />
        </div>
      </div>
    </div>
  );
}
