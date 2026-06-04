import { useState, useEffect } from 'react';
import { Scale } from 'lucide-react';
import LegalCard from '../components/legal/LegalCard';
import ComplianceStatus from '../components/legal/ComplianceStatus';
import api from '../api/axios';

const defaultAdvisories = [
  {
    law: 'GDPR (EU)', title: 'General Data Protection Regulation', region: 'European Union',
    articles: [
      { article: 'Article 33', title: 'Breach notification to authority', description: 'Data breaches must be reported within 72 hours of becoming aware.' },
      { article: 'Article 34', title: 'Communication to data subject', description: 'If breach results in high risk, individuals must be notified without undue delay.' },
      { article: 'Article 32', title: 'Security of processing', description: 'Implement appropriate technical and organizational security measures.' },
    ],
    penalties: 'Up to €20 million or 4% of annual global turnover',
  },
  {
    law: 'IT Act 2000 (India)', title: 'Information Technology Act, 2000', region: 'India',
    articles: [
      { article: 'Section 43A', title: 'Compensation for failure to protect data', description: 'Body corporate possessing sensitive data must implement reasonable security practices.' },
      { article: 'Section 72A', title: 'Punishment for disclosure', description: 'Imprisonment up to 3 years and fine up to ₹5 lakh for unauthorized disclosure.' },
      { article: 'Section 66', title: 'Computer related offences', description: 'Punishment for hacking, data theft, and unauthorized access.' },
    ],
    penalties: 'Compensation as determined by adjudicating officer; criminal penalties including imprisonment',
  },
  {
    law: 'DPDP Act 2023 (India)', title: 'Digital Personal Data Protection Act, 2023', region: 'India',
    articles: [
      { article: 'Section 8(6)', title: 'Breach notification', description: 'Data fiduciary must inform the Board and affected data principals about breaches.' },
      { article: 'Section 8(4)', title: 'Security safeguards', description: 'Data fiduciary must protect personal data by taking reasonable security safeguards.' },
      { article: 'Section 4', title: 'Consent requirements', description: 'Personal data shall be processed only for lawful purposes with individual consent.' },
    ],
    penalties: 'Up to ₹250 crore for failure to take security measures',
  },
  {
    law: 'CCPA (California)', title: 'California Consumer Privacy Act', region: 'California, USA',
    articles: [
      { article: 'Section 1798.150', title: 'Private right of action', description: 'Consumers can file lawsuits for unauthorized access of unencrypted personal information.' },
      { article: 'Section 1798.100', title: 'Right to know', description: 'Consumers have the right to know what personal information is collected.' },
    ],
    penalties: '$100-$750 per consumer per incident in statutory damages',
  },
  {
    law: 'HIPAA (USA)', title: 'Health Insurance Portability and Accountability Act', region: 'United States',
    articles: [
      { article: 'Breach Notification Rule', title: '45 CFR 164.400-414', description: 'Covered entities must notify affected individuals within 60 days of breach discovery.' },
      { article: 'Security Rule', title: '45 CFR 164.302-318', description: 'Requires safeguards for electronic protected health information (ePHI).' },
    ],
    penalties: '$100 to $50,000 per violation, up to $1.5M annually per category',
  },
];

export default function LegalAdvisory() {
  const [advisories, setAdvisories] = useState(defaultAdvisories);

  useEffect(() => {
    document.title = 'Legal Advisory — BreachGuard';
    api.get('/reports/legal-advisories').then((res) => {
      if (res.data?.data?.advisories) setAdvisories(res.data.data.advisories);
    }).catch(() => {});
  }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Legal Advisory</h1>
        <p className="page-subtitle">Data protection laws, compliance guidance, and regulatory requirements</p>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: 'var(--space-6)' }}>
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Scale size={20} /> Compliance Status</h2>
          </div>
          <ComplianceStatus />
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Scale size={20} /> Key Deadlines</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Law</th><th>Action Required</th><th>Deadline</th></tr></thead>
            <tbody>
              <tr><td>GDPR</td><td>Notify supervisory authority</td><td style={{ color: 'var(--accent-red)', fontWeight: 600 }}>72 hours</td></tr>
              <tr><td>DPDP Act</td><td>Notify Data Protection Board</td><td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>Without delay</td></tr>
              <tr><td>HIPAA</td><td>Notify HHS and individuals</td><td style={{ color: 'var(--accent-amber)', fontWeight: 600 }}>60 days</td></tr>
              <tr><td>CCPA</td><td>Notify consumers</td><td style={{ fontWeight: 600 }}>Expeditiously</td></tr>
              <tr><td>IT Act</td><td>Report to CERT-In</td><td style={{ color: 'var(--accent-red)', fontWeight: 600 }}>6 hours</td></tr>
            </tbody>
          </table>
        </div>
      </div>

      <h2 style={{ fontSize: 'var(--text-xl)', fontWeight: 700, marginBottom: 'var(--space-5)' }}>Applicable Laws & Regulations</h2>
      <div className="grid-2">
        {advisories.map((law, i) => (
          <LegalCard key={i} law={law} />
        ))}
      </div>
    </div>
  );
}
