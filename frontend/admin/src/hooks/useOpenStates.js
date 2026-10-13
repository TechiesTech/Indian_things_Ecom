import { useState, useEffect, useCallback } from 'react';
import { getAllStates } from '../services/stateApi';
import { getRequestErrorMessage } from '../services/api';

/**
 * Custom hook to retrieve operational states filtered by persona (customer or vendor).
 * Adheres strictly to the business rule:
 * - Customers and vendors ONLY see states that are actively open for them.
 * - States are NEVER hardcoded in the frontend; dynamic synchronization via getAllStates.
 *
 * @param {'customer' | 'vendor'} audience - Target audience to filter states for
 * @returns {{ states: Array, loading: boolean, error: string | null, refetch: Function }}
 */
export const useOpenStates = (audience = 'customer') => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchOpenStates = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Fetch all states dynamically from backend
      const allStates = await getAllStates();
      const list = Array.isArray(allStates) ? allStates : [];

      // ADAPT: Filter field names if your backend model uses different property names
      let filtered = [];
      if (audience === 'vendor') {
        filtered = list.filter((item) => Boolean(item.isOpenForVendors));
      } else {
        // Default to 'customer'
        filtered = list.filter((item) => Boolean(item.isOpenForCustomers));
      }

      // Sort alphabetically by state name for clean dropdown UX
      filtered.sort((a, b) => (a.stateName || '').localeCompare(b.stateName || ''));

      setStates(filtered);
    } catch (err) {
      const msg = getRequestErrorMessage(err, `Failed to fetch open states for ${audience}`);
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [audience]);

  useEffect(() => {
    fetchOpenStates();
  }, [fetchOpenStates]);

  return {
    states,
    loading,
    error,
    refetch: fetchOpenStates,
  };
};

export default useOpenStates;
