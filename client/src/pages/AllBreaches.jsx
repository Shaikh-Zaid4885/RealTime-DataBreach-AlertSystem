import React, { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { Database, Search, ShieldAlert, Calendar, AlertCircle } from 'lucide-react';
import api from '../api/axios';

export default function AllBreaches() {
  const location = useLocation();
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [expandedRow, setExpandedRow] = useState(null);
  const itemsPerPage = 20;

  // Initialize search from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const searchQuery = params.get('search');
    if (searchQuery) {
      setSearchTerm(searchQuery);
      setExpandedRow(searchQuery);
    }
  }, [location.search]);

  useEffect(() => {
    document.title = 'Global Database — BreachGuard';
    const fetchBreaches = async () => {
      try {
        const res = await api.get('/breaches/xposed-all');
        setBreaches(res.data?.data?.breaches || []);
      } catch (err) {
        console.error('Failed to fetch breaches:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchBreaches();
  }, []);

  const filteredBreaches = useMemo(() => {
    if (!searchTerm) return breaches;
    const lower = searchTerm.toLowerCase();
    return breaches.filter(b => 
      (b.name || '').toLowerCase().includes(lower) || 
      (b.domain || '').toLowerCase().includes(lower) ||
      (b.description || '').toLowerCase().includes(lower)
    );
  }, [breaches, searchTerm]);

  const paginatedBreaches = useMemo(() => {
    const start = (page - 1) * itemsPerPage;
    return filteredBreaches.slice(start, start + itemsPerPage);
  }, [filteredBreaches, page]);

  const totalPages = Math.ceil(filteredBreaches.length / itemsPerPage);

  return (
    <div>
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
        <div>
          <h1 className="page-title">Global Breach Database</h1>
          <p className="page-subtitle">A comprehensive index of {breaches.length > 0 ? breaches.length.toLocaleString() : 'all'} data breaches tracked by XposedOrNot</p>
        </div>
        
        <div className="search-container" style={{ position: 'relative', width: '100%', maxWidth: '300px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input 
            type="text" 
            placeholder="Search breaches..." 
            className="form-input"
            style={{ paddingLeft: '40px' }}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
          />
        </div>
      </div>

      {loading ? (
        <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
          <Database size={48} style={{ margin: '0 auto var(--space-4) auto', opacity: 0.5, animation: 'pulse 2s infinite' }} />
          <p>Downloading global breach database...</p>
        </div>
      ) : (
        <div className="glass-card" style={{ padding: 0, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary)', borderBottom: '1px solid var(--bg-modifier-border)' }}>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-secondary)' }}>Breach Name</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-secondary)' }}>Domain</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-secondary)' }}>Compromised Records</th>
                  <th style={{ padding: 'var(--space-3) var(--space-4)', fontWeight: 600, color: 'var(--text-secondary)' }}>Breach Date</th>
                </tr>
              </thead>
              <tbody>
                {paginatedBreaches.map((breach, idx) => (
                  <React.Fragment key={idx}>
                    <tr 
                      style={{ borderBottom: expandedRow === breach.name ? 'none' : '1px solid var(--bg-modifier-border)', transition: 'background 0.2s', cursor: 'pointer', background: expandedRow === breach.name ? 'rgba(76, 111, 255, 0.03)' : 'transparent' }} 
                      onClick={() => setExpandedRow(expandedRow === breach.name ? null : breach.name)} 
                      title="Click to view full details"
                    >
                      <td style={{ padding: 'var(--space-3) var(--space-4)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {breach.logoPath ? (
                            <img src={breach.logoPath} alt={breach.name} style={{ width: 24, height: 24, borderRadius: 4, objectFit: 'contain', background: '#fff' }} onError={(e) => e.target.style.display = 'none'} />
                          ) : (
                            <ShieldAlert size={20} color="var(--accent-red)" />
                          )}
                          <span style={{ fontWeight: 600 }}>{breach.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)' }}>{breach.domain || 'N/A'}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', fontFamily: 'var(--font-mono)' }}>{breach.pwnCount ? breach.pwnCount.toLocaleString() : 'Unknown'}</td>
                      <td style={{ padding: 'var(--space-3) var(--space-4)', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                        <Calendar size={14} />
                        {breach.breachDate ? new Date(breach.breachDate).toLocaleDateString() : 'Unknown'}
                      </td>
                    </tr>
                    {expandedRow === breach.name && (
                      <tr style={{ background: 'rgba(76, 111, 255, 0.03)', borderBottom: '1px solid var(--bg-modifier-border)' }}>
                        <td colSpan={4} style={{ padding: 'var(--space-4)', paddingTop: 0 }}>
                          <div style={{ padding: 'var(--space-4)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', border: '1px solid var(--bg-modifier-border)' }}>
                            <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Breach Description</h4>
                            <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.6, marginBottom: 'var(--space-4)' }} dangerouslySetInnerHTML={{ __html: breach.description || 'No description available.' }} />
                            
                            {breach.dataClasses && breach.dataClasses.length > 0 && (
                              <>
                                <h4 style={{ fontSize: 'var(--text-sm)', fontWeight: 700, marginBottom: 'var(--space-2)' }}>Exposed Data Types</h4>
                                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                                  {breach.dataClasses.map((dc, i) => (
                                    <span key={i} className="data-type-tag" style={{ padding: '4px 10px', fontSize: 'var(--text-xs)' }}>{dc}</span>
                                  ))}
                                </div>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
            
            {paginatedBreaches.length === 0 && (
              <div style={{ padding: 'var(--space-8)', textAlign: 'center', color: 'var(--text-muted)' }}>
                <AlertCircle size={32} style={{ margin: '0 auto var(--space-3) auto', opacity: 0.5 }} />
                <p>No breaches found matching your search.</p>
              </div>
            )}
          </div>
          
          {totalPages > 1 && (
            <div style={{ padding: 'var(--space-4)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--bg-modifier-border)' }}>
              <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                Showing {((page - 1) * itemsPerPage) + 1} to {Math.min(page * itemsPerPage, filteredBreaches.length)} of {filteredBreaches.length}
              </span>
              <div style={{ display: 'flex', gap: '8px' }}>
                <button 
                  style={{ padding: '4px 12px', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: page === 1 ? 'not-allowed' : 'pointer', opacity: page === 1 ? 0.5 : 1 }}
                  disabled={page === 1} 
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                >
                  Previous
                </button>
                <button 
                  style={{ padding: '4px 12px', fontSize: 'var(--text-sm)', background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-md)', color: 'var(--text-primary)', cursor: page === totalPages ? 'not-allowed' : 'pointer', opacity: page === totalPages ? 0.5 : 1 }}
                  disabled={page === totalPages} 
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
