import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, Users, Database, Shield, AlertTriangle } from 'lucide-react';
import SeverityBadge from '../components/breaches/SeverityBadge';
import Button from '../components/common/Button';
import api from '../api/axios';


export default function BreachDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [breach, setBreach] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    document.title = 'Breach Details — BreachGuard';
    const fetchBreach = async () => {
      try {
        const res = await api.get(`/breaches/${id}`);
        setBreach(res.data?.data?.breach);
      } catch (err) { 
        setError(err.response?.data?.message || 'Failed to fetch breach details');
      }
      finally { setLoading(false); }
    };
    fetchBreach();
  }, [id]);

  const formatCount = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

  if (loading) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--text-muted)' }}>Loading Breach Details...</div></div>;
  if (error) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--accent-red)' }}>{error}</div></div>;
  if (!breach) return <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}><div style={{ color: 'var(--text-muted)' }}>Breach not found.</div></div>;

  const data = breach;

  return (
    <div>
      <button onClick={() => navigate(-1)} className="btn btn-ghost mb-6" style={{ gap: 8 }}>
        <ArrowLeft size={16} /> Back
      </button>

      <div className="glass-card mb-6">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-4)' }}>
          <div>
            <h1 className="page-title">{data.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-4)', marginTop: 'var(--space-2)', flexWrap: 'wrap' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}><Globe size={14} /> {data.domain}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}><Calendar size={14} /> {new Date(data.breachDate).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}><Users size={14} /> {formatCount(data.pwnCount)} records</span>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-3)' }}>
            <SeverityBadge severity={data.severity} />
            {data.severityScore && (
              <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800, fontSize: 'var(--text-2xl)', color: data.severity === 'critical' ? 'var(--accent-red)' : data.severity === 'high' ? 'var(--accent-orange)' : 'var(--accent-amber)' }}>
                {data.severityScore}/100
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="grid-2" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="glass-card">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}><Database size={18} /> Exposed Data Types</h3>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>
            {data.dataClasses?.map((type, i) => (
              <span key={i} className="data-type-tag" style={{ padding: '6px 14px', fontSize: 'var(--text-sm)' }}>{type}</span>
            ))}
          </div>
        </div>

        <div className="glass-card">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}><AlertTriangle size={18} /> Risk Factors</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            {data.nlpAnalysis?.riskFactors?.map((factor, i) => (
              <div key={i} style={{ display: 'flex', gap: 'var(--space-3)', padding: 'var(--space-3)', background: 'var(--bg-elevated)', borderRadius: 'var(--radius-md)', fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>
                <AlertTriangle size={16} style={{ flexShrink: 0, color: 'var(--accent-amber)', marginTop: 2 }} />
                {factor}
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="glass-card mb-6">
        <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)' }}>Description</h3>
        <p style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)', lineHeight: 1.8 }}>{data.description?.replace(/<[^>]*>/g, '')}</p>
        {data.nlpAnalysis?.summary && (
          <div style={{ marginTop: 'var(--space-4)', padding: 'var(--space-4)', background: 'rgba(76,111,255,0.06)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(76,111,255,0.15)' }}>
            <strong style={{ fontSize: 'var(--text-sm)', color: 'var(--accent-blue)' }}>AI Analysis: </strong>
            <span style={{ fontSize: 'var(--text-sm)', color: 'var(--text-secondary)' }}>{data.nlpAnalysis.summary}</span>
          </div>
        )}
      </div>

      {data.legalReferences && data.legalReferences.length > 0 && (
        <div className="glass-card">
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 700, marginBottom: 'var(--space-4)', display: 'flex', alignItems: 'center', gap: 8 }}><Shield size={18} /> Legal References</h3>
          <div style={{ display: 'grid', gap: 'var(--space-3)' }}>
            {data.legalReferences.map((ref, i) => (
              <div key={i} className="compliance-item">
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--text-sm)' }}>{ref.law} — {ref.section}</div>
                  <div style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)', marginTop: 2 }}>{ref.description}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
