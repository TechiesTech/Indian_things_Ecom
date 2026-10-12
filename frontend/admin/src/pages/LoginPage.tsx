import { useState, useEffect, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldCheck, Lock, Mail, AlertCircle, ArrowRight } from 'lucide-react';

export const LoginPage = () => {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      await login(email, password);
      navigate('/dashboard', { replace: true });
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Sign in failed. Please check your credentials.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <section aria-labelledby="login-title" className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="bg-[#131921] px-6 py-6 text-white">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-400 text-slate-950">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Indian Things Internal</p>
          </div>
          <h1 id="login-title" className="mt-3 text-2xl font-bold">Admin Command Center</h1>
          <p className="mt-1 text-sm text-slate-300">Authorized staff only</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-4 p-6">
          {error && (
            <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
              <AlertCircle className="h-5 w-5 shrink-0 text-rose-600 mt-0.5" />
              <span>{error}</span>
            </div>
          )}

          <div>
            <label htmlFor="admin-email" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Administrator Email
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Mail className="h-4 w-4" />
              </div>
              <input
                id="admin-email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="admin@indianthings.com"
              />
            </div>
          </div>

          <div>
            <label htmlFor="admin-password" className="block text-xs font-bold uppercase tracking-wider text-slate-700">
              Security Key / Password
            </label>
            <div className="relative mt-1">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                <Lock className="h-4 w-4" />
              </div>
              <input
                id="admin-password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full rounded-md border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="••••••••••••"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={isLoading}
              className="flex w-full items-center justify-center gap-2 rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 transition hover:bg-amber-500 disabled:cursor-wait disabled:opacity-60 cursor-pointer"
            >
              <span>{isLoading ? 'Authenticating Staff...' : 'Sign In to Command Center'}</span>
              {!isLoading && <ArrowRight className="h-4 w-4" />}
            </button>
          </div>

          <p className="text-center text-xs text-slate-500 pt-2">
            Restricted System. All unauthorized login attempts are logged and monitored.
          </p>
        </form>
      </section>
    </main>
  );
};
