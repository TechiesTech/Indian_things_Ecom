import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { ShieldCheck, MapPin, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export const AdminNavbar = () => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // ADAPT: Retrieve user and role from your AuthContext or localStorage keys
  let user = null;
  try {
    const raw = localStorage.getItem('user') || localStorage.getItem('it_admin_user');
    if (raw) user = JSON.parse(raw);
  } catch {
    user = null;
  }

  // ADAPT: Role checking logic (supports 'ADMIN' or 'admin')
  const userRole = user?.role || localStorage.getItem('role') || '';
  const isAdmin = typeof userRole === 'string' && userRole.toUpperCase() === 'ADMIN';

  const handleLogout = () => {
    // ADAPT: Clear localStorage keys according to your auth implementation
    localStorage.removeItem('token');
    localStorage.removeItem('it_admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('it_admin_user');
    window.dispatchEvent(new Event('auth:admin_unauthorized'));
    navigate('/login', { replace: true });
  };

  const navLinkClass = ({ isActive }) =>
    `flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-semibold transition-all ${
      isActive
        ? 'bg-amber-400 text-slate-950 shadow-sm'
        : 'text-slate-300 hover:text-white hover:bg-slate-800'
    }`;

  return (
    <header className="bg-[#131921] text-white shadow-md sticky top-0 z-40 border-b border-slate-800 font-['Plus_Jakarta_Sans',sans-serif]">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 py-3.5">
        {/* Brand / Logo */}
        <div className="flex items-center gap-6">
          <NavLink to="/dashboard" className="flex items-center gap-3 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-400 text-slate-950 font-bold group-hover:bg-amber-300 transition-colors">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider text-amber-400 leading-none">
                Indian Things
              </p>
              <h1 className="text-base font-bold leading-tight text-white group-hover:text-amber-200 transition-colors">
                Admin Portal
              </h1>
            </div>
          </NavLink>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-1.5 ml-4">
            <NavLink to="/dashboard" className={navLinkClass}>
              <LayoutDashboard className="h-4 w-4" />
              <span>Dashboard</span>
            </NavLink>

            {/* ADAPT: States link is ONLY shown when role === "ADMIN" */}
            {isAdmin && (
              <NavLink to="/admin/states" className={navLinkClass}>
                <MapPin className="h-4 w-4" />
                <span>States Management</span>
              </NavLink>
            )}
          </nav>
        </div>

        {/* User Info & Actions */}
        <div className="hidden md:flex items-center gap-4">
          <div className="text-right text-xs">
            <span className="block text-slate-400">Authenticated Staff</span>
            <div className="flex items-center gap-2">
              <span className="font-semibold text-white truncate max-w-[180px]">
                {user?.name || user?.email || 'Administrator'}
              </span>
              <span className="rounded bg-amber-400/20 px-1.5 py-0.5 text-[10px] font-bold text-amber-300 uppercase">
                {userRole || 'ADMIN'}
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={handleLogout}
            className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3.5 py-2 text-xs font-bold text-amber-300 hover:bg-slate-700 hover:text-white transition-colors cursor-pointer border border-slate-700"
            title="Sign out of Admin Session"
          >
            <LogOut className="h-4 w-4" />
            <span>Logout</span>
          </button>
        </div>

        {/* Mobile Hamburger Button */}
        <div className="flex md:hidden items-center gap-2">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="rounded-lg p-2 text-slate-300 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle navigation menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-800 bg-[#0f141c] px-4 py-3 space-y-2">
          <NavLink
            to="/dashboard"
            onClick={() => setMobileMenuOpen(false)}
            className={navLinkClass}
          >
            <LayoutDashboard className="h-4 w-4" />
            <span>Dashboard</span>
          </NavLink>

          {/* ADAPT: States link is ONLY shown when role === "ADMIN" */}
          {isAdmin && (
            <NavLink
              to="/admin/states"
              onClick={() => setMobileMenuOpen(false)}
              className={navLinkClass}
            >
              <MapPin className="h-4 w-4" />
              <span>States Management</span>
            </NavLink>
          )}

          <div className="pt-2 border-t border-slate-800 flex items-center justify-between">
            <div className="text-xs text-slate-400">
              {user?.email || 'Administrator'}
            </div>
            <button
              type="button"
              onClick={handleLogout}
              className="flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-bold text-amber-300"
            >
              <LogOut className="h-3.5 w-3.5" />
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};

export default AdminNavbar;
