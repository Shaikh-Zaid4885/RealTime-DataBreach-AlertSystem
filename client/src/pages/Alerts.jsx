import { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { Bell, CheckCheck } from 'lucide-react';
import AlertFilters from '../components/alerts/AlertFilters';
import AlertFeed from '../components/alerts/AlertFeed';
import Button from '../components/common/Button';
import api from '../api/axios';


export default function Alerts() {
  const [alerts, setAlerts] = useState(null);
  const [filter, setFilter] = useState('all');

  const location = useLocation();

  useEffect(() => {
    document.title = 'Alerts — BreachGuard';
    fetchAlerts();
  }, []);

  useEffect(() => {
    if (alerts && location.hash) {
      setTimeout(() => {
        const id = location.hash.replace('#', '');
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
          element.classList.add('highlight-pulse');
        }
      }, 300);
    }
  }, [alerts, location.hash]);
  const fetchAlerts = async () => {
    try {
      const res = await api.get('/alerts');
      setAlerts(res.data?.data?.alerts);
    } catch (err) {
      console.error('Failed to fetch alerts:', err);
    }
  };

  const handleMarkRead = async (id) => {
    try {
      await api.patch(`/alerts/${id}/read`);
      fetchAlerts();
    } catch {}
  };

  const handleMarkAllRead = async () => {
    try {
      await api.patch('/alerts/read-all');
      fetchAlerts();
    } catch {}
  };
  const handleAction = async (alertId, index) => {
    try {
      await api.patch(`/alerts/${alertId}/action`, { recommendationIndex: index });
      fetchAlerts();
    } catch {}
  };

  const filteredAlerts = alerts?.filter((a) => {
    if (filter === 'all') return true;
    if (filter === 'unread') return a.status === 'unread';
    return a.severity === filter;
  });

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 'var(--space-6)' }}>
        <div className="page-header" style={{ marginBottom: 0 }}>
          <h1 className="page-title">Alert Center</h1>
          <p className="page-subtitle">Review and manage your breach notifications</p>
        </div>
        <Button variant="ghost" icon={CheckCheck} onClick={handleMarkAllRead}>Mark All Read</Button>
      </div>
      
      <AlertFilters activeFilter={filter} onFilterChange={setFilter} />

      <div className="glass-card-flat">
         <AlertFeed alerts={filteredAlerts} onMarkRead={handleMarkRead} onAction={handleAction} />
      </div>
    </div>
  );
}
