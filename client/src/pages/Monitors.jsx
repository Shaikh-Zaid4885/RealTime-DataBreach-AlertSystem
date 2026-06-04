import { useState, useEffect } from 'react';
import { Monitor } from 'lucide-react';
import MonitorList from '../components/monitors/MonitorList';
import api from '../api/axios';

export default function Monitors() {
  const [monitors, setMonitors] = useState(null);

  useEffect(() => {
    document.title = 'Monitors — BreachGuard';
    fetchMonitors();
  }, []);

  const fetchMonitors = async () => {
    try {
      const res = await api.get('/monitors');
      setMonitors(res.data?.data?.monitors);
    } catch (err) { /* uses mock data */ }
  };

  const [scanningId, setScanningId] = useState(null);

  const handleScan = async (id) => {
    try {
      setScanningId(id);
      await api.post(`/monitors/${id}/scan`);
      await fetchMonitors();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Scan failed');
    } finally {
      setScanningId(null);
    }
  };

  const handleToggle = async (id) => {
    try {
      await api.patch(`/monitors/${id}/toggle`);
      await fetchMonitors();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Toggle failed');
    }
  };

  const handleDelete = async (id) => {
    try {
      await api.delete(`/monitors/${id}`);
      await fetchMonitors();
    } catch (err) {
      alert(err.response?.data?.message || err.message || 'Delete failed');
    }
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Monitored Identifiers</h1>
        <p className="page-subtitle">Manage your emails, domains, and phone numbers under breach monitoring</p>
      </div>

      <MonitorList monitors={monitors} onDelete={handleDelete} onScan={handleScan} onToggle={handleToggle} scanningId={scanningId} />
    </div>
  );
}
