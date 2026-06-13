import { useState, useEffect } from 'react';
import { User, Bell, Shield, Mail, Smartphone, Lock, Activity } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import api from '../api/axios';

export default function Settings() {
  const { user, updateProfile } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });
  const [prefs, setPrefs] = useState({ email: true, push: true, frequency: 'instant' });
  const [saved, setSaved] = useState(false);

  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordForm, setPasswordForm] = useState({ currentPassword: '', newPassword: '' });
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');

  useEffect(() => {
    document.title = 'Account Settings — BreachGuard';
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '' });
      if (user.alertPreferences) {
        setPrefs({ 
          email: user.alertPreferences.email ?? true, 
          push: user.alertPreferences.push ?? true, 
          frequency: user.alertPreferences.frequency || 'instant' 
        });
      }
    }
  }, [user]);

  const handleChangePassword = async () => {
    setPasswordError('');
    setPasswordSuccess('');
    
    if (!passwordForm.currentPassword || !passwordForm.newPassword) {
      return setPasswordError('Please fill in both fields.');
    }
    
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;
    if (!passwordRegex.test(passwordForm.newPassword)) {
      return setPasswordError('New password must be 8-16 characters and contain uppercase, lowercase, number, and special character');
    }

    try {
      await api.put('/auth/change-password', passwordForm);
      setPasswordSuccess('Password changed successfully!');
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordSuccess('');
        setPasswordForm({ currentPassword: '', newPassword: '' });
      }, 2000);
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password. Ensure your current password is correct.');
    }
  };

  const handleSave = async () => {
    try {
      await updateProfile({ name: form.name, phone: form.phone, alertPreferences: prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div className="page-header" style={{ borderBottom: '1px solid var(--bg-modifier-border)', paddingBottom: 'var(--space-5)', marginBottom: 'var(--space-6)' }}>
        <h1 className="page-title" style={{ fontSize: 'var(--text-3xl)' }}>Account Settings</h1>
        <p className="page-subtitle">Manage your personal details and security preferences.</p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-6)' }}>
        {/* Profile Card */}
        <div className="dashboard-section" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-xl)' }}>
          <div className="dashboard-section-header" style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--bg-modifier-border)', margin: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
              <User size={20} color="var(--accent-blue)" /> Personal Information
            </h2>
          </div>
          <div style={{ padding: 'var(--space-5)', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-5)' }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Full Name</label>
              <input className="form-input" style={{ background: 'var(--bg-tertiary)', border: 'none' }} value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} placeholder="Enter your full name" />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Email Address</label>
              <input className="form-input" value={form.email} disabled style={{ background: 'var(--bg-modifier-hover)', border: 'none', opacity: 0.7, cursor: 'not-allowed' }} />
            </div>
            <div className="form-group" style={{ margin: 0, gridColumn: '1 / -1' }}>
              <label className="form-label" style={{ fontSize: 'var(--text-xs)', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Phone Number (Optional)</label>
              <input className="form-input" style={{ background: 'var(--bg-tertiary)', border: 'none' }} value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="Enter your phone number" />
            </div>
          </div>
        </div>

        {/* Notifications Card */}
        <div className="dashboard-section" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-xl)' }}>
          <div className="dashboard-section-header" style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--bg-modifier-border)', margin: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Bell size={20} color="var(--accent-amber)" /> Alert Preferences
            </h2>
          </div>
          <div style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--bg-modifier-border)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}><Mail size={18} color="var(--text-primary)" /></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Email Alerts</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Get notified instantly when your data is breached.</div>
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 'var(--space-4)', borderBottom: '1px solid var(--bg-modifier-border)', marginBottom: 'var(--space-4)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}><Smartphone size={18} color="var(--text-primary)" /></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Push Notifications</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Receive alerts directly in your browser.</div>
                </div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.push} onChange={(e) => setPrefs((p) => ({ ...p, push: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{ background: 'var(--bg-tertiary)', padding: '10px', borderRadius: 'var(--radius-md)' }}><Activity size={18} color="var(--text-primary)" /></div>
                <div>
                  <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Alert Frequency</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>How often should we send non-critical updates?</div>
                </div>
              </div>
              <select className="form-select" style={{ width: 'auto', background: 'var(--bg-tertiary)', border: 'none' }} value={prefs.frequency} onChange={(e) => setPrefs((p) => ({ ...p, frequency: e.target.value }))}>
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
          </div>
        </div>

        {/* Security Card */}
        <div className="dashboard-section" style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-xl)' }}>
          <div className="dashboard-section-header" style={{ padding: 'var(--space-5)', borderBottom: '1px solid var(--bg-modifier-border)', margin: 0 }}>
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--text-lg)', fontWeight: 600, color: 'var(--text-primary)' }}>
              <Shield size={20} color="var(--accent-green)" /> Account Security
            </h2>
          </div>
          <div style={{ padding: 'var(--space-5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontWeight: 500, fontSize: 'var(--text-sm)' }}>Password</div>
                <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>Update your account password securely.</div>
              </div>
              <Button variant="ghost" size="sm" style={{ background: 'var(--bg-tertiary)' }} onClick={() => setShowPasswordModal(true)}>Update Password</Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)', padding: 'var(--space-5)', background: 'var(--bg-secondary)', borderRadius: 'var(--radius-xl)', border: '1px solid var(--bg-modifier-border)', alignItems: 'center' }}>
        {saved && <span style={{ color: 'var(--accent-green)', fontSize: 'var(--text-sm)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '4px' }}><Shield size={16}/> Settings Saved Successfully!</span>}
        <Button variant="primary" onClick={handleSave} style={{ padding: '8px 24px' }}>Save Changes</Button>
      </div>

      {/* Password Modal */}
      {showPasswordModal && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: 'var(--space-4)' }} onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)', borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '400px', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4)', borderBottom: '1px solid var(--bg-modifier-border)' }}>
              <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Change Password</h3>
              <button onClick={() => { setShowPasswordModal(false); setPasswordError(''); setPasswordSuccess(''); }} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>✕</button>
            </div>
            <div style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
              {passwordError && <div style={{ color: 'var(--accent-red)', fontSize: 'var(--text-xs)', background: 'rgba(239, 68, 68, 0.1)', padding: '8px', borderRadius: '4px' }}>{passwordError}</div>}
              {passwordSuccess && <div style={{ color: 'var(--accent-green)', fontSize: 'var(--text-xs)', background: 'rgba(34, 197, 94, 0.1)', padding: '8px', borderRadius: '4px' }}>{passwordSuccess}</div>}
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">Current Password</label>
                <input type="password" placeholder="Current password" className="form-input" style={{ background: 'var(--bg-tertiary)' }} value={passwordForm.currentPassword} onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })} />
              </div>
              <div className="form-group" style={{ margin: 0 }}>
                <label className="form-label">New Password</label>
                <input type="password" placeholder="New password" className="form-input" style={{ background: 'var(--bg-tertiary)' }} value={passwordForm.newPassword} onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })} />
              </div>
            </div>
            <div style={{ padding: 'var(--space-4)', borderTop: '1px solid var(--bg-modifier-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
              <Button variant="outline" onClick={() => setShowPasswordModal(false)}>Cancel</Button>
              <Button variant="primary" onClick={handleChangePassword}>Update Password</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
