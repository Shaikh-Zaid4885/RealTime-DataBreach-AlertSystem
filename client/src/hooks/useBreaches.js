import { useState, useEffect, useCallback } from 'react';
import api from '../api/axios';

export function useBreaches() {
  const [breaches, setBreaches] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchBreaches = useCallback(async (filters = {}) => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filters.severity) params.append('severity', filters.severity);
      if (filters.search) params.append('search', filters.search);
      if (filters.page) params.append('page', filters.page);
      const res = await api.get(`/breaches?${params.toString()}`);
      const data = res.data?.data?.breaches || res.data.breaches || res.data;
      setBreaches(Array.isArray(data) ? data : []);
    } catch {
      setBreaches([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const getBreachById = useCallback(async (id) => {
    try {
      const res = await api.get(`/breaches/${id}`);
      return res.data?.data || res.data;
    } catch {
      return null;
    }
  }, []);

  useEffect(() => {
    fetchBreaches();
  }, [fetchBreaches]);

  return { breaches, loading, error, fetchBreaches, getBreachById };
}
