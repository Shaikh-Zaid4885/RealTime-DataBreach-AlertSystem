import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function Layout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar collapsed={collapsed} onToggle={() => setCollapsed(!collapsed)} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <Header collapsed={collapsed} onMenuClick={() => setMobileOpen(true)} />
      <main className={`main-content ${collapsed ? 'sidebar-collapsed' : ''}`}>
        <div className="page-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
