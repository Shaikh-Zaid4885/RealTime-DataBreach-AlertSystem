import AlertItem from './AlertItem';

const mockAlerts = [
  { id: '1', severity: 'critical', status: 'unread', message: 'Your email was found in the LinkedIn breach. Passwords and email addresses were exposed affecting 164M users.', createdAt: new Date(Date.now() - 300000), recommendations: [{ action: 'Change your LinkedIn password immediately', completed: false }, { action: 'Enable Two-Factor Authentication', completed: false }, { action: 'Check for unauthorized account activity', completed: true }] },
  { id: '2', severity: 'high', status: 'unread', message: 'Adobe Systems breach detected. Password hashes and hints were compromised for your registered email.', createdAt: new Date(Date.now() - 3600000), recommendations: [{ action: 'Reset your Adobe password', completed: false }, { action: 'Change passwords on similar accounts', completed: false }] },
  { id: '3', severity: 'medium', status: 'read', message: 'Canva data exposure found. Your username and email were part of the 137M record breach.', createdAt: new Date(Date.now() - 86400000), recommendations: [{ action: 'Update Canva password', completed: true }] },
  { id: '4', severity: 'low', status: 'read', message: 'Scheduled monitoring scan completed. No new breaches detected for your 12 monitored identifiers.', createdAt: new Date(Date.now() - 172800000), recommendations: [] },
  { id: '5', severity: 'critical', status: 'unread', message: 'Dark web intelligence: credentials matching your domain detected on underground forum.', createdAt: new Date(Date.now() - 600000), recommendations: [{ action: 'Enforce organization-wide password reset', completed: false }, { action: 'Review access logs for suspicious activity', completed: false }, { action: 'Contact cybersecurity team', completed: false }] },
];

export default function AlertFeed({ alerts, onMarkRead, onAction }) {
  const data = alerts || mockAlerts;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
      {data.map((alert, i) => (
        <AlertItem key={alert.id || alert._id || i} alert={alert} onMarkRead={onMarkRead} onAction={onAction} />
      ))}
      {data.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-title">No alerts</div>
          <div className="empty-state-text">You're all caught up! No alerts match your filters.</div>
        </div>
      )}
    </div>
  );
}
