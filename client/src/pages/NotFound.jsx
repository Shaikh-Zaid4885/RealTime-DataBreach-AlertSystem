import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';
import Button from '../components/common/Button';

export default function NotFound() {
  return (
    <div className="not-found">
      <div className="not-found-code">404</div>
      <h1 className="not-found-title">Page Not Found</h1>
      <p className="not-found-text">The page you're looking for doesn't exist or has been moved.</p>
      <Link to="/"><Button variant="primary" icon={Shield}>Back to Dashboard</Button></Link>
    </div>
  );
}
