import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, ArrowLeft, LogOut } from 'lucide-react';

export const ForbiddenPage = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <div className="w-full max-w-md rounded-xl bg-white p-8 text-center shadow-lg border border-slate-200">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-rose-100 text-rose-600">
          <ShieldAlert className="h-8 w-8" />
        </div>
        <h1 className="mt-4 text-2xl font-bold text-slate-900">403 - Access Denied</h1>
        <p className="mt-2 text-sm text-slate-600">
          This portal requires verified <span className="font-semibold text-slate-900">administrator</span> credentials.
          {user?.role && (
            <span className="block mt-1 text-xs text-rose-600">
              You are currently authenticated as role: <strong>{user.role}</strong>
            </span>
          )}
        </p>
        <div className="mt-6 flex flex-col gap-2">
          <button
            onClick={() => {
              logout();
              navigate('/login', { replace: true });
            }}
            className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 transition-colors cursor-pointer"
          >
            <LogOut className="h-4 w-4" />
            Sign Out &amp; Switch Account
          </button>
          <button
            onClick={() => navigate('/login', { replace: true })}
            className="flex w-full items-center justify-center gap-2 rounded-md border border-slate-300 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Login
          </button>
        </div>
      </div>
    </main>
  );
};
