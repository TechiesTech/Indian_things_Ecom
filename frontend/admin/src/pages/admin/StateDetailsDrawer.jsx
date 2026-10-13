import { useEffect, useState } from 'react';
import { X, RefreshCw, AlertCircle, Clock, Calendar, CheckCircle2, XCircle, FileText } from 'lucide-react';
import { getStateDetails } from '../../services/stateApi';
import { getRequestErrorMessage } from '../../services/api';

export const StateDetailsDrawer = ({ isOpen, stateCode, onClose }) => {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchDetails = async (code) => {
    if (!code) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getStateDetails(code);
      setDetails(data);
    } catch (err) {
      setError(getRequestErrorMessage(err, 'Failed to fetch state details'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && stateCode) {
      fetchDetails(stateCode);
    } else {
      setDetails(null);
      setError(null);
    }
  }, [isOpen, stateCode]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const formatDate = (dateStr) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      return new Intl.DateTimeFormat('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      }).format(d);
    } catch {
      return dateStr;
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-hidden bg-slate-950/50 backdrop-blur-xs transition-opacity duration-300 font-['Plus_Jakarta_Sans',sans-serif]"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="drawer-title"
    >
      <div className="fixed inset-y-0 right-0 flex max-w-full pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-300">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4.5 bg-slate-50">
            <div className="flex items-center gap-2.5">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-black text-sm">
                {stateCode}
              </span>
              <div>
                <h2 id="drawer-title" className="text-base font-bold text-slate-900 leading-tight">
                  State Details
                </h2>
                <p className="text-xs text-slate-500">Record verification &amp; operational status</p>
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-200 hover:text-slate-700 transition-colors cursor-pointer"
              aria-label="Close drawer"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20 text-slate-500">
                <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
                <p className="text-sm font-semibold text-slate-700">Loading state record...</p>
                <p className="text-xs text-slate-400 mt-1">Calling /api/states/getStateDetails/{stateCode}</p>
              </div>
            ) : error ? (
              <div className="rounded-xl bg-rose-50 p-5 border border-rose-200 text-center">
                <AlertCircle className="mx-auto h-8 w-8 text-rose-600 mb-2" />
                <h3 className="text-sm font-bold text-rose-900">Failed to Load Details</h3>
                <p className="mt-1 text-xs text-rose-700">{error}</p>
                <button
                  type="button"
                  onClick={() => fetchDetails(stateCode)}
                  className="mt-4 inline-flex items-center gap-2 rounded-lg bg-rose-600 px-3.5 py-1.5 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry
                </button>
              </div>
            ) : details ? (
              <>
                {/* Hero Card */}
                <div className="rounded-2xl bg-gradient-to-br from-slate-900 to-slate-800 p-5 text-white shadow-sm">
                  <div className="flex items-center justify-between">
                    <span className="rounded-md bg-amber-400 px-2 py-0.5 text-xs font-black text-slate-950 uppercase tracking-widest">
                      {details.stateCode || stateCode}
                    </span>
                    <span className="rounded-full bg-slate-700/80 px-2.5 py-0.5 text-[11px] font-semibold text-amber-300">
                      {details.stateType || 'STATE'}
                    </span>
                  </div>
                  <h3 className="mt-3 text-2xl font-black text-white">{details.stateName}</h3>
                  <p className="text-xs text-slate-300 mt-0.5">
                    Internal Identifier: <code className="text-amber-300">{details._id || 'N/A'}</code>
                  </p>
                </div>

                {/* Operations & Access Matrix */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Operational Availability
                  </h4>
                  <div className="grid grid-cols-2 gap-3">
                    {/* Vendors Access */}
                    <div
                      className={`rounded-xl p-3.5 border ${
                        details.isOpenForVendors
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {details.isOpenForVendors ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-800">Vendors</span>
                      </div>
                      <p
                        className={`mt-1.5 text-sm font-bold ${
                          details.isOpenForVendors ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {details.isOpenForVendors ? 'OPEN (Active)' : 'CLOSED'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {details.isOpenForVendors
                          ? 'Suppliers in this state can onboard & list products.'
                          : 'Registration & listing restricted.'}
                      </p>
                    </div>

                    {/* Customers Access */}
                    <div
                      className={`rounded-xl p-3.5 border ${
                        details.isOpenForCustomers
                          ? 'border-emerald-200 bg-emerald-50/50'
                          : 'border-slate-200 bg-slate-50/70'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        {details.isOpenForCustomers ? (
                          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-slate-400" />
                        )}
                        <span className="text-xs font-bold text-slate-800">Customers</span>
                      </div>
                      <p
                        className={`mt-1.5 text-sm font-bold ${
                          details.isOpenForCustomers ? 'text-emerald-700' : 'text-slate-500'
                        }`}
                      >
                        {details.isOpenForCustomers ? 'OPEN (Active)' : 'CLOSED'}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {details.isOpenForCustomers
                          ? 'Shoppers can select this state during checkout.'
                          : 'Delivery & browsing hidden.'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Audit & Timestamps */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    Audit Information
                  </h4>
                  <div className="rounded-xl border border-slate-200 bg-white divide-y divide-slate-100">
                    <div className="flex items-center justify-between p-3.5 text-xs">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Calendar className="h-3.5 w-3.5 text-slate-400" />
                        Created At
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(details.createdAt)}
                      </span>
                    </div>

                    <div className="flex items-center justify-between p-3.5 text-xs">
                      <span className="flex items-center gap-2 text-slate-500">
                        <Clock className="h-3.5 w-3.5 text-slate-400" />
                        Last Updated
                      </span>
                      <span className="font-semibold text-slate-800">
                        {formatDate(details.updatedAt)}
                      </span>
                    </div>

                    {details.__v !== undefined && (
                      <div className="flex items-center justify-between p-3.5 text-xs">
                        <span className="text-slate-500">Document Version</span>
                        <span className="font-mono text-slate-800">v{details.__v}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Raw API Payload (Developer / Admin Transparency) */}
                <details className="rounded-xl border border-slate-200 bg-slate-50 p-3.5 text-xs">
                  <summary className="font-semibold text-slate-700 cursor-pointer flex items-center gap-1.5">
                    <FileText className="h-3.5 w-3.5 text-slate-500" />
                    View Raw Server Record
                  </summary>
                  <pre className="mt-2.5 overflow-x-auto rounded-lg bg-slate-900 p-3 font-mono text-[11px] text-emerald-400">
                    {JSON.stringify(details, null, 2)}
                  </pre>
                </details>
              </>
            ) : null}
          </div>

          {/* Footer */}
          <div className="border-t border-slate-200 p-4 bg-slate-50 flex items-center justify-between">
            <button
              type="button"
              onClick={() => fetchDetails(stateCode)}
              disabled={loading}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-600 hover:text-slate-900 transition-colors disabled:opacity-50 cursor-pointer"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
              Refresh Details
            </button>
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl bg-slate-900 px-4 py-2 text-xs font-bold text-white hover:bg-slate-800 transition-colors cursor-pointer"
            >
              Close Drawer
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default StateDetailsDrawer;
