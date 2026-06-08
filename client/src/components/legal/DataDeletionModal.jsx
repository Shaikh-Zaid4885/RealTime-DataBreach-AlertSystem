import { useState } from 'react';
import { X, Copy, CheckCircle } from 'lucide-react';
import Button from '../common/Button';

export default function DataDeletionModal({ threat, onClose }) {
  const [copied, setCopied] = useState(false);

  if (!threat) return null;

  const emailSubject = `Formal Data Deletion Request - ${threat.name}`;
  const emailBody = `To Whom It May Concern at ${threat.name},

I am writing to formally request the immediate deletion of all personal data associated with my account, invoking my rights under applicable data protection laws (including GDPR and DPDP Act where applicable).

Following the recent security breach involving my information at your organization, I no longer consent to my data being stored or processed on your servers. 

Please consider this a formal request for erasure. I expect a confirmation once all my data has been permanently erased from your active systems and backups.

Sincerely,
[Your Name]
[Your Affected Email/Phone]`;

  const handleCopy = () => {
    navigator.clipboard.writeText(`Subject: ${emailSubject}\n\n${emailBody}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(4px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 1000, padding: 'var(--space-4)'
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--bg-modifier-border)',
        borderRadius: 'var(--radius-lg)', width: '100%', maxWidth: '600px',
        display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)'
      }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: 'var(--space-4) var(--space-5)', borderBottom: '1px solid var(--bg-modifier-border)' }}>
          <h3 style={{ fontSize: 'var(--text-lg)', fontWeight: 600 }}>Data Deletion Request</h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--space-5)', flex: 1, overflowY: 'auto' }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 'var(--space-4)', fontSize: 'var(--text-sm)' }}>
            Review the legally-worded deletion request below. You can copy this template and email it to the privacy or support team at <strong>{threat.name}</strong>.
          </p>

          <div style={{ 
            background: 'var(--bg-tertiary)', padding: 'var(--space-4)', 
            borderRadius: 'var(--radius-md)', fontFamily: 'var(--font-mono)', 
            fontSize: 'var(--text-xs)', color: 'var(--text-primary)',
            whiteSpace: 'pre-wrap', lineHeight: 1.6
          }}>
            <strong style={{ color: 'var(--text-muted)' }}>Subject:</strong> {emailSubject}
            <br /><br />
            {emailBody}
          </div>
        </div>

        {/* Footer */}
        <div style={{ padding: 'var(--space-4) var(--space-5)', borderTop: '1px solid var(--bg-modifier-border)', display: 'flex', justifyContent: 'flex-end', gap: 'var(--space-3)' }}>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleCopy} icon={copied ? CheckCircle : Copy} variant={copied ? 'success' : 'primary'}>
            {copied ? 'Copied to Clipboard!' : 'Copy to Clipboard'}
          </Button>
        </div>
      </div>
    </div>
  );
}
