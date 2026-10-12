import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';

interface LoginFormProps {
  onLoginSuccess?: () => void;
}

type LoginTab = 'password' | 'otp';

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { loginWithPassword, sendOtp, verifyOtp, isLoading } = useAuth();
  const { updateUserProfile } = useCart();

  const [activeTab, setActiveTab] = useState<LoginTab>('password');

  // Password state
  const [passwordForm, setPasswordForm] = useState({
    email: '',
    password: '',
  });

  // OTP state
  const [otpForm, setOtpForm] = useState({
    name: '',
    email: '',
    mobile: '',
  });
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);

  const [error, setError] = useState('');
  const [message, setMessage] = useState('');

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const user = await loginWithPassword(passwordForm.email, passwordForm.password);
      updateUserProfile({
        id: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      onLoginSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Login failed. Please check your credentials.');
    }
  };

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const successMsg = await sendOtp(otpForm.name, otpForm.email, otpForm.mobile);
      setOtpRequested(true);
      setMessage(successMsg);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Unable to send OTP. Please try again.');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setMessage('');

    try {
      const user = await verifyOtp(otpForm.email, otp);
      updateUserProfile({
        id: user._id,
        fullName: user.name,
        email: user.email,
        phone: user.phone || '',
      });
      onLoginSuccess?.();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'The OTP could not be verified.');
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <section aria-labelledby="login-title" className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="bg-[#131921] px-6 py-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Indian Things</p>
          <h1 id="login-title" className="mt-2 text-2xl font-bold">Customer Sign In</h1>
          <p className="mt-1 text-sm text-slate-300">Welcome back! Sign in to access your orders and cart.</p>
        </header>

        {/* Tab Switcher */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-sm font-semibold">
          <button
            type="button"
            onClick={() => {
              setActiveTab('password');
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'password'
                ? 'border-amber-400 bg-white text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email &amp; Password
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('otp');
              setError('');
              setMessage('');
            }}
            className={`flex-1 py-3 text-center transition-colors border-b-2 ${
              activeTab === 'otp'
                ? 'border-amber-400 bg-white text-slate-950 font-bold'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Email OTP (Customer)
          </button>
        </div>

        {/* Tab 1: Email & Password */}
        {activeTab === 'password' && (
          <form onSubmit={handlePasswordLogin} className="space-y-4 p-6">
            <div>
              <label htmlFor="customer-email" className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                id="customer-email"
                type="email"
                autoComplete="email"
                required
                disabled={isLoading}
                value={passwordForm.email}
                onChange={(e) => setPasswordForm({ ...passwordForm, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="customer-password" className="text-sm font-semibold text-slate-700">Password</label>
              <input
                id="customer-password"
                type="password"
                autoComplete="current-password"
                required
                disabled={isLoading}
                value={passwordForm.password}
                onChange={(e) => setPasswordForm({ ...passwordForm, password: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="Enter your password"
              />
            </div>

            {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
            {message && <p role="status" className="text-sm font-medium text-emerald-700">{message}</p>}

            <button
              type="submit"
              disabled={isLoading}
              className="w-full rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 transition-colors disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Signing in...' : 'Sign In with Password'}
            </button>
          </form>
        )}

        {/* Tab 2: Customer Email OTP */}
        {activeTab === 'otp' && (
          <form onSubmit={otpRequested ? handleVerifyOtp : handleSendOtp} className="space-y-4 p-6">
            <div>
              <label htmlFor="customer-name" className="text-sm font-semibold text-slate-700">Full Name</label>
              <input
                id="customer-name"
                type="text"
                autoComplete="name"
                required
                disabled={otpRequested || isLoading}
                value={otpForm.name}
                onChange={(e) => setOtpForm({ ...otpForm, name: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="Your full name"
              />
            </div>

            <div>
              <label htmlFor="otp-email" className="text-sm font-semibold text-slate-700">Email Address</label>
              <input
                id="otp-email"
                type="email"
                autoComplete="email"
                required
                disabled={otpRequested || isLoading}
                value={otpForm.email}
                onChange={(e) => setOtpForm({ ...otpForm, email: e.target.value })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="you@example.com"
              />
            </div>

            <div>
              <label htmlFor="customer-mobile" className="text-sm font-semibold text-slate-700">Mobile Number</label>
              <input
                id="customer-mobile"
                type="tel"
                autoComplete="tel"
                inputMode="numeric"
                pattern="[0-9]{10}"
                maxLength={10}
                required
                disabled={otpRequested || isLoading}
                value={otpForm.mobile}
                onChange={(e) => setOtpForm({ ...otpForm, mobile: e.target.value.replace(/\D/g, '') })}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
                placeholder="10-digit mobile number"
              />
            </div>

            {otpRequested && (
              <div>
                <label htmlFor="customer-otp-code" className="text-sm font-semibold text-slate-700">One-Time Password (OTP)</label>
                <input
                  id="customer-otp-code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  maxLength={6}
                  required
                  value={otp}
                  onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                  className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm tracking-[0.25em] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                  placeholder="Enter 6-digit code"
                />
              </div>
            )}

            {error && <p role="alert" className="text-sm font-medium text-rose-700">{error}</p>}
            {message && <p role="status" className="text-sm font-medium text-emerald-700">{message}</p>}

            <div className="flex flex-wrap items-center gap-3 pt-1">
              <button
                type="submit"
                disabled={isLoading}
                className="rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 transition-colors disabled:cursor-wait disabled:opacity-60"
              >
                {isLoading ? 'Please wait...' : otpRequested ? 'Verify & Continue' : 'Send OTP'}
              </button>
              {otpRequested && (
                <>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={handleSendOtp}
                    className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 disabled:opacity-60"
                  >
                    Resend OTP
                  </button>
                  <button
                    type="button"
                    disabled={isLoading}
                    onClick={() => {
                      setOtpRequested(false);
                      setOtp('');
                      setMessage('');
                      setError('');
                    }}
                    className="text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-60"
                  >
                    Edit details
                  </button>
                </>
              )}
            </div>
          </form>
        )}
      </section>
    </main>
  );
};
