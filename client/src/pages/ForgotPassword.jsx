import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Shield } from 'lucide-react';
import Button from '../components/common/Button';
import api from '../api/axios';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    document.title = 'Forgot Password — BreachGuard';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setSuccess(false);

    try {
      await api.post('/auth/forgotpassword', { email });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong. Please try again.');
    } finally {
      setLoading(false);
    }
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
              <h2>Reset Your Password</h2>
              <p>Enter your email address and we will send you a secure link to reset your password.</p>
            </div>

            {error && (
              <div style={{ padding: 'var(--space-3) var(--space-4)', background: 'rgba(255,51,102,0.08)', border: '1px solid rgba(255,51,102,0.2)', borderRadius: 'var(--radius-md)', marginBottom: 'var(--space-5)', fontSize: 'var(--text-sm)', color: 'var(--accent-red)' }}>
                {error}
              </div>
            )}

            {success ? (
              <div style={{ background: 'rgba(34, 197, 94, 0.1)', color: 'var(--accent-green)', padding: 'var(--space-4)', borderRadius: 'var(--radius-md)', textAlign: 'center', marginBottom: 'var(--space-4)' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px' }}>Reset Link Sent!</div>
                <div style={{ fontSize: 'var(--text-sm)', opacity: 0.9 }}>
                  Check your email for a link to reset your password. If it doesn't appear within a few minutes, check your spam folder.
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit}>
                <div className="form-group">
                  <label className="form-label">Email Address</label>
                  <div style={{ position: 'relative' }}>
                    <Mail size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
                    <input
                      type="email"
                      className="form-input"
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      style={{ paddingLeft: 40 }}
                      required
                    />
                  </div>
                </div>

                <Button type="submit" variant="primary" style={{ width: '100%', marginTop: 'var(--space-4)' }} disabled={loading}>
                  {loading ? 'Sending...' : 'Send Reset Link'}
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
