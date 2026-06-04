import { useState, useEffect } from 'react';
import { Settings as SettingsIcon, Bell, Shield, User, Mail, Phone } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';
import api from '../api/axios';

export default function Settings() {
  const { user } = useAuth();
  const [form, setForm] = useState({ name: '', email: '', phone: '', organization: '' });
  const [prefs, setPrefs] = useState({ email: true, sms: false, push: true, frequency: 'instant' });
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    document.title = 'Settings — BreachGuard';
    if (user) {
      setForm({ name: user.name || '', email: user.email || '', phone: user.phone || '', organization: user.organization || '' });
      if (user.alertPreferences) setPrefs(user.alertPreferences);
    }
  }, [user]);

  const handleSave = async () => {
    try {
      await api.put('/auth/profile', { name: form.name, phone: form.phone, organization: form.organization, alertPreferences: prefs });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch {}
  };

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Settings</h1>
        <p className="page-subtitle">Manage your account and notification preferences</p>
      </div>

      <div className="grid-2">
        <div className="glass-card">
          <div className="settings-section">
            <h3 className="settings-section-title"><User size={18} style={{ display: 'inline', marginRight: 8 }} />Profile Information</h3>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input className="form-input" value={form.name} onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label className="form-label">Email</label>
              <input className="form-input" value={form.email} disabled style={{ opacity: 0.6 }} />
            </div>
            <div className="form-group">
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.phone} onChange={(e) => setForm((p) => ({ ...p, phone: e.target.value }))} placeholder="+91 98765 43210" />
            </div>
            <div className="form-group">
              <label className="form-label">Organization</label>
              <input className="form-input" value={form.organization} onChange={(e) => setForm((p) => ({ ...p, organization: e.target.value }))} placeholder="Your organization" />
            </div>
          </div>
        </div>

        <div className="glass-card">
          <div className="settings-section">
            <h3 className="settings-section-title"><Bell size={18} style={{ display: 'inline', marginRight: 8 }} />Notification Preferences</h3>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Email Notifications</div>
                <div className="settings-row-description">Receive breach alerts via email</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.email} onChange={(e) => setPrefs((p) => ({ ...p, email: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">SMS Notifications</div>
                <div className="settings-row-description">Critical alerts via SMS (Twilio)</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.sms} onChange={(e) => setPrefs((p) => ({ ...p, sms: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="settings-row">
              <div>
                <div className="settings-row-label">Push Notifications</div>
                <div className="settings-row-description">Browser push notifications</div>
              </div>
              <label className="toggle">
                <input type="checkbox" checked={prefs.push} onChange={(e) => setPrefs((p) => ({ ...p, push: e.target.checked }))} />
                <span className="toggle-slider" />
              </label>
            </div>

            <div className="form-group mt-4">
              <label className="form-label">Alert Frequency</label>
              <select className="form-select" value={prefs.frequency} onChange={(e) => setPrefs((p) => ({ ...p, frequency: e.target.value }))}>
                <option value="instant">Instant</option>
                <option value="daily">Daily Digest</option>
                <option value="weekly">Weekly Summary</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h3 className="settings-section-title"><Shield size={18} style={{ display: 'inline', marginRight: 8 }} />Security</h3>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Two-Factor Authentication</div>
                <div className="settings-row-description">Add an extra layer of security</div>
              </div>
              <Button variant="outline" size="sm">Enable 2FA</Button>
            </div>
            <div className="settings-row">
              <div>
                <div className="settings-row-label">Change Password</div>
                <div className="settings-row-description">Update your account password</div>
              </div>
              <Button variant="ghost" size="sm">Change</Button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)', marginTop: 'var(--space-6)' }}>
        {saved && <span style={{ color: 'var(--accent-green)', fontSize: 'var(--text-sm)', alignSelf: 'center' }}>✓ Settings saved!</span>}
        <Button variant="primary" onClick={handleSave}>Save Changes</Button>
      </div>
    </div>
  );
}
