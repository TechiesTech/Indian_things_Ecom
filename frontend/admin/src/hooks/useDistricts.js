import { useState, useEffect, useCallback } from 'react';
import { getStateDetails } from '../services/stateApi';
import { getRequestErrorMessage } from '../services/api';

/**
 * Custom hook to fetch only ACTIVE districts for a given state code.
 *
 * Business Rules:
 * - Customers and vendors only see ACTIVE districts of the state they select.
 * - Districts must never be hard-coded; fetched dynamically via getStateDetails.
 * - When stateCode is empty, returns an empty list without making an API call.
 *
 * @param {string} stateCode - e.g. "TS"
 * @returns {{ districts: string[], loading: boolean, error: string | null, refetch: Function }}
 */
export const useDistricts = (stateCode) => {
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDistricts = useCallback(async () => {
    // If no state is chosen, reset and do not call the backend
    if (!stateCode || !String(stateCode).trim()) {
      setDistricts([]);
      setLoading(false);
      setError(null);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getStateDetails(stateCode);

      // ADAPT: If your backend returns districts under data.districts, data.districtList, or directly in data
      const rawList =
        data?.districts ||
        data?.districtList ||
        (Array.isArray(data) ? data : []);

      // Normalise districts whether the backend returns:
      // 1. Array of strings: ["Adilabad", "Warangal"]
      // 2. Array of objects: [{ districtName: "Adilabad", isActive: true }]
      let activeNames = [];

      if (Array.isArray(rawList)) {
        activeNames = rawList
          .map((item) => {
            if (typeof item === 'string') {
              // String array items are considered active by default
              return { name: item.trim(), active: true };
            }
            if (item && typeof item === 'object') {
              const name = item.districtName || item.name || '';
              const active = item.isActive !== undefined ? Boolean(item.isActive) : true;
              return { name: String(name).trim(), active };
            }
            return null;
          })
          .filter((item) => item && item.name && item.active)
          .map((item) => item.name);
      }

      // Sort alphabetically for clean dropdown presentation
      activeNames.sort((a, b) => a.localeCompare(b));

      setDistricts(activeNames);
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, `Failed to load districts for state ${stateCode}`);
      setError(msg);
      setDistricts([]);
    } finally {
      setLoading(false);
    }
  }, [stateCode]);

  useEffect(() => {
    fetchDistricts();
  }, [fetchDistricts]);

  return {
    districts,
    loading,
    error,
    refetch: fetchDistricts,
  };
};

export default useDistricts;
