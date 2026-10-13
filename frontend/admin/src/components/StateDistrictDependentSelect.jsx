import { useState } from 'react';
import { useOpenStates } from '../hooks/useOpenStates';
import { useDistricts } from '../hooks/useDistricts';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Example dependent dropdown component:
 * 1. Picks an operational State from `useOpenStates("customer" | "vendor")`.
 * 2. Populates active Districts via `useDistricts(selectedState)`.
 * 3. Automatically resets the district selection whenever the selected state changes.
 *
 * Usage Example:
 * <StateDistrictDependentSelect
 *   audience="customer"
 *   onSelectionChange={({ stateCode, districtName }) => console.log(stateCode, districtName)}
 * />
 */
export const StateDistrictDependentSelect = ({
  audience = 'customer',
  onSelectionChange,
  className = '',
}) => {
  const [selectedState, setSelectedState] = useState('');
  const [selectedDistrict, setSelectedDistrict] = useState('');

  // 1. Fetch available states for the selected audience (customer or vendor)
  const {
    states,
    loading: loadingStates,
    error: statesError,
    refetch: refetchStates,
  } = useOpenStates(audience);

  // 2. Fetch active districts for the chosen state (auto-resets when stateCode is empty)
  const {
    districts,
    loading: loadingDistricts,
    error: districtsError,
    refetch: refetchDistricts,
  } = useDistricts(selectedState);

  // Handle State Change: reset district and notify parent
  const handleStateChange = (newCode) => {
    setSelectedState(newCode);
    setSelectedDistrict(''); // Critical: reset district when state changes

    if (onSelectionChange) {
      onSelectionChange({ stateCode: newCode, districtName: '' });
    }
  };

  // Handle District Change: notify parent
  const handleDistrictChange = (newDistrict) => {
    setSelectedDistrict(newDistrict);

    if (onSelectionChange) {
      onSelectionChange({ stateCode: selectedState, districtName: newDistrict });
    }
  };

  return (
    <div className={`space-y-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs ${className}`}>
      <div className="border-b border-slate-100 pb-3">
        <h4 className="text-xs font-bold uppercase tracking-wider text-slate-800">
          Location Selection ({audience === 'vendor' ? 'Vendor Portal' : 'Customer Checkout'})
        </h4>
        <p className="text-[11px] text-slate-500">
          State selection dynamically drives the active serviceable districts.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Step 1: State Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="dep-state-select"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            1. Select State <span className="text-rose-500">*</span>
          </label>

          {loadingStates ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>Loading open states...</span>
            </div>
          ) : statesError ? (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
              <span className="truncate">Error loading states</span>
              <button
                type="button"
                onClick={refetchStates}
                className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : (
            <select
              id="dep-state-select"
              value={selectedState}
              onChange={(e) => handleStateChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition-colors focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Choose State --</option>
              {states.map((st) => (
                <option key={st.stateCode} value={st.stateCode}>
                  {st.stateName} ({st.stateCode})
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Step 2: Dependent District Dropdown */}
        <div className="space-y-1.5">
          <label
            htmlFor="dep-district-select"
            className="block text-xs font-bold uppercase tracking-wider text-slate-700"
          >
            2. Select District <span className="text-rose-500">*</span>
          </label>

          {!selectedState ? (
            <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-400">
              Select a state first to view active districts
            </div>
          ) : loadingDistricts ? (
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
              <span>Loading districts for {selectedState}...</span>
            </div>
          ) : districtsError ? (
            <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-2 text-xs text-rose-700">
              <span className="truncate">Failed to load districts</span>
              <button
                type="button"
                onClick={refetchDistricts}
                className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
              >
                Retry
              </button>
            </div>
          ) : districts.length === 0 ? (
            <div className="rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              No active districts available in {selectedState}
            </div>
          ) : (
            <select
              id="dep-district-select"
              value={selectedDistrict}
              onChange={(e) => handleDistrictChange(e.target.value)}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-900 transition-colors focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              <option value="">-- Choose District ({districts.length} active) --</option>
              {districts.map((dist) => (
                <option key={dist} value={dist}>
                  {dist}
                </option>
              ))}
            </select>
          )}
        </div>
      </div>

      {selectedState && selectedDistrict && (
        <div className="rounded-xl bg-slate-50 p-2.5 text-xs text-slate-600 border border-slate-200">
          Selected Location:{' '}
          <span className="font-bold text-slate-900">{selectedDistrict}</span>,{' '}
          <span className="font-bold text-amber-700">{selectedState}</span>
        </div>
      )}
    </div>
  );
};

export default StateDistrictDependentSelect;
