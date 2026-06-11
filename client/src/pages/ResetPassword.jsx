import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { Lock, ArrowLeft, CheckCircle, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../api/axios';

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();
  
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Reset Password — BreachGuard';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setLoading(true);
    setError('');

    let timeoutId;
    try {
      await api.put(`/auth/resetpassword/${token}`, { password });
      setSuccess(true);
      timeoutId = setTimeout(() => {
        navigate('/login');
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid or expired token. Please request a new link.');
    } finally {
      setLoading(false);
    }

    return () => clearTimeout(timeoutId);
  };

  return (
    <div className="auth-page">
      <div className="auth-banner">
        <div className="auth-banner-content">
          <div className="auth-logo-icon" style={{ width: 64, height: 64, marginBottom: 'var(--space-6)' }}><Shield size={32} /></div>
          <h2>Secure your account.</h2>
          <p>Follow the steps to regain access to your BreachGuard dashboard securely.</p>
        </div>
      </div>
      <div className="auth-page-form-wrapper">
        <div className="auth-container">
          <div className="auth-logo mobile-logo-only">
            <div className="auth-logo-icon"><Shield size={28} /></div>
            <span className="auth-logo-text">BreachGuard</span>
          </div>
          <div className="auth-card">
            <div className="auth-header">
              <h2>{success ? 'Password Reset!' : 'Set New Password'}</h2>
              <p>{success ? 'Your password has been changed successfully. Redirecting to login...' : 'Please enter your new password below.'}</p>
            </div>

            {error && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--accent-red)' }}>
                {error}
              </div>
            )}

            {!success && (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">New Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="At least 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      style={{ paddingLeft: 40 }}
                      required
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Confirm Password</label>
                  <div style={{ position: 'relative' }}>
                    <Lock size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="password"
                      className="form-input"
                      placeholder="Repeat new password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      style={{ paddingLeft: 40 }}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={loading}>
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}

            <div className="auth-footer" style={{ marginTop: 'var(--space-5)' }}>
              <Link to="/login" style={{ color: 'var(--accent-blue)', textDecoration: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px', fontWeight: 500 }}>
                <ArrowLeft size={16} /> Back to Login
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
