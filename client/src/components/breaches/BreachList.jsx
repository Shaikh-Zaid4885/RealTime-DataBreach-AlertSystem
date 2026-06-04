import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BreachCard from './BreachCard';
import { Search } from 'lucide-react';

const mockBreaches = [
  { _id: '1', name: 'LinkedIn', domain: 'linkedin.com', severity: 'critical', breachDate: '2024-11-15', pwnCount: 164611595, description: 'In November 2024, LinkedIn suffered a massive data breach exposing user credentials and personal information.', dataClasses: ['Email addresses', 'Passwords', 'Names', 'Phone numbers'] },
  { _id: '2', name: 'Adobe', domain: 'adobe.com', severity: 'high', breachDate: '2024-10-03', pwnCount: 152445165, description: 'Adobe experienced a breach that exposed encrypted passwords and password hints for millions of users.', dataClasses: ['Email addresses', 'Passwords', 'Usernames', 'Password hints'] },
  { _id: '3', name: 'Canva', domain: 'canva.com', severity: 'medium', breachDate: '2024-08-22', pwnCount: 137272116, description: 'Canva design platform breach exposed user accounts including partial payment data.', dataClasses: ['Email addresses', 'Usernames', 'Names', 'Geographic locations'] },
  { _id: '4', name: 'Dropbox', domain: 'dropbox.com', severity: 'high', breachDate: '2024-07-10', pwnCount: 68648009, description: 'Dropbox cloud storage breach compromised user credentials and file metadata.', dataClasses: ['Email addresses', 'Passwords'] },
];

export default function BreachList({ breaches }) {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const data = breaches || mockBreaches;

  const filtered = data.filter((b) =>
    (b.name || '').toLowerCase().includes(search.toLowerCase()) ||
    (b.domain || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div>
      <div style={{ position: 'relative', marginBottom: 'var(--space-6)' }}>
        <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
        <input
          className="form-input"
          placeholder="Search breaches by name or domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ paddingLeft: 40 }}
        />
      </div>
      <div style={{ display: 'grid', gap: 'var(--space-4)' }}>
        {filtered.map((breach, i) => (
          <BreachCard key={breach._id || i} breach={breach} onClick={() => navigate(`/breaches/${breach._id}`)} />
        ))}
        {filtered.length === 0 && (
          <div className="empty-state">
            <div className="empty-state-title">No breaches found</div>
            <div className="empty-state-text">Try adjusting your search terms.</div>
          </div>
        )}
      </div>
    </div>
  );
}
