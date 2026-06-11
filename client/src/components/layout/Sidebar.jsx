import { NavLink, useLocation } from 'react-router-dom';
import { useState, useContext } from 'react';
import { AuthContext } from '../../context/AuthContext';
import {
  LayoutDashboard, Monitor, Bell, BarChart3, Scale,
  Settings, Shield, ChevronLeft, ChevronRight, Database
} from 'lucide-react';

const navItems = [
  { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { path: '/monitors', icon: Monitor, label: 'Monitors' },
  { path: '/alerts', icon: Bell, label: 'Alerts' },
  { path: '/legal', icon: Scale, label: 'Legal Advisory' },
  { path: '/analytics', icon: BarChart3, label: 'Analytics' },
  { path: '/all-breaches', icon: Database, label: 'All Breaches' },
  { path: '/settings', icon: Settings, label: 'Settings' },
];

export default function Sidebar({ collapsed, onToggle }) {
  const { user } = useContext(AuthContext);

  const finalNavItems = [...navItems];
  if (user?.role === 'admin') {
    finalNavItems.unshift({ path: '/admin', icon: Shield, label: 'Admin Panel' });
  }

  return (
    <aside className={`sidebar ${collapsed ? 'collapsed' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Shield size={20} />
        </div>
        {!collapsed && <span className="sidebar-logo-text">BreachGuard</span>}
      </div>

      <nav className="sidebar-nav">
        {finalNavItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === '/'}
            className={({ isActive }) => `sidebar-nav-item ${isActive ? 'active' : ''}`}
            title={collapsed ? item.label : undefined}
          >
            <item.icon className="sidebar-nav-icon" size={20} />
            {!collapsed && <span>{item.label}</span>}
          </NavLink>
        ))}
      </nav>

      <div className="sidebar-toggle">
        <button className="sidebar-toggle-btn" onClick={onToggle} aria-label="Toggle sidebar">
          {collapsed ? <ChevronRight size={18} /> : <ChevronLeft size={18} />}
        </button>
      </div>
    </aside>
  );
}
