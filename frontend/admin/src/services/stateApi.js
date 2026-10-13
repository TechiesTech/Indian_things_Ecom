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

/**
 * Add one or more districts to an existing state.
 * Endpoint: POST /api/states/addDistrict/:stateCode
 * @param {string} stateCode - e.g. "TS"
 * @param {string[]|string} districtNames - Array of district names e.g. ["Adilabad", "Karimnagar"]
 * @returns {Promise<object>} Updated state or creation response
 */
export const addDistricts = async (stateCode, districtNames) => {
  if (!stateCode) throw new Error('State code is required');

  const namesList = Array.isArray(districtNames)
    ? districtNames.map((n) => String(n).trim()).filter(Boolean)
    : [String(districtNames).trim()].filter(Boolean);

  // ADAPT: If your backend accepts { districtName: "..." } for single additions
  // or { districtNames: [...] } for bulk additions, verify payload key:
  const payload = {
    districtNames: namesList,
  };

  const response = await api.post(
    `/states/addDistrict/${encodeURIComponent(stateCode.trim().toUpperCase())}`,
    payload
  );
  return unwrap(response);
};

/**
 * Update an existing district in a state (rename or activate/deactivate).
 * Endpoint: PATCH /api/states/updateDistrict/:stateCode/:districtName
 * Sends ONLY the fields that changed (e.g. { isActive: false } or { newDistrictName: "Secunderabad" })
 *
 * @param {string} stateCode - e.g. "TS"
 * @param {string} districtName - Current name of the district e.g. "Hyderabad"
 * @param {object} body - { newDistrictName?: string, isActive?: boolean }
 * @returns {Promise<object>} Updated state or district record
 */
export const updateDistrict = async (stateCode, districtName, body = {}) => {
  if (!stateCode) throw new Error('State code is required');
  if (!districtName) throw new Error('District name is required');

  // Strict constraint: only send fields that are explicitly provided
  const payload = {};
  if ('isActive' in body) {
    payload.isActive = Boolean(body.isActive);
  }
  if ('newDistrictName' in body && body.newDistrictName !== undefined) {
    payload.newDistrictName = String(body.newDistrictName).trim();
  }

  // ADAPT: If your backend uses PUT instead of PATCH, adjust method here
  const encodedCode = encodeURIComponent(stateCode.trim().toUpperCase());
  const encodedName = encodeURIComponent(districtName.trim());

  const response = await api.patch(
    `/states/updateDistrict/${encodedCode}/${encodedName}`,
    payload
  );
  return unwrap(response);
};

/**
 * Delete a district from a state.
 * Endpoint: DELETE /api/states/deleteDistrict/:stateCode/:districtName
 *
 * @param {string} stateCode - e.g. "TS"
 * @param {string} districtName - District name to delete e.g. "Warangal"
 * @returns {Promise<object>} Deletion confirmation response
 */
export const deleteDistrict = async (stateCode, districtName) => {
  if (!stateCode) throw new Error('State code is required');
  if (!districtName) throw new Error('District name is required');

  const encodedCode = encodeURIComponent(stateCode.trim().toUpperCase());
  const encodedName = encodeURIComponent(districtName.trim());

  // ADAPT: If your backend uses query param instead of route param (e.g. ?name=...)
  const response = await api.delete(
    `/states/deleteDistrict/${encodedCode}/${encodedName}`
  );
  return unwrap(response);
};

