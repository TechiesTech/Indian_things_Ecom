import React, { useState } from 'react';
import axios from 'axios';
import { useCart } from '../context/CartContext';

const authApi = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000',
  headers: { 'Content-Type': 'application/json' },
});

const getRequestErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    if (!error.response) {
      return `Cannot connect to the API at ${authApi.defaults.baseURL}. Make sure the backend is running.`;
    }

    return error.response.data?.message || `${fallback} (HTTP ${error.response.status}).`;
  }

  return error instanceof Error ? error.message : fallback;
};

interface LoginFormProps {
  onLoginSuccess: () => void;
}

interface UserOtpVerifyResponse {
  success: boolean;
  message?: string;
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    mobile: string;
  };
}

export const LoginForm: React.FC<LoginFormProps> = ({ onLoginSuccess }) => {
  const { updateUserProfile } = useCart();
  const [details, setDetails] = useState({ name: '', email: '', mobile: '' });
  const [otp, setOtp] = useState('');
  const [otpRequested, setOtpRequested] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const requestOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { data: result } = await authApi.post('/api/auth/userLoginOtp', {
        name: details.name.trim(),
        email: details.email.trim(),
        mobile: details.mobile.trim(),
      });

      if (result.success !== true) {
        throw new Error(result.message || 'Unable to send the OTP. Please try again.');
      }

      setOtpRequested(true);
      setMessage(result.message || 'OTP sent to your email.');
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'Unable to send the OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setMessage('');
    setIsLoading(true);

    try {
      const { data: result } = await authApi.post<UserOtpVerifyResponse>('/api/auth/userVerifyOtp', {
        email: details.email.trim(),
        otp: otp.trim(),
      });

      if (result.success !== true || !result.token || !result.user) {
        throw new Error(result.message || 'The OTP could not be verified. Please try again.');
      }

      sessionStorage.setItem('it_user_token', result.token);
      updateUserProfile({
        id: result.user.id,
        fullName: result.user.name,
        email: result.user.email,
        phone: result.user.mobile,
      });
      onLoginSuccess();
    } catch (requestError) {
      setError(getRequestErrorMessage(requestError, 'The OTP could not be verified. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-8 font-['Plus_Jakarta_Sans',sans-serif] text-slate-900">
      <section aria-labelledby="login-title" className="w-full max-w-md overflow-hidden rounded-xl bg-white shadow-xl">
        <header className="bg-[#131921] px-6 py-6 text-white">
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">Indian Things</p>
          <h1 id="login-title" className="mt-2 text-2xl font-bold">Sign in to continue</h1>
          <p className="mt-1 text-sm text-slate-300">Enter your details and verify the email OTP.</p>
        </header>

        <form onSubmit={otpRequested ? verifyOtp : requestOtp} className="space-y-4 p-6">
          <div>
            <label htmlFor="login-name" className="text-sm font-semibold text-slate-700">User name</label>
            <input
              id="login-name"
              autoComplete="name"
              required
              disabled={otpRequested || isLoading}
              value={details.name}
              onChange={(event) => setDetails({ ...details, name: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
              placeholder="Your full name"
            />
          </div>
          <div>
            <label htmlFor="login-email" className="text-sm font-semibold text-slate-700">Email</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              required
              disabled={otpRequested || isLoading}
              value={details.email}
              onChange={(event) => setDetails({ ...details, email: event.target.value })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label htmlFor="login-mobile" className="text-sm font-semibold text-slate-700">Phone number</label>
            <input
              id="login-mobile"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              pattern="[0-9]{10}"
              maxLength={10}
              required
              disabled={otpRequested || isLoading}
              value={details.mobile}
              onChange={(event) => setDetails({ ...details, mobile: event.target.value.replace(/\D/g, '') })}
              className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200 disabled:bg-slate-100"
              placeholder="10-digit mobile number"
            />
          </div>

          {otpRequested && (
            <div>
              <label htmlFor="login-otp" className="text-sm font-semibold text-slate-700">OTP</label>
              <input
                id="login-otp"
                type="text"
                inputMode="numeric"
                autoComplete="one-time-code"
                required
                value={otp}
                onChange={(event) => setOtp(event.target.value.replace(/\D/g, ''))}
                className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2.5 text-sm tracking-[0.25em] outline-none focus:border-amber-500 focus:ring-2 focus:ring-amber-200"
                placeholder="Enter the code from your email"
              />
            </div>
          )}

          {error && <p role="alert" className="text-sm text-rose-700">{error}</p>}
          {message && <p role="status" className="text-sm text-emerald-700">{message}</p>}

          <div className="flex flex-wrap items-center gap-3 pt-1">
            <button
              type="submit"
              disabled={isLoading}
              className="rounded-md bg-amber-400 px-4 py-2.5 text-sm font-bold text-slate-950 hover:bg-amber-500 disabled:cursor-wait disabled:opacity-60"
            >
              {isLoading ? 'Please wait...' : otpRequested ? 'Verify and open dashboard' : 'Send OTP'}
            </button>
            {otpRequested && (
              <>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={requestOtp}
                  className="text-sm font-semibold text-slate-700 underline decoration-slate-300 underline-offset-4 hover:text-slate-950 disabled:opacity-60"
                >
                  Resend OTP
                </button>
                <button
                  type="button"
                  disabled={isLoading}
                  onClick={() => { setOtpRequested(false); setOtp(''); setMessage(''); setError(''); }}
                  className="text-sm font-semibold text-slate-500 hover:text-slate-800 disabled:opacity-60"
                >
                  Edit details
                </button>
              </>
            )}
          </div>
        </form>
      </section>
    </main>
  );
};
