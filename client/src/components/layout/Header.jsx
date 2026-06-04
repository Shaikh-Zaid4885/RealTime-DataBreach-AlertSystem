import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Bell, LogOut, User } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';
import { useAlerts } from '../../hooks/useAlerts';

export default function Header({ collapsed }) {
  const { user, logout } = useAuth();
  const { unreadCount } = useAlerts();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <div className="header-search">
        <Search className="header-search-icon" size={16} />
        <input
          type="text"
          className="header-search-input"
          placeholder="Search breaches, alerts, monitors..."
        />
      </div>

      <div className="header-actions">
        <button
          className="header-action-btn"
          onClick={() => navigate('/alerts')}
          aria-label="Notifications"
        >
          <Bell size={20} />
          {unreadCount > 0 && (
            <span className="header-badge">{unreadCount > 9 ? '9+' : unreadCount}</span>
          )}
        </button>

        <div className="header-user" onClick={() => setShowDropdown(!showDropdown)}>
          <div className="header-avatar">{initials}</div>
          <div className="header-user-info">
            <span className="header-user-name">{user?.name || 'User'}</span>
            <span className="header-user-role">{user?.role || 'individual'}</span>
          </div>
        </div>

        {showDropdown && (
          <div className="notification-dropdown" style={{ width: 200, top: 56, right: 16 }}>
            <button
              className="sidebar-nav-item"
              onClick={() => { navigate('/settings'); setShowDropdown(false); }}
              style={{ width: '100%', padding: '12px 16px' }}
            >
              <User size={16} /> Profile
            </button>
            <button
              className="sidebar-nav-item"
              onClick={handleLogout}
              style={{ width: '100%', padding: '12px 16px', color: 'var(--accent-red)' }}
            >
              <LogOut size={16} /> Logout
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
