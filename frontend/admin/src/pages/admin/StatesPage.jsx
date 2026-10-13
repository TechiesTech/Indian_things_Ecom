import { useState, useEffect, useMemo, useCallback } from 'react';
import toast from 'react-hot-toast';
import {
  MapPin,
  Plus,
  Search,
  Filter,
  RefreshCw,
  AlertCircle,
  Eye,
  Trash2,
  HelpCircle,
  ShieldAlert,
  Loader2,
  Lock,
} from 'lucide-react';
import { getAllStates, updateState, deleteState } from '../../services/stateApi';
import { getRequestErrorMessage } from '../../services/api';
import AddStateModal from './AddStateModal';
import StateDetailsDrawer from './StateDetailsDrawer';
import AdminNavbar from '../../components/AdminNavbar';

export const StatesPage = () => {
  const [states, setStates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search and Filter controls
  const [searchQuery, setSearchQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('ALL');

  // Async tracking for optimistic toggle updates
  // Structure: { "TS_isOpenForVendors": true, ... }
  const [updatingKeys, setUpdatingKeys] = useState({});

  // Modals and Drawers state
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewingStateCode, setViewingStateCode] = useState(null);

  // Delete Confirmation Dialog state
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteErrorData, setDeleteErrorData] = useState(null);

  // Fetch states list
  const fetchStatesList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getAllStates();
      setStates(Array.isArray(data) ? data : []);
    } catch (err) {
      const msg = getRequestErrorMessage(err, 'Failed to load states from server');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStatesList();
  }, [fetchStatesList]);

  // Optimistic Toggle Handler
  const handleToggle = async (stateItem, field) => {
    const { stateCode, stateName } = stateItem;
    const updateKey = `${stateCode}_${field}`;

    // Prevent double clicking / concurrent updates on the same toggle
    if (updatingKeys[updateKey]) return;

    const previousValue = Boolean(stateItem[field]);
    const nextValue = !previousValue;
    const label = field === 'isOpenForVendors' ? 'Vendors' : 'Customers';

    // 1. Snapshot previous state for rollback
    const previousStates = [...states];

    // 2. Optimistic Update in UI
    setStates((current) =>
      current.map((item) =>
        item.stateCode === stateCode ? { ...item, [field]: nextValue } : item
      )
    );

    // 3. Mark toggle as busy
    setUpdatingKeys((prev) => ({ ...prev, [updateKey]: true }));

    try {
      // 4. Send ONLY the changed field in the PATCH request
      const payload = { [field]: nextValue };
      await updateState(stateCode, payload);

      toast.success(
        `${stateName} (${stateCode}) is now ${nextValue ? 'OPEN' : 'CLOSED'} for ${label}`,
        { id: updateKey }
      );
    } catch (err) {
      // 5. Rollback on failure
      setStates(previousStates);
      const errorMsg = getRequestErrorMessage(
        err,
        `Failed to update ${label.toLowerCase()} status for ${stateName}`
      );
      toast.error(errorMsg, { id: updateKey });
    } finally {
      // 6. Release busy indicator
      setUpdatingKeys((prev) => {
        const next = { ...prev };
        delete next[updateKey];
        return next;
      });
    }
  };

  // Open Delete Confirmation
  const openDeleteDialog = (stateItem) => {
    setDeleteTarget(stateItem);
    setDeleteErrorData(null);
    setIsDeleting(false);
  };

  const closeDeleteDialog = () => {
    if (!isDeleting) {
      setDeleteTarget(null);
      setDeleteErrorData(null);
    }
  };

  // Confirm Delete Handler
  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setDeleteErrorData(null);
    const { stateCode, stateName } = deleteTarget;

    try {
      await deleteState(stateCode);
      toast.success(`State "${stateName} (${stateCode})" has been deleted`);
      // Update local state
      setStates((prev) => prev.filter((item) => item.stateCode !== stateCode));
      setDeleteTarget(null);
    } catch (err) {
      const serverMessage = getRequestErrorMessage(
        err,
        `Cannot delete ${stateName} (${stateCode})`
      );

      // Record error for display and suggest closing the state instead
      setDeleteErrorData({
        message: serverMessage,
        suggestClose: true,
      });
      toast.error(serverMessage);
    } finally {
      setIsDeleting(false);
    }
  };

  // Alternative Action: Close State to Vendors & Customers instead of deleting
  const handleCloseStateInstead = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    const { stateCode, stateName } = deleteTarget;

    try {
      // Send updates to close both
      await updateState(stateCode, {
        isOpenForVendors: false,
        isOpenForCustomers: false,
      });

      // Update local state
      setStates((prev) =>
        prev.map((item) =>
          item.stateCode === stateCode
            ? { ...item, isOpenForVendors: false, isOpenForCustomers: false }
            : item
        )
      );

      toast.success(
        `State "${stateName}" successfully closed for both Vendors and Customers.`
      );
      setDeleteTarget(null);
      setDeleteErrorData(null);
    } catch (err) {
      const msg = getRequestErrorMessage(err, 'Failed to close state');
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Filtering & Search
  const filteredStates = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return states.filter((item) => {
      const matchesSearch =
        !q ||
        (item.stateName && item.stateName.toLowerCase().includes(q)) ||
        (item.stateCode && item.stateCode.toLowerCase().includes(q));

      const matchesType =
        typeFilter === 'ALL' || item.stateType === typeFilter;

      return matchesSearch && matchesType;
    });
  }, [states, searchQuery, typeFilter]);

  // Summary Metrics
  const metrics = useMemo(() => {
    const total = states.length;
    const vendorOpen = states.filter((s) => s.isOpenForVendors).length;
    const customerOpen = states.filter((s) => s.isOpenForCustomers).length;
    const unionTerritories = states.filter((s) => s.stateType === 'UNION_TERRITORY').length;
    return { total, vendorOpen, customerOpen, unionTerritories };
  }, [states]);

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Top Navigation */}
      <AdminNavbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        {/* Header & Primary Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
                <MapPin className="h-5 w-5" />
              </span>
              <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                State &amp; Territory Management
              </h1>
            </div>
            <p className="mt-1 text-xs text-slate-500 max-w-2xl">
              Control regional availability across India. New states start CLOSED by default. Changes immediately govern vendor onboarding and customer checkouts.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              type="button"
              onClick={fetchStatesList}
              disabled={loading}
              className="flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors shadow-xs cursor-pointer disabled:opacity-50"
              title="Refresh States from Server"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>

            <button
              type="button"
              onClick={() => setIsAddModalOpen(true)}
              className="flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
            >
              <Plus className="h-4 w-4" />
              <span>Add State</span>
            </button>
          </div>
        </div>

        {/* Overview Metrics Cards */}
        <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3.5">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Total Configured
            </p>
            <p className="mt-1 text-2xl font-black text-slate-900">{metrics.total}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">States &amp; UTs</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Open for Vendors
            </p>
            <p className="mt-1 text-2xl font-black text-emerald-600">{metrics.vendorOpen}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active for Seller Signups</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Open for Customers
            </p>
            <p className="mt-1 text-2xl font-black text-indigo-600">{metrics.customerOpen}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Active in Checkout Flow</p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Union Territories
            </p>
            <p className="mt-1 text-2xl font-black text-amber-600">{metrics.unionTerritories}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Special Administrations</p>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-xs">
          {/* Search Box */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by state name or 2-letter code (e.g. Telangana, TS)..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/70 pl-10 pr-4 py-2 text-xs font-medium text-slate-900 placeholder-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500"
            />
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-500">
              <Filter className="h-3.5 w-3.5" />
              <span>Type:</span>
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-800 focus:border-amber-500 focus:outline-hidden focus:ring-1 focus:ring-amber-500 cursor-pointer"
            >
              <option value="ALL">All Types ({states.length})</option>
              <option value="STATE">States only</option>
              <option value="UNION_TERRITORY">Union Territories</option>
            </select>

            {(searchQuery || typeFilter !== 'ALL') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setTypeFilter('ALL');
                }}
                className="text-xs font-bold text-amber-600 hover:text-amber-700 underline px-2 py-1 cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>

        {/* Main Content Area */}
        <div className="mt-4 rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
          {/* Loading State */}
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-slate-500">
              <RefreshCw className="h-8 w-8 animate-spin text-amber-500 mb-3" />
              <p className="text-sm font-bold text-slate-800">Loading States Repository...</p>
              <p className="text-xs text-slate-400 mt-1">
                Synchronizing with /api/states/getAllStates
              </p>
            </div>
          ) : error ? (
            /* Error State with Retry */
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-200 mb-4">
                <AlertCircle className="h-7 w-7" />
              </div>
              <h2 className="text-base font-bold text-slate-900">Failed to Load States</h2>
              <p className="mt-1 text-xs text-rose-600 max-w-md mx-auto">{error}</p>
              <button
                type="button"
                onClick={fetchStatesList}
                className="mt-5 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
              >
                <RefreshCw className="h-4 w-4" />
                Retry Connection
              </button>
            </div>
          ) : filteredStates.length === 0 ? (
            /* Empty State */
            <div className="p-12 text-center">
              <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-slate-100 text-slate-400 mb-3">
                <MapPin className="h-7 w-7" />
              </div>
              <h2 className="text-base font-bold text-slate-900">
                {states.length === 0 ? 'No States Configured Yet' : 'No Matching States Found'}
              </h2>
              <p className="mt-1 text-xs text-slate-500 max-w-sm mx-auto">
                {states.length === 0
                  ? 'Your database currently has zero state records. Click below to add the first state.'
                  : `No states matched query "${searchQuery}". Try adjusting your filters.`}
              </p>
              {states.length === 0 ? (
                <button
                  type="button"
                  onClick={() => setIsAddModalOpen(true)}
                  className="mt-4 inline-flex items-center gap-2 rounded-xl bg-amber-400 px-4 py-2 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
                >
                  <Plus className="h-4 w-4" />
                  Add First State
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => {
                    setSearchQuery('');
                    setTypeFilter('ALL');
                  }}
                  className="mt-4 text-xs font-bold text-amber-600 hover:underline cursor-pointer"
                >
                  Clear Filters
                </button>
              )}
            </div>
          ) : (
            /* States Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                    <th scope="col" className="px-5 py-3.5 w-20">Code</th>
                    <th scope="col" className="px-5 py-3.5">Name</th>
                    <th scope="col" className="px-5 py-3.5">Type</th>
                    <th scope="col" className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span>Open for Vendors</span>
                        <span title="Suppliers can register and operate in this state">
                          <HelpCircle className="h-3 w-3 text-slate-400" />
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-center">
                      <div className="inline-flex items-center gap-1">
                        <span>Open for Customers</span>
                        <span title="Shoppers can select this state during checkout">
                          <HelpCircle className="h-3 w-3 text-slate-400" />
                        </span>
                      </div>
                    </th>
                    <th scope="col" className="px-5 py-3.5 text-right w-28">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredStates.map((item) => {
                    const vendorBusy = Boolean(updatingKeys[`${item.stateCode}_isOpenForVendors`]);
                    const customerBusy = Boolean(updatingKeys[`${item.stateCode}_isOpenForCustomers`]);

                    return (
                      <tr
                        key={item.stateCode || item._id}
                        className="hover:bg-slate-50/80 transition-colors group"
                      >
                        {/* State Code */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-mono font-black text-amber-400 shadow-2xs">
                            {item.stateCode}
                          </span>
                        </td>

                        {/* State Name */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <div className="font-bold text-slate-900 text-sm">{item.stateName}</div>
                          {item._id && (
                            <div className="text-[10px] text-slate-400 font-mono">
                              ID: {item._id}
                            </div>
                          )}
                        </td>

                        {/* State Type */}
                        <td className="px-5 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                              item.stateType === 'UNION_TERRITORY'
                                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                                : 'bg-slate-100 text-slate-700 border border-slate-200'
                            }`}
                          >
                            {item.stateType === 'UNION_TERRITORY' ? 'Union Territory' : 'State'}
                          </span>
                        </td>

                        {/* Open for Vendors (Optimistic Toggle) */}
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(item.isOpenForVendors)}
                              disabled={vendorBusy}
                              onClick={() => handleToggle(item, 'isOpenForVendors')}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 ${
                                item.isOpenForVendors ? 'bg-emerald-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  item.isOpenForVendors ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold ${
                                vendorBusy
                                  ? 'text-amber-600 animate-pulse'
                                  : item.isOpenForVendors
                                  ? 'text-emerald-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {vendorBusy ? 'Saving...' : item.isOpenForVendors ? 'Active' : 'Closed'}
                            </span>
                          </div>
                        </td>

                        {/* Open for Customers (Optimistic Toggle) */}
                        <td className="px-5 py-4 whitespace-nowrap text-center">
                          <div className="inline-flex flex-col items-center gap-1">
                            <button
                              type="button"
                              role="switch"
                              aria-checked={Boolean(item.isOpenForCustomers)}
                              disabled={customerBusy}
                              onClick={() => handleToggle(item, 'isOpenForCustomers')}
                              className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 ${
                                item.isOpenForCustomers ? 'bg-indigo-600' : 'bg-slate-300'
                              }`}
                            >
                              <span
                                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                  item.isOpenForCustomers ? 'translate-x-5' : 'translate-x-0'
                                }`}
                              />
                            </button>
                            <span
                              className={`text-[10px] font-bold ${
                                customerBusy
                                  ? 'text-amber-600 animate-pulse'
                                  : item.isOpenForCustomers
                                  ? 'text-indigo-700'
                                  : 'text-slate-400'
                              }`}
                            >
                              {customerBusy ? 'Saving...' : item.isOpenForCustomers ? 'Active' : 'Closed'}
                            </span>
                          </div>
                        </td>

                        {/* Actions (View, Delete) */}
                        <td className="px-5 py-4 whitespace-nowrap text-right">
                          <div className="inline-flex items-center gap-1">
                            <button
                              type="button"
                              onClick={() => setViewingStateCode(item.stateCode)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                              title="View full record and audit logs"
                            >
                              <Eye className="h-4 w-4" />
                            </button>

                            <button
                              type="button"
                              onClick={() => openDeleteDialog(item)}
                              className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                              title="Delete State Record"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Table Footer / Counter */}
          {!loading && !error && filteredStates.length > 0 && (
            <div className="border-t border-slate-200 bg-slate-50 px-5 py-3 flex items-center justify-between text-xs text-slate-500">
              <span>
                Showing <strong>{filteredStates.length}</strong> of <strong>{states.length}</strong> states
              </span>
              <span className="text-[11px] text-slate-400">
                Toggles update in real-time with rollback protection
              </span>
            </div>
          )}
        </div>
      </main>

      {/* Add State Modal */}
      <AddStateModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onStateAdded={(newState) => {
          // If newState returned by backend, insert it; otherwise refresh list
          if (newState && newState.stateCode) {
            setStates((prev) => [newState, ...prev]);
          } else {
            fetchStatesList();
          }
        }}
      />

      {/* State Details Drawer */}
      <StateDetailsDrawer
        isOpen={Boolean(viewingStateCode)}
        stateCode={viewingStateCode}
        onClose={() => setViewingStateCode(null)}
      />

      {/* Delete Confirmation Dialog */}
      {deleteTarget && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-in fade-in duration-200"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-dialog-title"
        >
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 font-['Plus_Jakarta_Sans',sans-serif]">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-rose-100 text-rose-600 mb-4">
              <ShieldAlert className="h-6 w-6" />
            </div>

            <h3 id="delete-dialog-title" className="text-lg font-bold text-slate-900">
              Delete State &ldquo;{deleteTarget.stateName}&rdquo;?
            </h3>
            <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
              Are you sure you want to permanently delete{' '}
              <strong className="text-slate-900">{deleteTarget.stateName} ({deleteTarget.stateCode})</strong>?
              This action cannot be undone.
            </p>

            {/* Error Message & Suggest Closing Instead */}
            {deleteErrorData && (
              <div className="mt-4 rounded-xl bg-amber-50 p-4 border border-amber-200 text-xs space-y-2">
                <div className="flex items-start gap-2 text-rose-700 font-bold">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
                  <span>{deleteErrorData.message}</span>
                </div>
                <p className="text-slate-700 leading-relaxed">
                  <strong>Recommendation:</strong> If this state has existing vendors, orders, or registered customers,
                  the database may prevent deletion to protect data integrity. You can close the state instead to immediately
                  stop new vendor signups and customer orders.
                </p>
                <button
                  type="button"
                  onClick={handleCloseStateInstead}
                  disabled={isDeleting}
                  className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg bg-amber-500 px-3.5 py-2 text-xs font-bold text-slate-950 hover:bg-amber-600 transition-colors shadow-xs cursor-pointer"
                >
                  <Lock className="h-3.5 w-3.5" />
                  Close State for Vendors &amp; Customers Instead
                </button>
              </div>
            )}

            {/* Dialog Actions */}
            <div className="mt-6 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={closeDeleteDialog}
                disabled={isDeleting}
                className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="flex items-center gap-1.5 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-sm cursor-pointer disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="h-3.5 w-3.5" />
                    <span>Confirm Delete</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StatesPage;
