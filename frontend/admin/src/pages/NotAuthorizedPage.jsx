import { useNavigate } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const NotAuthorizedPage = () => {
  const navigate = useNavigate();

  // ADAPT: If using AuthContext or custom token key, retrieve user info accordingly
  let currentRole = null;
  try {
    const rawUser = localStorage.getItem('user') || localStorage.getItem('it_admin_user');
    if (rawUser) {
      const parsed = JSON.parse(rawUser);
      currentRole = parsed?.role;
    }
  } catch {
    currentRole = null;
  }

  const handleLogout = () => {
    // ADAPT: Clear your session keys
    localStorage.removeItem('token');
    localStorage.removeItem('it_admin_token');
    localStorage.removeItem('user');
    localStorage.removeItem('it_admin_user');
    navigate('/login', { replace: true });
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-lg border border-slate-200">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-rose-50 text-rose-600 border border-rose-100">
          <ShieldAlert className="h-9 w-9" />
        </div>

        <span className="mt-4 inline-block rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-700 uppercase tracking-wider">
          Access Restricted
        </span>

        <h1 className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
          403 - Not Authorized
        </h1>

        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
          You do not have administrative privileges to access this page. This area requires an account with the{' '}
          <strong className="text-slate-900">ADMIN</strong> role.
        </p>

        {currentRole && (
          <div className="mt-4 rounded-lg bg-slate-50 p-3 text-xs text-slate-500 border border-slate-200">
            Current Authenticated Role: <span className="font-semibold text-rose-600 uppercase">{currentRole}</span>
          </div>
        )}

        <div className="mt-6 flex flex-col gap-2.5">
          <button
            type="button"
            onClick={handleLogout}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 transition-colors shadow-sm cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out &amp; Switch Account
          </button>

          <button
            type="button"
            onClick={() => navigate('/login', { replace: true })}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </main>
  );
};

export default NotAuthorizedPage;
