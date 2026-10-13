import { useOpenStates } from '../hooks/useOpenStates';
import { Loader2, AlertCircle } from 'lucide-react';

/**
 * Example reusable component demonstrating how to consume useOpenStates
 * in a customer checkout or vendor registration dropdown.
 *
 * Usage Example:
 * <OpenStateSelect
 *    audience="customer" // or "vendor"
 *    value={selectedStateCode}
 *    onChange={(code) => setSelectedStateCode(code)}
 *    label="Delivery State"
 *    required
 * />
 */
export const OpenStateSelect = ({
  audience = 'customer',
  value,
  onChange,
  label = 'Select State',
  name = 'stateCode',
  required = false,
  disabled = false,
  className = '',
}) => {
  const { states, loading, error, refetch } = useOpenStates(audience);

  return (
    <div className={`space-y-1 ${className}`}>
      {label && (
        <label
          htmlFor={name}
          className="block text-xs font-bold text-slate-700 uppercase tracking-wider"
        >
          {label} {required && <span className="text-rose-500">*</span>}
        </label>
      )}

      {loading ? (
        <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2.5 text-xs text-slate-500">
          <Loader2 className="h-4 w-4 animate-spin text-amber-500" />
          <span>Loading serviceable states...</span>
        </div>
      ) : error ? (
        <div className="flex items-center justify-between rounded-xl border border-rose-200 bg-rose-50 p-2.5 text-xs text-rose-700">
          <div className="flex items-center gap-1.5">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-600" />
            <span>Could not load states.</span>
          </div>
          <button
            type="button"
            onClick={refetch}
            className="text-xs font-bold underline hover:text-rose-900 cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : (
        <select
          id={name}
          name={name}
          value={value || ''}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          disabled={disabled || states.length === 0}
          className="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-900 transition-colors focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500 disabled:bg-slate-100 disabled:text-slate-400"
        >
          <option value="">
            {states.length === 0
              ? `No states currently available for ${audience}s`
              : `-- Select Serviceable State (${states.length} available) --`}
          </option>

          {states.map((st) => (
            <option key={st.stateCode} value={st.stateCode}>
              {st.stateName} ({st.stateCode})
              {st.stateType === 'UNION_TERRITORY' ? ' - UT' : ''}
            </option>
          ))}
        </select>
      )}

      {states.length === 0 && !loading && !error && (
        <p className="text-[11px] text-amber-600">
          No regions are currently open for {audience}s. Please check back soon or contact support.
        </p>
      )}
    </div>
  );
};

export default OpenStateSelect;
