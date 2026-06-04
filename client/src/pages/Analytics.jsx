import { useState, useEffect } from 'react';
import { BarChart3, TrendingUp, Shield, Globe, Database, Activity } from 'lucide-react';
import IndustryChart from '../components/analytics/IndustryChart';
import DataTypeChart from '../components/analytics/DataTypeChart';
import TrendGraph from '../components/analytics/TrendGraph';
import api from '../api/axios';

export default function Analytics() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Global Analytics — BreachGuard';
    fetchGlobalAnalytics();
  }, []);

  const fetchGlobalAnalytics = async () => {
    try {
      const response = await api.get('/analytics/global');
      if (response.data?.success) {
        setData(response.data.data);
      } else {
        setError('Failed to load analytics data');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Error fetching analytics');
    } finally {
      setLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (!num) return '0';
    if (num >= 1e9) return (num / 1e9).toFixed(1) + 'B';
    if (num >= 1e6) return (num / 1e6).toFixed(1) + 'M';
    if (num >= 1e3) return (num / 1e3).toFixed(1) + 'K';
    return num.toLocaleString();
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--text-muted)' }}>Loading Global Threat Data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <div style={{ color: 'var(--accent-red)' }}>{error}</div>
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Global Threat Analytics</h1>
        <p className="page-subtitle">Comprehensive analysis of worldwide data breaches and exposure trends</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><Globe size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Global Breaches</div>
            <div className="stat-value">{data?.summary?.totalBreaches?.toLocaleString() || 0}</div>
            <div className="stat-change"><TrendingUp size={12} /> Total Tracked</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><Database size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Records Exposed</div>
            <div className="stat-value">{formatNumber(data?.summary?.totalRecords)}</div>
            <div className="stat-change negative"><TrendingUp size={12} /> Global Impact</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Shield size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Verified Breaches</div>
            <div className="stat-value">{data?.summary?.verifiedBreaches?.toLocaleString() || 0}</div>
            <div className="stat-change"><TrendingUp size={12} /> Confirmed incidents</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Activity size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Verification Rate</div>
            <div className="stat-value">{data?.summary?.verificationRate || 0}%</div>
            <div className="stat-change positive"><TrendingUp size={12} /> High confidence</div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section dashboard-grid-full">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><TrendingUp size={20} /> Historical Breach Volume (Year-over-Year)</h2>
          </div>
          <TrendGraph data={data?.yearlyTrend} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><BarChart3 size={20} /> Most Targeted Industries</h2>
          </div>
          <IndustryChart data={data?.industries} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><BarChart3 size={20} /> Most Exposed Data Types</h2>
          </div>
          <DataTypeChart data={data?.dataTypes} />
        </div>
      </div>
    </div>
  );
}
