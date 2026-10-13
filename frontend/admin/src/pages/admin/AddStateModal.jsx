import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { X, Plus, AlertCircle, Loader2 } from 'lucide-react';
import { addState } from '../../services/stateApi';
import { getRequestErrorMessage } from '../../services/api';

// ADAPT: Easily modify or add state types here if your business requirements change
export const STATE_TYPE_OPTIONS = [
  { value: 'STATE', label: 'State' },
  { value: 'UNION_TERRITORY', label: 'Union Territory' },
];

export const AddStateModal = ({ isOpen, onClose, onStateAdded }) => {
  const [formData, setFormData] = useState({
    stateCode: '',
    stateName: '',
    stateType: 'STATE',
  });

  const [errors, setErrors] = useState({});
  const [backendError, setBackendError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Reset form when modal opens or closes
  useEffect(() => {
    if (isOpen) {
      setFormData({
        stateCode: '',
        stateName: '',
        stateType: 'STATE',
      });
      setErrors({});
      setBackendError(null);
      setIsSubmitting(false);
    }
  }, [isOpen]);

  // Handle escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen && !isSubmitting) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, isSubmitting, onClose]);

  if (!isOpen) return null;

  // Client-side validation
  const validate = () => {
    const newErrors = {};

    // State Code: Auto-uppercase, 2 to 3 alphabetical letters
    const code = formData.stateCode.trim();
    if (!code) {
      newErrors.stateCode = 'State Code is required (e.g. TS, MH, DL)';
    } else if (!/^[A-Z]{2,3}$/.test(code)) {
      newErrors.stateCode = 'State Code must be 2 to 3 uppercase letters (e.g. TS, DL, J&K -> JK)';
    }

    // State Name: Required, min length 2
    const name = formData.stateName.trim();
    if (!name) {
      newErrors.stateName = 'State Name is required (e.g. Telangana, Maharashtra)';
    } else if (name.length < 2) {
      newErrors.stateName = 'State Name must be at least 2 characters long';
    }

    // State Type: Valid dropdown choice
    if (!formData.stateType) {
      newErrors.stateType = 'Please select a State Type';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleCodeChange = (e) => {
    // Auto-uppercase and sanitize to letters only, max 3 characters
    const sanitized = e.target.value.toUpperCase().replace(/[^A-Z]/g, '').slice(0, 3);
    setFormData((prev) => ({ ...prev, stateCode: sanitized }));
    if (errors.stateCode) setErrors((prev) => ({ ...prev, stateCode: '' }));
    if (backendError) setBackendError(null);
  };

  const handleNameChange = (e) => {
    setFormData((prev) => ({ ...prev, stateName: e.target.value }));
    if (errors.stateName) setErrors((prev) => ({ ...prev, stateName: '' }));
    if (backendError) setBackendError(null);
  };

  const handleTypeChange = (e) => {
    setFormData((prev) => ({ ...prev, stateType: e.target.value }));
    if (backendError) setBackendError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return; // Prevent double-submit

    setBackendError(null);
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const payload = {
        stateCode: formData.stateCode.trim().toUpperCase(),
        stateName: formData.stateName.trim(),
        stateType: formData.stateType,
      };

      const created = await addState(payload);

      toast.success(
        `State "${formData.stateName.trim()} (${formData.stateCode.trim()})" added successfully! Starts in CLOSED status.`
      );

      if (onStateAdded) {
        onStateAdded(created);
      }
      onClose();
    } catch (err) {
      // ADAPT: Extract backend error message (e.g., duplicate code or database validation error)
      const message = getRequestErrorMessage(err, 'Failed to add state');
      setBackendError(message);
      toast.error(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget && !isSubmitting) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="modal-title"
    >
      <div className="w-full max-w-lg rounded-2xl bg-white shadow-2xl border border-slate-200 overflow-hidden font-['Plus_Jakarta_Sans',sans-serif]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4 bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 id="modal-title" className="text-lg font-bold text-slate-900 leading-tight">
                Add New State / Region
              </h2>
              <p className="text-xs text-slate-500">
                Newly created states start CLOSED for both vendors and customers.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Backend Error Alert */}
          {backendError && (
            <div className="flex items-start gap-3 rounded-xl bg-rose-50 p-3.5 text-xs text-rose-700 border border-rose-200">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-rose-600" />
              <div>
                <span className="font-bold">Submission Error: </span>
                <span>{backendError}</span>
              </div>
            </div>
          )}

          {/* State Code */}
          <div>
            <label htmlFor="stateCode" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              State Code <span className="text-rose-500">*</span>
            </label>
            <p className="text-[11px] text-slate-400 mb-1.5">
              2 to 3 letter identifier (auto-uppercased, e.g. TS, MH, DL, KA)
            </p>
            <input
              id="stateCode"
              name="stateCode"
              type="text"
              value={formData.stateCode}
              onChange={handleCodeChange}
              placeholder="e.g. TS"
              maxLength={3}
              disabled={isSubmitting}
              className={`w-full rounded-xl border px-3.5 py-2.5 text-sm font-semibold tracking-wider uppercase transition-colors focus:outline-hidden ${
                errors.stateCode
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />
            {errors.stateCode && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.stateCode}</p>
            )}
          </div>

          {/* State Name */}
          <div>
            <label htmlFor="stateName" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              State / UT Name <span className="text-rose-500">*</span>
            </label>
            <input
              id="stateName"
              name="stateName"
              type="text"
              value={formData.stateName}
              onChange={handleNameChange}
              placeholder="e.g. Telangana, Maharashtra"
              disabled={isSubmitting}
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm font-medium transition-colors focus:outline-hidden ${
                errors.stateName
                  ? 'border-rose-300 bg-rose-50/30 text-rose-900 focus:border-rose-500'
                  : 'border-slate-300 bg-white text-slate-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500'
              }`}
            />
            {errors.stateName && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.stateName}</p>
            )}
          </div>

          {/* State Type */}
          <div>
            <label htmlFor="stateType" className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              State Type <span className="text-rose-500">*</span>
            </label>
            {/* ADAPT: Modify options easily using STATE_TYPE_OPTIONS */}
            <select
              id="stateType"
              name="stateType"
              value={formData.stateType}
              onChange={handleTypeChange}
              disabled={isSubmitting}
              className="mt-1.5 w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-900 transition-colors focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            >
              {STATE_TYPE_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label} ({opt.value})
                </option>
              ))}
            </select>
            {errors.stateType && (
              <p className="mt-1 text-xs text-rose-600 font-medium">{errors.stateType}</p>
            )}
          </div>

          {/* Business Rule Notice */}
          <div className="rounded-xl bg-amber-50/80 p-3 text-xs text-amber-900 border border-amber-200/80">
            <span className="font-bold">Business Rule: </span>
            <span>
              By default, <code className="rounded bg-amber-100 px-1 font-mono font-semibold">isOpenForVendors</code> and{' '}
              <code className="rounded bg-amber-100 px-1 font-mono font-semibold">isOpenForCustomers</code> will be set to{' '}
              <strong>false</strong>. You can activate them whenever you are ready via the table toggles.
            </span>
          </div>

          {/* Actions */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-5 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Adding State...</span>
                </>
              ) : (
                <>
                  <Plus className="h-4 w-4" />
                  <span>Add State</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddStateModal;
