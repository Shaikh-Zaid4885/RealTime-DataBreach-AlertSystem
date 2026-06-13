import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Mail, Lock, User } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import Button from '../components/common/Button';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'user', organization: '', phone: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { register } = useAuth();
  const navigate = useNavigate();

  const update = (key, val) => setForm((p) => ({ ...p, [key]: val }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError('Please fill all required fields'); return; }
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,16}$/;
    if (!passwordRegex.test(form.password)) { setError('Password must be 8-16 characters and contain uppercase, lowercase, number, and special character'); return; }
    setLoading(true); setError('');
    try {
      const result = await register(form);
      if (result.success) {
        navigate('/');
      } else {
        setError(result.message || 'Registration failed');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <div className="auth-banner-content">
          <div className="auth-logo-icon" style={{ width: 64, height: 64, marginBottom: 'var(--space-6)' }}><Shield size={32} /></div>
          <h2>Join the front line of digital defense.</h2>
          <p>Create an account to instantly monitor your domain and email assets against thousands of known data breaches.</p>
        </div>
      </div>
      <div className="auth-page-form-wrapper">
        <div className="auth-container" style={{ maxWidth: 500 }}>
          <div className="auth-logo mobile-logo-only">
            <div className="auth-logo-icon"><Shield size={28} /></div>
            <span className="auth-logo-text">BreachGuard</span>
          </div>
          <div className="auth-card">
          <h1 className="auth-title">Create Account</h1>
          <p className="auth-subtitle">Start monitoring your digital security</p>

          {error && (
            <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--accent-red)' }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name *</label>
              <div style={{ position: 'relative' }}>
                <User size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" placeholder="Enter your full name" value={form.name} onChange={(e) => update('name', e.target.value)} style={{ paddingLeft: 40 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Email *</label>
              <div style={{ position: 'relative' }}>
                <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="email" placeholder="Enter your email address" value={form.email} onChange={(e) => update('email', e.target.value)} style={{ paddingLeft: 40 }} />
              </div>
            </div>
            <div className="form-group">
              <label className="form-label">Password *</label>
              <div style={{ position: 'relative' }}>
                <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                <input className="form-input" type="password" placeholder="8-16 chars, 1 upper, 1 lower, 1 num, 1 symbol" value={form.password} onChange={(e) => update('password', e.target.value)} style={{ paddingLeft: 40 }} />
              </div>
            </div>

            <Button type="submit" variant="primary" className="w-full" disabled={loading}>
              {loading ? 'Creating account...' : 'Create Account'}
            </Button>
          </form>
          <div className="auth-footer">Already have an account? <Link to="/login">Sign in</Link></div>
        </div>
        </div>
      </div>
    </div>
  );
}
