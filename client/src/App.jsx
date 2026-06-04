import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import Layout from './components/layout/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Monitors from './pages/Monitors';
import AllBreaches from './pages/AllBreaches';
import BreachDetails from './pages/BreachDetails';
import Alerts from './pages/Alerts';
import Analytics from './pages/Analytics';
import OrgDashboard from './pages/OrgDashboard';
import LegalAdvisory from './pages/LegalAdvisory';
import Settings from './pages/Settings';
import NotFound from './pages/NotFound';

function App() {
  return (
    <AuthProvider>
      <SocketProvider>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
              <Route index element={<Dashboard />} />
              <Route path="monitors" element={<Monitors />} />
              <Route path="all-breaches" element={<AllBreaches />} />
              <Route path="breaches/:id" element={<BreachDetails />} />
              <Route path="alerts" element={<Alerts />} />
              <Route path="analytics" element={<Analytics />} />
              <Route path="organization" element={<OrgDashboard />} />
              <Route path="legal" element={<LegalAdvisory />} />
              <Route path="settings" element={<Settings />} />
            </Route>
            <Route path="*" element={<NotFound />} />
          </Routes>
        </Router>
      </SocketProvider>
    </AuthProvider>
  );
}

export default App;
