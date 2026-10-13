import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Users, Server, Database, MapPin, ArrowRight } from 'lucide-react';
import AdminNavbar from '../components/AdminNavbar';

export const DashboardPage = () => {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-slate-100 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      {/* Universal Admin Navigation */}
      <AdminNavbar />

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
                Logged in as <span className="font-bold text-slate-900">{user?.name}</span> with system-wide{' '}
                <span className="font-semibold text-amber-600">admin</span> privileges.
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

          {/* Quick Management Modules */}
          <div className="mt-8 border-t border-slate-200 pt-6">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-4">
              Core Administrative Modules
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* State Management Module Card */}
              <Link
                to="/admin/states"
                className="group flex items-start gap-4 rounded-xl border border-slate-200 bg-slate-50 p-5 hover:border-amber-400 hover:bg-amber-50/30 transition-all shadow-xs"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-amber-400 text-slate-950 font-bold group-hover:scale-105 transition-transform">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <h4 className="text-base font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
                      States Management
                    </h4>
                    <ArrowRight className="h-4 w-4 text-slate-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="mt-1 text-xs text-slate-600 leading-relaxed">
                    Manage pan-India states and UTs. Control operational access toggles for Vendors and Customers with instant real-time sync.
                  </p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPage;
