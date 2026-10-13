import { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  ArrowLeft,
  MapPin,
  Building,
  Plus,
  Check,
  X,
  Edit2,
  Trash2,
  AlertCircle,
  RefreshCw,
  Loader2,
  ShieldAlert,
  Search,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from 'lucide-react';
import {
  getStateDetails,
  addDistricts,
  updateDistrict,
  deleteDistrict,
} from '../../services/stateApi';
import { getRequestErrorMessage } from '../../services/api';
import AdminNavbar from '../../components/AdminNavbar';

/**
 * Normalizes raw district data from the backend into a standard object shape:
 * { id: string, districtName: string, isActive: boolean }
 *
 * // ADAPT:
 * - If your backend returns districts as an array of strings: ["Adilabad", "Karimnagar"]
 * - If your backend returns an array of objects: [{ districtName: "Adilabad", isActive: true }]
 * - If your backend uses different key names (e.g., name, status, enabled, _id)
 */
const normalizeDistricts = (rawList) => {
  if (!Array.isArray(rawList)) return [];

  return rawList
    .map((item, index) => {
      if (typeof item === 'string') {
        return {
          id: `${item}_${index}`,
          districtName: item.trim(),
          isActive: true, // Default to true if simple string array
        };
      }

      if (item && typeof item === 'object') {
        const name = item.districtName || item.name || '';
        return {
          id: item._id || item.id || `${name}_${index}`,
          districtName: String(name).trim(),
          isActive: item.isActive !== undefined ? Boolean(item.isActive) : true,
        };
      }

      return null;
    })
    .filter((d) => d && Boolean(d.districtName));
};

export const StateDetailsPage = () => {
  const { stateCode } = useParams();

  // State record & districts
  const [stateData, setStateData] = useState(null);
  const [districts, setDistricts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Search filter for districts table
  const [districtSearch, setDistrictSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');

  // Bulk add districts form
  const [rawInput, setRawInput] = useState('');
  const [isAddingDistricts, setIsAddingDistricts] = useState(false);

  // Optimistic toggle busy tracking: { [districtName]: true }
  const [updatingToggles, setUpdatingToggles] = useState({});

  // Inline rename state
  const [editingDistrict, setEditingDistrict] = useState(null); // districtName being edited
  const [renameValue, setRenameValue] = useState('');
  const [isRenaming, setIsRenaming] = useState(false);

  // Delete confirmation dialog state
  const [deleteTarget, setDeleteTarget] = useState(null); // district object
  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteBackendError, setDeleteBackendError] = useState(null);

  /**
   * Load state details from backend
   */
  const loadStateDetails = useCallback(async () => {
    if (!stateCode) return;
    setLoading(true);
    setError(null);

    try {
      const data = await getStateDetails(stateCode);
      setStateData(data || null);

      // ADAPT: If districts are located under a specific property (e.g. data.districts, data.districtList)
      const rawDistricts =
        data?.districts ||
        data?.districtList ||
        (Array.isArray(data) ? data : []);

      setDistricts(normalizeDistricts(rawDistricts));
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, 'Failed to fetch state and district details.');
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, [stateCode]);

  useEffect(() => {
    loadStateDetails();
  }, [loadStateDetails]);

  /**
   * ADD FORM SUBMIT
   * Parses comma- or newline-separated district names, trims, removes empties,
   * dedupes case-insensitively, skips existing names, and sends one array.
   */
  const handleAddDistricts = async (e) => {
    e.preventDefault();
    if (!rawInput.trim() || isAddingDistricts) return;

    // 1. Split on commas and newlines
    const rawTokens = rawInput
      .split(/[\n,]+/)
      .map((n) => n.trim())
      .filter(Boolean);

    if (rawTokens.length === 0) {
      toast.error('Please enter at least one valid district name.');
      return;
    }

    // 2. Dedupe within entered input (case-insensitive)
    const seenEntered = new Set();
    const uniqueEntered = [];
    for (const token of rawTokens) {
      const lower = token.toLowerCase();
      if (!seenEntered.has(lower)) {
        seenEntered.add(lower);
        uniqueEntered.push(token);
      }
    }

    // 3. Skip names that already exist in this state (case-insensitive)
    const existingNamesSet = new Set(
      districts.map((d) => d.districtName.toLowerCase().trim())
    );

    const namesToAdd = uniqueEntered.filter(
      (name) => !existingNamesSet.has(name.toLowerCase())
    );

    const alreadyExistingCount = uniqueEntered.length - namesToAdd.length;

    // 4. Validate if all already exist
    if (namesToAdd.length === 0) {
      toast.error(
        alreadyExistingCount === 1
          ? `The district "${uniqueEntered[0]}" already exists in this state.`
          : `All ${alreadyExistingCount} entered districts already exist in this state.`
      );
      return;
    }

    setIsAddingDistricts(true);
    try {
      // Send single array of clean district names
      await addDistricts(stateCode, namesToAdd);

      const addedMsg =
        alreadyExistingCount > 0
          ? `Added ${namesToAdd.length} district(s). (${alreadyExistingCount} already existed and was skipped)`
          : `Successfully added ${namesToAdd.length} district(s).`;

      toast.success(addedMsg);
      setRawInput('');
      await loadStateDetails();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, 'Failed to add districts.');
      toast.error(msg);
    } finally {
      setIsAddingDistricts(false);
    }
  };

  /**
   * OPTIMISTIC ACTIVE TOGGLE
   * Sends ONLY { isActive }, disabled in flight, rolls back on error.
   */
  const handleToggleActive = async (districtItem) => {
    const { districtName, isActive } = districtItem;

    // Prevent concurrent updates
    if (updatingToggles[districtName]) return;

    const nextActive = !isActive;
    const previousDistricts = [...districts];

    // Optimistic UI update
    setDistricts((current) =>
      current.map((item) =>
        item.districtName.toLowerCase() === districtName.toLowerCase()
          ? { ...item, isActive: nextActive }
        : item
      )
    );
    setUpdatingToggles((prev) => ({ ...prev, [districtName]: true }));

    try {
      // Send only { isActive }
      await updateDistrict(stateCode, districtName, { isActive: nextActive });
      toast.success(
        `"${districtName}" is now ${nextActive ? 'Active' : 'Deactivated'}`
      );
    } catch (err) {
      // Roll back on failure
      setDistricts(previousDistricts);
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, `Failed to update status for "${districtName}".`);
      toast.error(msg);
    } finally {
      setUpdatingToggles((prev) => {
        const next = { ...prev };
        delete next[districtName];
        return next;
      });
    }
  };

  /**
   * INLINE RENAME HANDLERS
   */
  const startRenaming = (districtItem) => {
    setEditingDistrict(districtItem.districtName);
    setRenameValue(districtItem.districtName);
  };

  const cancelRenaming = () => {
    setEditingDistrict(null);
    setRenameValue('');
  };

  const submitRename = async () => {
    if (!editingDistrict || isRenaming) return;

    const trimmedNew = renameValue.trim();
    if (!trimmedNew) {
      toast.error('District name cannot be empty.');
      return;
    }

    // If unchanged, simply exit edit mode
    if (trimmedNew === editingDistrict) {
      cancelRenaming();
      return;
    }

    // Check case-insensitive duplicate against OTHER districts
    const isDuplicate = districts.some(
      (d) =>
        d.districtName.toLowerCase() !== editingDistrict.toLowerCase() &&
        d.districtName.toLowerCase() === trimmedNew.toLowerCase()
    );

    if (isDuplicate) {
      toast.error(`A district named "${trimmedNew}" already exists in this state.`);
      return;
    }

    setIsRenaming(true);
    try {
      // Send only { newDistrictName }
      await updateDistrict(stateCode, editingDistrict, {
        newDistrictName: trimmedNew,
      });

      toast.success(`Renamed "${editingDistrict}" to "${trimmedNew}".`);
      cancelRenaming();
      await loadStateDetails();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, 'Failed to rename district.');
      toast.error(msg);
    } finally {
      setIsRenaming(false);
    }
  };

  const handleRenameKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      submitRename();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      cancelRenaming();
    }
  };

  /**
   * DELETE CONFIRMATION HANDLERS
   */
  const openDeleteModal = (districtItem) => {
    setDeleteTarget(districtItem);
    setDeleteBackendError(null);
  };

  const closeDeleteModal = () => {
    setDeleteTarget(null);
    setDeleteBackendError(null);
    setIsDeleting(false);
  };

  const handleConfirmDelete = async () => {
    if (!deleteTarget || isDeleting) return;

    setIsDeleting(true);
    setDeleteBackendError(null);

    try {
      await deleteDistrict(stateCode, deleteTarget.districtName);
      toast.success(`District "${deleteTarget.districtName}" deleted successfully.`);
      closeDeleteModal();
      await loadStateDetails();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, `Failed to delete "${deleteTarget.districtName}".`);
      setDeleteBackendError(msg);
      toast.error(msg);
    } finally {
      setIsDeleting(false);
    }
  };

  // Quick fallback: deactivate district instead of deleting if delete fails or requested
  const handleDeactivateInstead = async () => {
    if (!deleteTarget) return;
    try {
      await updateDistrict(stateCode, deleteTarget.districtName, { isActive: false });
      toast.success(
        `"${deleteTarget.districtName}" has been deactivated instead of deleted.`
      );
      closeDeleteModal();
      await loadStateDetails();
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        getRequestErrorMessage(err, 'Failed to deactivate district.');
      toast.error(msg);
    }
  };

  // Filtered districts list for the table
  const filteredDistricts = useMemo(() => {
    return districts.filter((item) => {
      const matchesSearch = item.districtName
        .toLowerCase()
        .includes(districtSearch.toLowerCase().trim());

      const matchesStatus =
        statusFilter === 'ALL' ||
        (statusFilter === 'ACTIVE' && item.isActive) ||
        (statusFilter === 'INACTIVE' && !item.isActive);

      return matchesSearch && matchesStatus;
    });
  }, [districts, districtSearch, statusFilter]);

  const activeCount = useMemo(
    () => districts.filter((d) => d.isActive).length,
    [districts]
  );

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <AdminNavbar />

      <main className="mx-auto max-w-6xl px-6 py-8">
        {/* Navigation Breadcrumb / Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            to="/admin/states"
            className="inline-flex items-center gap-2 rounded-xl bg-white px-4 py-2.5 text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to States</span>
          </Link>

          <button
            type="button"
            onClick={loadStateDetails}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl bg-white px-3.5 py-2 text-xs font-bold text-slate-700 shadow-2xs border border-slate-200 hover:bg-slate-50 transition-colors disabled:opacity-60 cursor-pointer"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* LOADING STATE */}
        {loading && !stateData && (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-slate-200 bg-white p-16 shadow-xs text-center">
            <Loader2 className="h-10 w-10 animate-spin text-amber-500" />
            <h3 className="mt-4 text-base font-bold text-slate-900">
              Loading State & District Details...
            </h3>
            <p className="mt-1 text-xs text-slate-500">
              Fetching records for code <span className="font-mono font-bold text-slate-700">{stateCode}</span>
            </p>
          </div>
        )}

        {/* ERROR STATE WITH RETRY */}
        {error && !stateData && (
          <div className="rounded-2xl border border-rose-200 bg-rose-50/60 p-8 shadow-xs">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <AlertCircle className="h-6 w-6" />
              </div>
              <div className="flex-1">
                <h3 className="text-base font-bold text-rose-950">
                  Failed to Load State Details
                </h3>
                <p className="mt-1 text-xs text-rose-700 leading-relaxed">{error}</p>
                <div className="mt-4 flex gap-3">
                  <button
                    type="button"
                    onClick={loadStateDetails}
                    className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors cursor-pointer"
                  >
                    <RefreshCw className="h-3.5 w-3.5" />
                    <span>Retry Loading</span>
                  </button>
                  <Link
                    to="/admin/states"
                    className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors"
                  >
                    Return to States Directory
                  </Link>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* MAIN CONTENT AREA */}
        {stateData && (
          <div className="space-y-6">
            {/* State Header Card */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-bold shadow-xs">
                    <MapPin className="h-6 w-6" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2.5 flex-wrap">
                      <h1 className="text-2xl font-black text-slate-900 tracking-tight">
                        {stateData.stateName || 'State Name'}
                      </h1>
                      <span className="inline-flex items-center justify-center rounded-lg bg-slate-900 px-2.5 py-1 text-xs font-mono font-black text-amber-400 shadow-2xs">
                        {stateData.stateCode || stateCode}
                      </span>
                      <span
                        className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${
                          stateData.stateType === 'UNION_TERRITORY'
                            ? 'bg-amber-100 text-amber-800 border border-amber-200'
                            : 'bg-slate-100 text-slate-700 border border-slate-200'
                        }`}
                      >
                        {stateData.stateType === 'UNION_TERRITORY' ? 'Union Territory' : 'State'}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-slate-500">
                      Manage districts, operational availability toggles, and municipal records.
                    </p>
                  </div>
                </div>

                {/* State Operational Status Indicators */}
                <div className="flex items-center gap-3">
                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Vendor Access
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        stateData.isOpenForVendors ? 'text-emerald-700' : 'text-slate-400'
                      }`}
                    >
                      {stateData.isOpenForVendors ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {stateData.isOpenForVendors ? 'Open' : 'Closed'}
                    </span>
                  </div>

                  <div className="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-center">
                    <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400">
                      Customer Access
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-xs font-bold ${
                        stateData.isOpenForCustomers ? 'text-indigo-700' : 'text-slate-400'
                      }`}
                    >
                      {stateData.isOpenForCustomers ? (
                        <CheckCircle2 className="h-3.5 w-3.5 text-indigo-600" />
                      ) : (
                        <XCircle className="h-3.5 w-3.5 text-slate-400" />
                      )}
                      {stateData.isOpenForCustomers ? 'Open' : 'Closed'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Districts Metric Bar */}
              <div className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3 border-t border-slate-100 pt-5">
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Total Districts
                  </span>
                  <div className="mt-0.5 text-lg font-black text-slate-900 font-mono">
                    {districts.length}
                  </div>
                </div>
                <div className="rounded-xl bg-emerald-50/60 p-3 border border-emerald-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800">
                    Active Districts
                  </span>
                  <div className="mt-0.5 text-lg font-black text-emerald-700 font-mono">
                    {activeCount}
                  </div>
                </div>
                <div className="rounded-xl bg-slate-50 p-3 border border-slate-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Inactive Districts
                  </span>
                  <div className="mt-0.5 text-lg font-black text-slate-600 font-mono">
                    {districts.length - activeCount}
                  </div>
                </div>
                <div className="rounded-xl bg-amber-50/60 p-3 border border-amber-200">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-amber-800">
                    Serviceable Availability
                  </span>
                  <div className="mt-0.5 text-lg font-black text-amber-900 font-mono">
                    {districts.length > 0
                      ? `${Math.round((activeCount / districts.length) * 100)}%`
                      : '0%'}
                  </div>
                </div>
              </div>
            </div>

            {/* ADD DISTRICTS CARD */}
            <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-xs">
              <div className="flex items-center gap-2.5 pb-4 border-b border-slate-100">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-amber-800">
                  <Plus className="h-4 w-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-slate-900">
                    Add Districts to {stateData.stateName}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Enter one or multiple district names separated by commas or line breaks.
                  </p>
                </div>
              </div>

              <form onSubmit={handleAddDistricts} className="mt-4 space-y-4">
                <div>
                  <label
                    htmlFor="district-textarea"
                    className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-1.5"
                  >
                    District Names
                  </label>
                  <textarea
                    id="district-textarea"
                    rows={3}
                    value={rawInput}
                    onChange={(e) => setRawInput(e.target.value)}
                    placeholder="e.g. Adilabad, Karimnagar, Warangal, Khammam&#10;Or paste one district per line"
                    disabled={isAddingDistricts}
                    className="w-full rounded-xl border border-slate-300 bg-slate-50/50 p-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                  />
                  <div className="mt-1.5 flex items-center justify-between text-[11px] text-slate-500">
                    <span>
                      Separators: commas (<code className="font-mono text-slate-700">,</code>) or new lines. Existing names will be automatically skipped.
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3">
                  {rawInput && (
                    <button
                      type="button"
                      onClick={() => setRawInput('')}
                      disabled={isAddingDistricts}
                      className="rounded-xl px-3 py-2 text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                    >
                      Clear
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!rawInput.trim() || isAddingDistricts}
                    className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-xs font-bold text-amber-400 hover:bg-slate-800 transition-colors shadow-xs disabled:cursor-not-allowed disabled:opacity-60 cursor-pointer"
                  >
                    {isAddingDistricts ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin text-amber-400" />
                        <span>Adding Districts...</span>
                      </>
                    ) : (
                      <>
                        <Plus className="h-4 w-4" />
                        <span>Add Districts</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </div>

            {/* DISTRICTS DIRECTORY TABLE */}
            <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xs">
              {/* Search and Filter Controls */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-5 border-b border-slate-200 bg-slate-50/50">
                <div className="flex items-center gap-2">
                  <Building className="h-4 w-4 text-slate-600" />
                  <h3 className="text-sm font-bold text-slate-900">
                    Configured Districts ({districts.length})
                  </h3>
                </div>

                <div className="flex items-center gap-2.5 flex-wrap">
                  {/* Search input */}
                  <div className="relative flex-1 sm:w-60">
                    <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                    <input
                      type="text"
                      placeholder="Search district name..."
                      value={districtSearch}
                      onChange={(e) => setDistrictSearch(e.target.value)}
                      className="w-full rounded-xl border border-slate-300 bg-white py-1.5 pl-8 pr-3 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:border-amber-500 focus:outline-hidden"
                    />
                  </div>

                  {/* Status filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 focus:border-amber-500 focus:outline-hidden"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="ACTIVE">Active Only</option>
                    <option value="INACTIVE">Inactive Only</option>
                  </select>
                </div>
              </div>

              {/* Table Render */}
              {districts.length === 0 ? (
                /* EMPTY STATE */
                <div className="flex flex-col items-center justify-center p-12 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-amber-100 text-amber-800">
                    <Building className="h-6 w-6" />
                  </div>
                  <h4 className="mt-3 text-sm font-bold text-slate-900">No districts yet</h4>
                  <p className="mt-1 max-w-sm text-xs text-slate-500">
                    This state has no districts configured. Use the form above to add districts
                    so vendors and customers can select them.
                  </p>
                </div>
              ) : filteredDistricts.length === 0 ? (
                /* FILTER EMPTY STATE */
                <div className="p-8 text-center text-xs text-slate-500">
                  No districts match your filter &ldquo;{districtSearch}&rdquo;.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-700">
                    <thead className="bg-slate-50 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-slate-200">
                      <tr>
                        <th scope="col" className="px-5 py-3.5 w-12 text-center">#</th>
                        <th scope="col" className="px-5 py-3.5">District</th>
                        <th scope="col" className="px-5 py-3.5 text-center w-36">
                          <div className="inline-flex items-center gap-1">
                            <span>Active</span>
                            <span title="Controls whether vendors & customers see this district">
                              <HelpCircle className="h-3 w-3 text-slate-400" />
                            </span>
                          </div>
                        </th>
                        <th scope="col" className="px-5 py-3.5 text-right w-36">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredDistricts.map((item, idx) => {
                        const isToggleBusy = Boolean(updatingToggles[item.districtName]);
                        const isEditingThis = editingDistrict === item.districtName;

                        return (
                          <tr
                            key={item.id || item.districtName}
                            className="hover:bg-slate-50/80 transition-colors group"
                          >
                            {/* Row Index */}
                            <td className="px-5 py-3.5 text-center font-mono text-slate-400">
                              {idx + 1}
                            </td>

                            {/* District Name & Inline Edit */}
                            <td className="px-5 py-3.5 whitespace-nowrap">
                              {isEditingThis ? (
                                <div className="flex items-center gap-2">
                                  <input
                                    type="text"
                                    value={renameValue}
                                    onChange={(e) => setRenameValue(e.target.value)}
                                    onKeyDown={handleRenameKeyDown}
                                    autoFocus
                                    disabled={isRenaming}
                                    className="rounded-lg border border-amber-500 bg-white px-2.5 py-1 text-xs font-bold text-slate-900 shadow-2xs focus:outline-hidden focus:ring-1 focus:ring-amber-500"
                                  />
                                  <button
                                    type="button"
                                    onClick={submitRename}
                                    disabled={isRenaming}
                                    className="rounded-lg bg-emerald-600 p-1.5 text-white hover:bg-emerald-700 transition-colors cursor-pointer"
                                    title="Save (Enter)"
                                  >
                                    {isRenaming ? (
                                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    ) : (
                                      <Check className="h-3.5 w-3.5" />
                                    )}
                                  </button>
                                  <button
                                    type="button"
                                    onClick={cancelRenaming}
                                    disabled={isRenaming}
                                    className="rounded-lg bg-slate-200 p-1.5 text-slate-700 hover:bg-slate-300 transition-colors cursor-pointer"
                                    title="Cancel (Esc)"
                                  >
                                    <X className="h-3.5 w-3.5" />
                                  </button>
                                </div>
                              ) : (
                                <div className="flex items-center gap-2">
                                  <span className="font-bold text-slate-900 text-sm">
                                    {item.districtName}
                                  </span>
                                </div>
                              )}
                            </td>

                            {/* Active Toggle (Optimistic Update) */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-center">
                              <div className="inline-flex flex-col items-center gap-1">
                                <button
                                  type="button"
                                  role="switch"
                                  aria-checked={Boolean(item.isActive)}
                                  disabled={isToggleBusy}
                                  onClick={() => handleToggleActive(item)}
                                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden disabled:cursor-not-allowed disabled:opacity-60 ${
                                    item.isActive ? 'bg-emerald-600' : 'bg-slate-300'
                                  }`}
                                >
                                  <span
                                    className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                                      item.isActive ? 'translate-x-5' : 'translate-x-0'
                                    }`}
                                  />
                                </button>
                                <span
                                  className={`text-[10px] font-bold ${
                                    isToggleBusy
                                      ? 'text-amber-600 animate-pulse'
                                      : item.isActive
                                      ? 'text-emerald-700'
                                      : 'text-slate-400'
                                  }`}
                                >
                                  {isToggleBusy
                                    ? 'Saving...'
                                    : item.isActive
                                    ? 'Active'
                                    : 'Inactive'}
                                </span>
                              </div>
                            </td>

                            {/* Actions (Rename, Delete) */}
                            <td className="px-5 py-3.5 whitespace-nowrap text-right">
                              <div className="inline-flex items-center gap-1">
                                {!isEditingThis && (
                                  <button
                                    type="button"
                                    onClick={() => startRenaming(item)}
                                    className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-200 hover:text-slate-900 transition-colors cursor-pointer"
                                    title="Rename District (inline edit)"
                                  >
                                    <Edit2 className="h-4 w-4" />
                                  </button>
                                )}

                                <button
                                  type="button"
                                  onClick={() => openDeleteModal(item)}
                                  className="rounded-lg p-1.5 text-rose-500 hover:bg-rose-100 hover:text-rose-700 transition-colors cursor-pointer"
                                  title="Delete District"
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
            </div>
          </div>
        )}
      </main>

      {/* DELETE CONFIRMATION DIALOG */}
      {deleteTarget && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
                <Trash2 className="h-6 w-6" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">
                  Delete &ldquo;{deleteTarget.districtName}&rdquo;?
                </h3>
                <p className="text-xs text-slate-500">
                  This action cannot be undone.
                </p>
              </div>
            </div>

            <div className="mt-4 rounded-xl bg-amber-50/80 p-3.5 border border-amber-200">
              <div className="flex items-start gap-2">
                <ShieldAlert className="h-4 w-4 shrink-0 text-amber-700 mt-0.5" />
                <p className="text-xs text-amber-900 leading-relaxed">
                  Permanently deleting this district might fail if vendors, addresses, or orders are actively associated with it on the backend.
                </p>
              </div>
            </div>

            {/* Backend error display with deactivate suggestion */}
            {deleteBackendError && (
              <div className="mt-4 rounded-xl bg-rose-50 p-3.5 border border-rose-200">
                <div className="flex items-start gap-2">
                  <AlertCircle className="h-4 w-4 shrink-0 text-rose-600 mt-0.5" />
                  <div className="text-xs text-rose-800">
                    <p className="font-bold">Backend Error:</p>
                    <p className="mt-0.5">{deleteBackendError}</p>
                    <p className="mt-2 text-rose-900 font-semibold">
                      Recommendation: Deactivate this district instead of deleting it. Deactivating preserves historical order data while preventing new selections.
                    </p>
                  </div>
                </div>
                <div className="mt-3">
                  <button
                    type="button"
                    onClick={handleDeactivateInstead}
                    className="w-full rounded-lg bg-amber-500 px-3 py-1.5 text-xs font-bold text-slate-950 hover:bg-amber-400 transition-colors cursor-pointer"
                  >
                    Deactivate District Instead
                  </button>
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={closeDeleteModal}
                disabled={isDeleting}
                className="rounded-xl border border-slate-300 bg-white px-4 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmDelete}
                disabled={isDeleting}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2 text-xs font-bold text-white hover:bg-rose-700 transition-colors shadow-xs disabled:opacity-60 cursor-pointer"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <span>Delete District</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StateDetailsPage;
