import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

const BASE = import.meta.env.VITE_API_BASE_URL;

export function useApi(endpoint) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetch = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await axios.get(`${BASE}${endpoint}`);
      setData(res.data);
    } catch (e) {
      setError(e);
    } finally {
      setLoading(false);
    }
  }, [endpoint]);

  useEffect(() => { fetch(); }, [fetch]);

  return { data, loading, error, refetch: fetch };
}

export const api = {
  get: (path) => axios.get(`${BASE}${path}`),
  post: (path, body) => axios.post(`${BASE}${path}`, body),
};
