import { useState, useEffect } from 'react';
import { Monitor, Search } from 'lucide-react';
import MonitorList from '../components/monitors/MonitorList';
import api from '../api/axios';

export default function Monitors() {
  const [monitors, setMonitors] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

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

  const filteredMonitors = monitors?.filter(m => 
    m.value.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Monitored Identifiers</h1>
          <p className="page-subtitle">Manage your emails, domains, and phone numbers under breach monitoring</p>
        </div>
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={16} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search identifiers..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="form-input"
            style={{ paddingLeft: '36px', width: '100%' }}
          />
        </div>
      </div>

      <MonitorList monitors={filteredMonitors} onDelete={handleDelete} onScan={handleScan} onToggle={handleToggle} scanningId={scanningId} />
    </div>
  );
}
