import { useAuth } from '../context/AuthContext';
import { ShieldCheck, LogOut, Users, Server, Database } from 'lucide-react';

export const DashboardPage = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Top Navigation */}
      <header className="bg-[#131921] px-6 py-4 text-white shadow-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[11px] font-bold uppercase tracking-wider text-amber-400">Admin Command Center</p>
              <h1 className="text-lg font-bold leading-tight">Master Control Panel</h1>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="hidden sm:block text-right text-xs">
              <span className="block text-slate-400">Active Staff</span>
              <span className="font-semibold text-white">{user?.name} ({user?.email})</span>
            </div>
            <button
              onClick={logout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="mx-auto max-w-6xl px-6 py-8">
        <div className="overflow-hidden rounded-xl bg-white p-8 shadow-sm border border-slate-200">
          <div className="flex items-center gap-3 border-b border-slate-200 pb-5">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-amber-100 text-amber-700">
              <Server className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-900">Administrator Console</h2>
              <p className="text-sm text-slate-500">
                Logged in as <span className="font-bold text-slate-900">{user?.name}</span> with system-wide <span className="font-semibold text-amber-600">admin</span> privileges.
              </p>
            </div>
          </div>

          <div className="mt-6 grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">Security Clearance</p>
              <div className="mt-1 flex items-center gap-1.5">
                <ShieldCheck className="h-4 w-4 text-emerald-600" />
                <span className="text-base font-bold text-emerald-700 uppercase">{user?.role}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">User Identity</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Users className="h-4 w-4 text-slate-600" />
                <span className="text-base font-bold text-slate-900 truncate">{user?.email}</span>
              </div>
            </div>

            <div className="rounded-lg bg-slate-50 p-4 border border-slate-200">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-500">System Connection</p>
              <div className="mt-1 flex items-center gap-1.5">
                <Database className="h-4 w-4 text-indigo-600" />
                <span className="text-base font-bold text-slate-900">Online</span>
              </div>
            </div>
          </div>

          <div className="mt-8 rounded-lg bg-slate-900 text-white p-6">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Admin Command Center Active</h3>
                <p className="mt-1 text-xs text-slate-300 max-w-xl leading-relaxed">
                  Authentication token and role verification active. Core administrative operations including vendor approval workflows, customer user management, and system audits are linked to this central portal.
                </p>
              </div>
              <button
                onClick={logout}
                className="rounded-md bg-amber-400 px-4 py-2.5 text-xs font-bold text-slate-950 hover:bg-amber-500 transition-colors cursor-pointer"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};
