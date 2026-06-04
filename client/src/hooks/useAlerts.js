import { useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axios';
import { SocketContext } from '../context/SocketContext';

export function useAlerts() {
  const [alerts, setAlerts] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const socket = useContext(SocketContext);

  const fetchAlerts = useCallback(async (filters = {}) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.status) params.append('status', filters.status);
      if (filters.type) params.append('type', filters.type);
      const [alertsRes, countRes] = await Promise.all([
        api.get(`/alerts?${params.toString()}`),
        api.get('/alerts/unread/count')
      ]);
      const data = alertsRes.data?.data?.alerts || alertsRes.data.alerts || alertsRes.data;
      const alertList = Array.isArray(data) ? data : [];
      setAlerts(alertList);
      setUnreadCount(countRes.data?.data?.count || 0);
    } catch {
      setAlerts([]);
      setUnreadCount(0);
    } finally {
      setLoading(false);
    }
  }, []);

  const markAsRead = useCallback(async (alertId) => {
    try {
      await api.patch(`/alerts/${alertId}`, { status: 'read' });
    } catch {
      // offline mode
    }
    setAlerts((prev) =>
      prev.map((a) => (a._id === alertId ? { ...a, status: 'read' } : a))
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
    window.dispatchEvent(new Event('alerts_updated'));
  }, []);

  const markAllRead = useCallback(async () => {
    try {
      await api.patch('/alerts/read-all');
    } catch {
      // offline mode
    }
    setAlerts((prev) => prev.map((a) => ({ ...a, status: 'read' })));
    setUnreadCount(0);
    window.dispatchEvent(new Event('alerts_updated'));
  }, []);

  useEffect(() => {
    fetchAlerts();
    
    const handleUpdate = () => {
      fetchAlerts();
    };
    window.addEventListener('alerts_updated', handleUpdate);
    return () => window.removeEventListener('alerts_updated', handleUpdate);
  }, [fetchAlerts]);

  useEffect(() => {
    if (!socket) return;
    const unsub = socket.subscribe('alerts-hook', (newAlert) => {
      setAlerts((prev) => [newAlert, ...prev]);
      setUnreadCount((prev) => prev + 1);
    });
    return unsub;
  }, [socket]);

   return { alerts, unreadCount, loading, fetchAlerts, markAsRead, markAllRead };
}


