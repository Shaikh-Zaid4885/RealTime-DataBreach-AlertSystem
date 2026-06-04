import { useEffect } from 'react';
import { Building2, Users, Shield, AlertTriangle, Mail, Globe } from 'lucide-react';
import BreachChart from '../components/analytics/BreachChart';

const orgMembers = [
  { name: 'Rahul Sharma', role: 'IT Admin', email: 'rahul@corp.com', breaches: 3 },
  { name: 'Priya Patel', role: 'Legal Counsel', email: 'priya@corp.com', breaches: 1 },
  { name: 'Arjun Singh', role: 'CISO', email: 'arjun@corp.com', breaches: 5 },
  { name: 'Anita Desai', role: 'HR Manager', email: 'anita@corp.com', breaches: 2 },
  { name: 'Vikram Reddy', role: 'Developer', email: 'vikram@corp.com', breaches: 0 },
];

const domainStats = [
  { domain: 'corp.com', emails: 45, breaches: 12, risk: 'high' },
  { domain: 'legal-firm.in', emails: 18, breaches: 3, risk: 'medium' },
  { domain: 'gov-dept.gov.in', emails: 120, breaches: 8, risk: 'high' },
];

export default function OrgDashboard() {
  useEffect(() => { document.title = 'Organization — BreachGuard'; }, []);

  return (
    <div>
      <div className="page-header">
        <h1 className="page-title">Organization Dashboard</h1>
        <p className="page-subtitle">Monitor and manage organizational data exposure</p>
      </div>

      <div className="stats-grid">
        <div className="stat-card blue">
          <div className="stat-icon blue"><Building2 size={24} /></div>
          <div className="stat-content"><div className="stat-label">Monitored Domains</div><div className="stat-value">3</div></div>
        </div>
        <div className="stat-card green">
          <div className="stat-icon green"><Users size={24} /></div>
          <div className="stat-content"><div className="stat-label">Team Members</div><div className="stat-value">5</div></div>
        </div>
        <div className="stat-card red">
          <div className="stat-icon red"><AlertTriangle size={24} /></div>
          <div className="stat-content"><div className="stat-label">Total Breaches</div><div className="stat-value">23</div></div>
        </div>
        <div className="stat-card amber">
          <div className="stat-icon amber"><Shield size={24} /></div>
          <div className="stat-content"><div className="stat-label">Risk Level</div><div className="stat-value">High</div></div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Globe size={20} /> Domain Monitoring</h2>
          </div>
          <table className="data-table">
            <thead><tr><th>Domain</th><th>Emails</th><th>Breaches</th><th>Risk</th></tr></thead>
            <tbody>
              {domainStats.map((d, i) => (
                <tr key={i}>
                  <td style={{ fontFamily: 'var(--font-mono)' }}>{d.domain}</td>
                  <td>{d.emails}</td>
                  <td>{d.breaches}</td>
                  <td><span className={`severity-badge ${d.risk}`}>{d.risk}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Users size={20} /> Team Members</h2>
          </div>
          {orgMembers.map((m, i) => (
            <div key={i} className="org-member">
              <div className="org-member-avatar">{m.name.split(' ').map((n) => n[0]).join('')}</div>
              <div className="org-member-info">
                <div className="org-member-name">{m.name}</div>
                <div className="org-member-role">{m.role} · {m.email}</div>
              </div>
              <span className={`severity-badge ${m.breaches > 3 ? 'high' : m.breaches > 0 ? 'medium' : 'low'}`}>
                {m.breaches} breaches
              </span>
            </div>
          ))}
        </div>

        <div className="dashboard-section dashboard-grid-full">
          <div className="dashboard-section-header">
            <h2 className="dashboard-section-title"><Shield size={20} /> Organization Breach Trends</h2>
          </div>
          <BreachChart />
        </div>
      </div>
    </div>
  );
}
