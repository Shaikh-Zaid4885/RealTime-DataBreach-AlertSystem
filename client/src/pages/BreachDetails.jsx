import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Globe, Calendar, Users, Database, Shield, AlertTriangle, ExternalLink } from 'lucide-react';
import SeverityBadge from '../components/breaches/SeverityBadge';
import Button from '../components/common/Button';
import api from '../api/axios';

const mockBreach = {
  _id: '1', name: 'LinkedIn', domain: 'linkedin.com', severity: 'critical', severityScore: 85,
  breachDate: '2024-11-15', pwnCount: 164611595,
  description: 'In November 2024, LinkedIn suffered a massive data breach. The incident exposed user credentials including email addresses, passwords, and personal profile information. The breach affected approximately 164 million users worldwide.',
  dataClasses: ['Email addresses', 'Passwords', 'Names', 'Phone numbers', 'Job titles', 'Geographic locations'],
  source: 'xposedornot', isVerified: true,
  nlpAnalysis: {
    keywords: ['password', 'credential', 'personal', 'email'],
    riskFactors: ['Login credentials were exposed. Immediate password changes required.', 'Personal contact information was exposed. Watch for phishing attempts.', 'Large-scale breach affecting 164.6M+ records. Data likely widely distributed.'],
    summary: 'LinkedIn experienced a critical data breach on November 15, 2024. Approximately 164.6 million records were exposed.',
  },
  legalReferences: [
    { law: 'GDPR', section: 'Article 33', description: 'Must notify supervisory authority within 72 hours' },
    { law: 'DPDP Act 2023', section: 'Section 8(6)', description: 'Must notify Data Protection Board and affected individuals' },
    { law: 'CCPA', section: 'Section 1798.150', description: 'Consumers can file lawsuits for unauthorized access of unencrypted PII' },
  ],
};

export default function BreachDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [breach, setBreach] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    document.title = 'Breach Details — BreachGuard';
    const fetchBreach = async () => {
      try {
        const res = await api.get(`/breaches/${id}`);
        setBreach(res.data?.data?.breach);
      } catch { setBreach(mockBreach); }
      finally { setLoading(false); }
    };
    fetchBreach();
  }, [id]);

  const data = breach || mockBreach;
  const formatCount = (n) => n >= 1000000 ? `${(n / 1000000).toFixed(1)}M` : n >= 1000 ? `${(n / 1000).toFixed(0)}K` : String(n);

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
