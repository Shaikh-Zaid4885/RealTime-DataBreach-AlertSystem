import { useState, useEffect, Fragment } from 'react';
import { Users, Shield, Bell, AlertTriangle, Trash2, ChevronDown, ChevronRight, Search } from 'lucide-react';
import api from '../api/axios';

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Expandable row state
  const [expandedUserId, setExpandedUserId] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('monitors'); // monitors, alerts, breaches

  useEffect(() => {
    document.title = 'Admin Panel — BreachGuard';
    fetchAdminData();
  }, []);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [statsRes, usersRes] = await Promise.all([
        api.get('/admin/stats'),
        api.get('/admin/users')
      ]);
      setStats(statsRes.data?.data || null);
      setUsers(usersRes.data?.data || []);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to load admin data');
    } finally {
      setLoading(false);
    }
  };

  const handleExpandUser = async (userId) => {
    if (expandedUserId === userId) {
      setExpandedUserId(null);
      setUserDetails(null);
      return;
    }
    setExpandedUserId(userId);
    setDetailsLoading(true);
    setActiveTab('monitors');
    
    try {
      const res = await api.get(`/admin/users/${userId}/details`);
      setUserDetails(res.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch user details');
      setExpandedUserId(null);
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole, userName, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to change ${userName}'s role to ${newRole}?`)) return;
    
    try {
      await api.put(`/admin/users/${userId}/role`, { role: newRole });
      setUsers(users.map(u => u._id === userId ? { ...u, role: newRole } : u));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to update role');
    }
  };

  const handleDeleteUser = async (id, name, e) => {
    e.stopPropagation();
    if (!window.confirm(`Are you sure you want to permanently delete user ${name}? This will delete all their monitors and alerts.`)) return;
    
    try {
      await api.delete(`/admin/users/${id}`);
      setUsers(users.filter(u => u._id !== id));
      if (expandedUserId === id) setExpandedUserId(null);
      
      const statsRes = await api.get('/admin/stats');
      setStats(statsRes.data?.data || null);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete user');
    }
  };

  const handleDeleteMonitor = async (monitorId) => {
    if (!window.confirm('Delete this monitor?')) return;
    try {
      await api.delete(`/admin/monitors/${monitorId}`);
      setUserDetails({
        ...userDetails,
        monitors: userDetails.monitors.filter(m => m._id !== monitorId)
      });
      // Also update aggregate stats roughly
      setUsers(users.map(u => u._id === expandedUserId ? { ...u, monitorCount: Math.max(0, u.monitorCount - 1) } : u));
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete monitor');
    }
  };

  const handleDeleteAlert = async (alertId) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await api.delete(`/admin/alerts/${alertId}`);
      setUserDetails({
        ...userDetails,
        alerts: userDetails.alerts.filter(a => a._id !== alertId)
      });
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to delete alert');
    }
  };

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--text-muted)' }}>Loading Admin Panel...</div>;
  if (error) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '50vh', color: 'var(--accent-red)' }}>{error}</div>;

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Admin Control Panel</h1>
        <p className="page-subtitle">Manage system users, global monitors, and system-wide security alerts.</p>
      </div>

      <div className="stats-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="stat-card blue">
          <div className="stat-icon blue"><Users size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Users</div>
            <div className="stat-value">{stats?.totalUsers || 0}</div>
          </div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Shield size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Active Monitors</div>
            <div className="stat-value">{stats?.activeMonitors || stats?.totalMonitors || 0}</div>
          </div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Bell size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Alerts Sent</div>
            <div className="stat-value">{stats?.totalAlerts || 0}</div>
          </div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={24} /></div>
          <div className="stat-content">
            <div className="stat-label">Total Breaches Found</div>
            <div className="stat-value">{stats?.totalBreaches || 0}</div>
          </div>
        </div>
      </div>

      <div className="dashboard-section dashboard-grid-full">
        <div className="dashboard-section-header">
          <h2 className="dashboard-section-title"><Users size={20} /> User Management</h2>
        </div>
        
        <div className="glass-card" style={{ padding: 0, overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                <th style={{ padding: '16px', width: '40px' }}></th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Name</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Email</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Role</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Monitors</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Joined</th>
                <th style={{ padding: '16px', color: 'var(--text-muted)', fontWeight: 600, fontSize: '0.85rem' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <Fragment key={u._id}>
                  <tr 
                    style={{ 
                      borderBottom: expandedUserId === u._id ? 'none' : '1px solid var(--glass-border)',
                      cursor: 'pointer',
                      background: expandedUserId === u._id ? 'rgba(255,255,255,0.03)' : 'transparent',
                      transition: 'background 0.2s'
                    }}
                    onClick={() => handleExpandUser(u._id)}
                  >
                    <td style={{ padding: '16px', color: 'var(--text-muted)' }}>
                      {expandedUserId === u._id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                    </td>
                    <td style={{ padding: '16px', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{u.email}</td>
                    <td style={{ padding: '16px' }}>
                      <select 
                        value={u.role}
                        onChange={(e) => handleRoleChange(u._id, e.target.value, u.name, e)}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '4px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                          background: u.role === 'admin' ? 'rgba(76,111,255,0.1)' : 'rgba(255,255,255,0.05)',
                          color: u.role === 'admin' ? 'var(--accent-blue)' : 'var(--text-muted)',
                          border: 'none', cursor: 'pointer', outline: 'none'
                        }}
                      >
                        <option value="user" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>USER</option>
                        <option value="admin" style={{ background: 'var(--bg-primary)', color: 'var(--text-primary)' }}>ADMIN</option>
                      </select>
                    </td>
                    <td style={{ padding: '16px' }}>{u.monitorCount !== undefined ? u.monitorCount : '?'}</td>
                    <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '16px' }}>
                      {u.role !== 'admin' && (
                        <button 
                          onClick={(e) => handleDeleteUser(u._id, u.name, e)}
                          style={{ background: 'transparent', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                        >
                          <Trash2 size={16} /> Delete
                        </button>
                      )}
                    </td>
                  </tr>

                  {/* EXPANDED PANEL */}
                  {expandedUserId === u._id && (
                    <tr style={{ borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.01)' }}>
                      <td colSpan="7" style={{ padding: '0 24px 24px 24px' }}>
                        {detailsLoading ? (
                          <div style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>Loading user data...</div>
                        ) : (
                          <div style={{ background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', borderRadius: 'var(--radius-lg)', overflow: 'hidden' }}>
                            
                            {/* Tabs */}
                            <div style={{ display: 'flex', borderBottom: '1px solid var(--glass-border)', background: 'rgba(255,255,255,0.02)' }}>
                              <button 
                                onClick={() => setActiveTab('monitors')}
                                style={{ padding: '12px 24px', background: activeTab === 'monitors' ? 'transparent' : 'rgba(0,0,0,0.2)', border: 'none', borderBottom: activeTab === 'monitors' ? '2px solid var(--accent-blue)' : '2px solid transparent', color: activeTab === 'monitors' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Search size={16} /> Monitors ({userDetails?.monitors?.length || 0})
                              </button>
                              <button 
                                onClick={() => setActiveTab('alerts')}
                                style={{ padding: '12px 24px', background: activeTab === 'alerts' ? 'transparent' : 'rgba(0,0,0,0.2)', border: 'none', borderBottom: activeTab === 'alerts' ? '2px solid var(--accent-amber)' : '2px solid transparent', color: activeTab === 'alerts' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <Bell size={16} /> Alerts ({userDetails?.alerts?.length || 0})
                              </button>
                              <button 
                                onClick={() => setActiveTab('breaches')}
                                style={{ padding: '12px 24px', background: activeTab === 'breaches' ? 'transparent' : 'rgba(0,0,0,0.2)', border: 'none', borderBottom: activeTab === 'breaches' ? '2px solid var(--accent-red)' : '2px solid transparent', color: activeTab === 'breaches' ? '#fff' : 'var(--text-muted)', fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px' }}
                              >
                                <AlertTriangle size={16} /> Linked Breaches ({userDetails?.breaches?.length || 0})
                              </button>
                            </div>

                            {/* Tab Content */}
                            <div style={{ padding: '24px' }}>
                              
                              {activeTab === 'monitors' && (
                                <div>
                                  {userDetails?.monitors?.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No monitors found for this user.</div> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                      <thead>
                                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                          <th style={{ padding: '8px' }}>Target</th>
                                          <th style={{ padding: '8px' }}>Type</th>
                                          <th style={{ padding: '8px' }}>Breaches Found</th>
                                          <th style={{ padding: '8px' }}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userDetails.monitors.map(m => (
                                          <tr key={m._id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{m.value}</td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{m.type}</td>
                                            <td style={{ padding: '12px 8px' }}>{m.breachCount || 0}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                              <button onClick={() => handleDeleteMonitor(m._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14}/> Delete</button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                              {activeTab === 'alerts' && (
                                <div>
                                  {userDetails?.alerts?.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No alerts found for this user.</div> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                      <thead>
                                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                          <th style={{ padding: '8px' }}>Title</th>
                                          <th style={{ padding: '8px' }}>Severity</th>
                                          <th style={{ padding: '8px' }}>Date</th>
                                          <th style={{ padding: '8px' }}>Action</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userDetails.alerts.map(a => (
                                          <tr key={a._id} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{a.title}</td>
                                            <td style={{ padding: '12px 8px' }}><span style={{ color: a.severity === 'high' || a.severity === 'critical' ? 'var(--accent-red)' : 'var(--accent-amber)' }}>{a.severity.toUpperCase()}</span></td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{new Date(a.createdAt).toLocaleDateString()}</td>
                                            <td style={{ padding: '12px 8px' }}>
                                              <button onClick={() => handleDeleteAlert(a._id)} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}><Trash2 size={14}/> Delete</button>
                                            </td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                              {activeTab === 'breaches' && (
                                <div>
                                  <p style={{ color: 'var(--text-muted)', marginBottom: '16px', fontSize: '0.9rem' }}>Read-only view of global breaches linked to this user's alerts. To remove a breach from this list, delete its corresponding alert.</p>
                                  {userDetails?.breaches?.length === 0 ? <div style={{ color: 'var(--text-muted)' }}>No linked breaches found.</div> : (
                                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                                      <thead>
                                        <tr style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                                          <th style={{ padding: '8px' }}>Breach Name</th>
                                          <th style={{ padding: '8px' }}>Exposed Target</th>
                                          <th style={{ padding: '8px' }}>Pwn Count</th>
                                        </tr>
                                      </thead>
                                      <tbody>
                                        {userDetails.breaches.map(b => (
                                          <tr key={b.alertId} style={{ borderTop: '1px solid var(--glass-border)' }}>
                                            <td style={{ padding: '12px 8px', fontWeight: 500 }}>{b.name}</td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{b.monitorValue || 'Unknown'}</td>
                                            <td style={{ padding: '12px 8px', color: 'var(--text-secondary)' }}>{b.pwnCount?.toLocaleString() || 0}</td>
                                          </tr>
                                        ))}
                                      </tbody>
                                    </table>
                                  )}
                                </div>
                              )}

                            </div>
                          </div>
                        )}
                      </td>
                    </tr>
                  )}
                </Fragment>
              ))}
              {users.length === 0 && (
                <tr>
                  <td colSpan="7" style={{ padding: '32px', textAlign: 'center', color: 'var(--text-muted)' }}>No users found.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
