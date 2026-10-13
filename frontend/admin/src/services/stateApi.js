import { api } from './api';

/**
 * Unwraps Axios response object to extract the core data payload.
 * Handles variations like:
 * - Direct body: [{...}]
 * - Standard wrapper: { data: [...] }
 * - Success wrapper: { success: true, data: [...] }
 * - Specific key wrapper: { states: [...] } or { state: {...} }
 */
export const unwrap = (response) => {
  if (!response) return response;
  // If response is an Axios response object with .data
  const body = response.data !== undefined ? response.data : response;

  // ADAPT: If your backend returns payloads inside { data: ... }
  if (body && typeof body === 'object' && 'data' in body) {
    return body.data;
  }

  return body;
};

/**
 * Fetch all configured states.
 * Endpoint: GET /api/states/getAllStates
 * @returns {Promise<Array>} Array of state objects
 */
export const getAllStates = async () => {
  const response = await api.get('/states/getAllStates');
  const data = unwrap(response);

  // ADAPT: If your backend wraps list in { states: [...] }, handle it here
  if (data && typeof data === 'object' && Array.isArray(data.states)) {
    return data.states;
  }

  return Array.isArray(data) ? data : [];
};

/**
 * Fetch detailed information for a single state by code.
 * Endpoint: GET /api/states/getStateDetails/:stateCode
 * @param {string} stateCode - e.g. "TS"
 * @returns {Promise<object>} State details object
 */
export const getStateDetails = async (stateCode) => {
  if (!stateCode) throw new Error('State code is required');
  const response = await api.get(`/states/getStateDetails/${encodeURIComponent(stateCode.trim().toUpperCase())}`);
  const data = unwrap(response);

  // ADAPT: If your backend wraps single item in { state: {...} }, unwrap here
  if (data && typeof data === 'object' && data.state && typeof data.state === 'object') {
    return data.state;
  }

  return data;
};

/**
 * Add a new state.
 * Endpoint: POST /api/states/addState
 * @param {object} payload - { stateCode: "TS", stateName: "Telangana", stateType: "STATE" }
 * @returns {Promise<object>} Created state object
 */
export const addState = async ({ stateCode, stateName, stateType }) => {
  const payload = {
    // ADAPT: Ensure field names match your backend model (stateCode, stateName, stateType)
    stateCode: String(stateCode || '').trim().toUpperCase(),
    stateName: String(stateName || '').trim(),
    stateType: stateType || 'STATE',
  };

  const response = await api.post('/states/addState', payload);
  return unwrap(response);
};

/**
 * Update state toggles.
 * Endpoint: PATCH /api/states/updateState/:stateCode
 * Sends ONLY the field that changed (e.g. { isOpenForVendors: true } OR { isOpenForCustomers: false })
 * @param {string} stateCode - e.g. "TS"
 * @param {object} updates - Partial object containing isOpenForVendors or isOpenForCustomers
 * @returns {Promise<object>} Updated state object
 */
export const updateState = async (stateCode, updates) => {
  if (!stateCode) throw new Error('State code is required');

  // Strict constraint: only send fields that are explicitly provided
  const payload = {};
  if ('isOpenForVendors' in updates) {
    payload.isOpenForVendors = Boolean(updates.isOpenForVendors);
  }
  if ('isOpenForCustomers' in updates) {
    payload.isOpenForCustomers = Boolean(updates.isOpenForCustomers);
  }

  // ADAPT: If your backend expects PUT instead of PATCH, adjust method here
  const response = await api.patch(
    `/states/updateState/${encodeURIComponent(stateCode.trim().toUpperCase())}`,
    payload
  );
  return unwrap(response);
};

/**
 * Delete a state by code.
 * Endpoint: DELETE /api/states/deleteState/:stateCode
 * @param {string} stateCode - e.g. "TS"
 * @returns {Promise<object>} Deletion confirmation response
 */
export const deleteState = async (stateCode) => {
  if (!stateCode) throw new Error('State code is required');
  const response = await api.delete(`/states/deleteState/${encodeURIComponent(stateCode.trim().toUpperCase())}`);
  return unwrap(response);
};
