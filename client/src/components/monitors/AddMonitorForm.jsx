import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Mail, Globe, Plus, Search, AlertTriangle, CheckCircle, ExternalLink } from 'lucide-react';
import Button from '../common/Button';
import api from '../../api/axios';

export default function AddMonitorForm({ onAdd }) {
  const navigate = useNavigate();
  const [type, setType] = useState('email');
  const [identifier, setIdentifier] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [checkResult, setCheckResult] = useState(null);

  const icons = { email: Mail, domain: Globe };
  const placeholders = { email: 'user@example.com', domain: 'example.com' };

  const validate = () => {
    if (!identifier.trim()) return 'Please enter an identifier';
    if (type === 'email' && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(identifier)) return 'Invalid email address';
    if (type === 'domain' && !/^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(identifier)) return 'Invalid domain name';
    if (type === 'domain' && !apiKey.trim()) return 'XposedOrNot API Key is required for domains';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setLoading(true);
    setError('');
    setCheckResult(null);
    try {
      await onAdd?.({ type, value: identifier, apiKey: type === 'domain' ? apiKey : undefined });
      setIdentifier('');
      setApiKey('');
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Failed to add monitor');
    } finally {
      setLoading(false);
    }
  };

  const handleCheck = async (e) => {
    e.preventDefault();
    const err = validate();
    if (err) { setError(err); return; }

    setChecking(true);
    setError('');
    setCheckResult(null);
    try {
      const res = await api.post('/monitors/check', { type, value: identifier, apiKey: type === 'domain' ? apiKey : undefined });
      setCheckResult(res.data.data);
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Check failed');
    } finally {
      setChecking(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>

      <div className="form-group">
        <label className="form-label">Type</label>
        <div style={{ display: 'flex', gap: 'var(--space-2)' }}>
          {['email', 'domain'].map((t) => {
            const Icon = icons[t];
            return (
              <button key={t} type="button"
                className={`filter-chip ${type === t ? 'active' : ''}`}
                onClick={() => setType(t)}
                style={{ display: 'flex', alignItems: 'center', gap: 6 }}
              >
                <Icon size={14} /> {t.charAt(0).toUpperCase() + t.slice(1)}
              </button>
            );
          })}
        </div>
      </div>

      <div className="form-group">
        <label className="form-label">Identifier</label>
        <input
          className={`form-input ${error && !apiKey ? 'error' : ''}`}
          placeholder={placeholders[type]}
          value={identifier}
          onChange={(e) => { setIdentifier(e.target.value); setError(''); setCheckResult(null); }}
        />
      </div>

      {type === 'domain' && (
        <div className="form-group">
          <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>XposedOrNot API Key</span>
            <a href="https://xposedornot.com/domain" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-blue)', textDecoration: 'none', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
              Get API Key <ExternalLink size={12} />
            </a>
          </label>
          <input
            type="password"
            className={`form-input ${error && error.includes('API') ? 'error' : ''}`}
            placeholder="Paste your verified API key here"
            value={apiKey}
            onChange={(e) => { setApiKey(e.target.value); setError(''); setCheckResult(null); }}
          />
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Your key is heavily encrypted before being stored. It is only decrypted momentarily during scans.
          </div>
        </div>
      )}

      {error && <div className="form-error" style={{ marginBottom: '16px' }}>{error}</div>}

      {checkResult && (
        <div style={{ marginTop: 'var(--space-2)', padding: 'var(--space-3)', borderRadius: 'var(--radius-md)', background: checkResult.breachCount > 0 ? 'rgba(239, 68, 68, 0.1)' : 'rgba(16, 185, 129, 0.1)', border: `1px solid ${checkResult.breachCount > 0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.2)'}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: checkResult.breachCount > 0 ? 'var(--accent-red)' : 'var(--accent-green)', fontWeight: 600, marginBottom: checkResult.breachCount > 0 ? '8px' : 0 }}>
            {checkResult.breachCount > 0 ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
            {checkResult.breachCount > 0 ? `Found in ${checkResult.breachCount} data breaches!` : 'No breaches found! Safe for now.'}
          </div>
          {checkResult.breachCount > 0 && (
            <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-secondary)' }}>
              <strong>Breaches:</strong>{' '}
              {checkResult.breaches.map((b, i) => (
                <span key={b.name} style={{ display: 'inline-block', marginRight: '12px', marginBottom: '4px' }}>
                  {b.name}
                  <button 
                    type="button" 
                    onClick={() => navigate(`/all-breaches?search=${encodeURIComponent(b.name)}`)}
                    style={{ background: 'none', border: 'none', color: 'var(--accent-blue)', textDecoration: 'underline', marginLeft: '6px', fontSize: '11px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '2px', padding: 0 }}
                  >
                    See detail <ExternalLink size={10} />
                  </button>
                  {i < checkResult.breaches.length - 1 ? ',' : ''}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      <div style={{ marginTop: 'auto', paddingTop: 'var(--space-4)', display: 'flex', gap: 'var(--space-3)' }}>
        <Button type="button" onClick={handleCheck} variant="outline" icon={Search} disabled={checking || loading} className="w-full">
          {checking ? 'Checking...' : 'Check'}
        </Button>
        <Button type="submit" variant="primary" icon={Plus} disabled={loading || checking} className="w-full">
          {loading ? 'Adding...' : 'Add Monitor'}
        </Button>
      </div>
    </form>
  );
}
