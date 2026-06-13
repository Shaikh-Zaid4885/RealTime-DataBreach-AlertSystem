import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogOut, User, Menu } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

export default function Header({ collapsed, onMenuClick }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showDropdown, setShowDropdown] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const initials = user?.name
    ? user.name.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : 'U';

  return (
    <header className={`header ${collapsed ? 'sidebar-collapsed' : ''}`}>
      <button className="mobile-menu-btn" onClick={onMenuClick} aria-label="Open menu">
        <Menu size={24} />
      </button>

      <div className="header-actions" ref={dropdownRef}>
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
