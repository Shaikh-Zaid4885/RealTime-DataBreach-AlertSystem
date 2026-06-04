import { useState, useEffect } from 'react';
import { Shield, Activity, Clock } from 'lucide-react';
import StatsCards from '../components/dashboard/StatsCards';
import BreachTimeline from '../components/dashboard/BreachTimeline';
import RecentAlerts from '../components/dashboard/RecentAlerts';
import AddMonitorForm from '../components/monitors/AddMonitorForm';
import BulkUpload from '../components/monitors/BulkUpload';
import api from '../api/axios';

export default function Dashboard() {
  const [stats, setStats] = useState(null);
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Dashboard — BreachGuard';
    const fetchData = async () => {
      try {
        const [overviewRes, breachesRes] = await Promise.all([
          api.get('/analytics/overview'),
          api.get('/breaches/my-breaches')
        ]);
        
        setStats(overviewRes.data?.data);
        
        const breachesData = breachesRes.data?.data?.breaches || breachesRes.data?.breaches || breachesRes.data || [];
        setBreaches(Array.isArray(breachesData) ? breachesData.slice(0, 5) : []);
      } catch (err) {
        console.error('Failed to fetch dashboard data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const [monitorTab, setMonitorTab] = useState('add');

  const handleAddMonitor = async (data) => {
    await api.post('/monitors', data);
    // Re-fetch overview stats and breaches to update all dashboard widgets
    const [overviewRes, breachesRes] = await Promise.all([
      api.get('/analytics/overview'),
      api.get('/breaches/my-breaches')
    ]);
    
    setStats(overviewRes.data?.data);
    
    const breachesData = breachesRes.data?.data?.breaches || breachesRes.data?.breaches || breachesRes.data || [];
    setBreaches(Array.isArray(breachesData) ? breachesData.slice(0, 5) : []);
  };

  const handleBulkUpload = () => {
    api.get('/analytics/overview').then(res => setStats(res.data?.data));
  };

  const statsCards = stats ? [
    { label: 'Active Monitors', value: String(stats.stats?.activeMonitors || 0), icon: Shield, color: 'green', change: `${stats.stats?.totalMonitors || 0} total`, positive: true, link: '/monitors' },
    { label: 'Total Breaches', value: String(stats.stats?.totalBreaches || 0), icon: Activity, color: 'red', change: `${stats.stats?.criticalBreaches || 0} critical`, positive: false },
    { label: 'Unread Alerts', value: String(stats.stats?.unreadAlerts || 0), icon: Clock, color: 'amber', change: `${stats.stats?.totalAlerts || 0} total`, positive: false, link: '/alerts' },
    { label: 'Risk Score', value: String(stats.stats?.riskScore || 0), icon: Shield, color: 'blue', change: stats.stats?.riskScore > 60 ? 'High risk' : 'Moderate', positive: stats.stats?.riskScore <= 60 },
  ] : undefined;

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>
        Loading dashboard...
      </div>
    );
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Security Dashboard</h1>
        <p className="page-subtitle">Real-time overview of your data breach monitoring</p>
      </div>

      <div className="glass-card" style={{ marginBottom: 'var(--space-6)' }}>
        <div style={{ display: 'flex', background: 'var(--bg-secondary)', padding: '4px', borderRadius: 'var(--radius-full)', marginBottom: 'var(--space-6)', position: 'relative', width: 'fit-content', margin: '0 auto var(--space-6) auto' }}>
          <div style={{
            position: 'absolute',
            top: 4, bottom: 4, left: monitorTab === 'add' ? '4px' : '50%', right: monitorTab === 'add' ? '50%' : '4px',
            background: 'var(--accent-blue)', borderRadius: 'var(--radius-full)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', zIndex: 1
          }} />
          <button style={{ width: '160px', padding: '8px 16px', position: 'relative', zIndex: 2, background: 'transparent', border: 'none', color: monitorTab === 'add' ? '#fff' : 'var(--text-muted)', fontWeight: 600, transition: 'color 0.3s', cursor: 'pointer' }} onClick={() => setMonitorTab('add')}>
            Single Add
          </button>
          <button style={{ width: '160px', padding: '8px 16px', position: 'relative', zIndex: 2, background: 'transparent', border: 'none', color: monitorTab === 'bulk' ? '#fff' : 'var(--text-muted)', fontWeight: 600, transition: 'color 0.3s', cursor: 'pointer' }} onClick={() => setMonitorTab('bulk')}>
            Bulk Upload
          </button>
        </div>

        <div style={{ minHeight: '300px' }}>
          {monitorTab === 'add' ? <AddMonitorForm onAdd={handleAddMonitor} /> : <BulkUpload onUpload={handleBulkUpload} />}
        </div>
      </div>

      <StatsCards stats={statsCards} />

      <div className="dashboard-grid">


        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Clock size={20} /> Breach Timeline</h2>
          </div>
          <BreachTimeline breaches={breaches} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Activity size={20} /> Recent Alerts</h2>
          </div>
          <RecentAlerts alerts={stats?.recentAlerts} />
        </div>
      </div>
    </div>
  );
}
