import { useState, useEffect } from 'react';
import { Scale, ShieldAlert, CheckCircle, Mail } from 'lucide-react';
import LegalCard from '../components/legal/LegalCard';
import SecurityChecklist from '../components/legal/SecurityChecklist';
import DataDeletionModal from '../components/legal/DataDeletionModal';
import api from '../api/axios';

export default function LegalAdvisory() {
  const [data, setData] = useState({ advisories: [], checklist: [], activeThreats: [] });
  const [loading, setLoading] = useState(true);
  const [selectedThreatForDeletion, setSelectedThreatForDeletion] = useState(null);

  const fetchAdvisories = async () => {
    try {
      const res = await api.get('/reports/legal-advisories');
      if (res.data?.data) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.title = 'Security & Rights — BreachGuard';
    fetchAdvisories();
  }, []);

  const handleResolveThreat = async (breachId) => {
    try {
      await api.patch(`/alerts/resolve-breach/${breachId}`);
      // Refresh the dashboard immediately to recalculate the score
      fetchAdvisories();
    } catch (err) {
      setError('Failed to resolve threat.');
    }
  };

  if (loading) {
    return <div className="p-8 text-center text-muted">Analyzing your security profile...</div>;
  }

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Personal Security & Rights</h1>
        <p className="page-subtitle">Your personalized action plan and data protection rights</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><ShieldAlert size={20} /> Security Checklist</h2>
          </div>
          <SecurityChecklist items={data.checklist} />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h2 className="dashboard-section-title"><Scale size={20} /> Active Threats</h2>
            <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Tip: Complete the required actions, then click "Resolve" to clear the threat and improve your score.
            </span>
          </div>
          {data.activeThreats.length > 0 ? (
            <div style={{ overflowX: 'auto' }}>
              <table className="data-table">
                <thead><tr><th>Breach</th><th>Severity</th><th>Exposed Data</th><th>Actions</th></tr></thead>
                <tbody>
                  {data.activeThreats.map((threat, i) => (
                    <tr key={i}>
                      <td style={{ fontWeight: 600 }}>{threat.name}</td>
                      <td>
                        <span className={`severity-badge ${threat.severity}`}>
                          {threat.severity}
                        </span>
                      </td>
                      <td style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
                        {threat.dataClasses.slice(0, 3).join(', ')}
                        {threat.dataClasses.length > 3 && ` +${threat.dataClasses.length - 3} more`}
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
                          <button 
                            onClick={() => handleResolveThreat(threat.id)}
                            className="btn btn-outline" 
                            style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <CheckCircle size={14} /> Resolve
                          </button>
                          <button 
                            onClick={() => setSelectedThreatForDeletion(threat)}
                            className="btn btn-primary" 
                            style={{ padding: '4px 8px', fontSize: 'var(--text-xs)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <Mail size={14} /> Delete Data
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div style={{ padding: 'var(--space-6)', textAlign: 'center', color: 'var(--text-muted)' }}>
              You currently have no active threats detected.
            </div>
          )}
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Know Your Legal Rights</h2>
      <div className="grid-2">
        {data.advisories.map((law, i) => (
          <LegalCard key={i} law={law} />
        ))}
      </div>

      {selectedThreatForDeletion && (
        <DataDeletionModal 
          threat={selectedThreatForDeletion} 
          onClose={() => setSelectedThreatForDeletion(null)} 
        />
      )}
    </div>
  );
}
