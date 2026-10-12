import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, getRequestErrorMessage } from '../services/api';

export interface AuthUser {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  role: 'customer' | 'vendor' | 'admin' | string;
  isActive?: boolean;
  isVerified?: boolean;
  [key: string]: unknown;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: AuthUser;
  message?: string;
}

interface SendOtpResponse {
  success: boolean;
  message: string;
}

interface AuthContextType {
  token: string | null;
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  loginWithPassword: (email: string, password: string) => Promise<AuthUser>;
  sendOtp: (name: string, email: string, mobile: string) => Promise<string>;
  verifyOtp: (email: string, otp: string) => Promise<AuthUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'it_customer_token';
const USER_KEY = 'it_customer_user';
const LEGACY_TOKEN_KEY = 'it_user_token';

const getInitialAuth = (): { token: string | null; user: AuthUser | null } => {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
    const storedUserStr = localStorage.getItem(USER_KEY);
    if (storedToken && storedUserStr) {
      const parsedUser = JSON.parse(storedUserStr) as AuthUser;
      if (parsedUser.role === 'customer') {
        return { token: storedToken, user: parsedUser };
      }
    }
  } catch {
    // Malformed JSON fallback
  }
  return { token: null, user: null };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [auth, setAuth] = useState(getInitialAuth);
  const [isLoading, setIsLoading] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    sessionStorage.removeItem(LEGACY_TOKEN_KEY);
    setAuth({ token: null, user: null });
  }, []);

  const saveAuth = useCallback((token: string, user: AuthUser) => {
    localStorage.setItem(TOKEN_KEY, token);
    localStorage.setItem(USER_KEY, JSON.stringify(user));
    sessionStorage.setItem(LEGACY_TOKEN_KEY, token);
    setAuth({ token, user });
  }, []);

  // Listen for unauthorized events emitted by API client
  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
    };
    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, [clearAuth]);

  const loginWithPassword = async (email: string, password: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      const { data } = response;
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Login failed. Please check your credentials.');
      }

      // Hard check: Customer app ONLY accepts the 'customer' role
      if (data.user.role !== 'customer') {
        clearAuth();
        throw new Error("This account can't sign in here. Please use the vendor or admin portal.");
      }

      saveAuth(data.token, data.user);
      return data.user;
    } catch (error) {
      const msg = getRequestErrorMessage(error, 'Login failed');
      throw new Error(msg);
    } finally {
      setIsLoading(false);
    }
  };

  const sendOtp = async (name: string, email: string, mobile: string): Promise<string> => {
    setIsLoading(true);
    try {
      const response = await api.post<SendOtpResponse>('/auth/user/sendOtp', {
        name: name.trim(),
        email: email.trim(),
        mobile: mobile.trim(),
      });

      if (!response.data.success) {
        throw new Error(response.data.message || 'Unable to send OTP.');
      }
      return response.data.message || 'OTP sent to your email.';
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, 'Unable to send OTP. Please try again.'));
    } finally {
      setIsLoading(false);
    }
  };

  const verifyOtp = async (email: string, otp: string): Promise<AuthUser> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/verifyOtp', {
        email: email.trim(),
        otp: otp.trim(),
      });

      const { data } = response;
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'OTP verification failed.');
      }

      if (data.user.role !== 'customer') {
        clearAuth();
        throw new Error("This account can't sign in here. Please use the vendor or admin portal.");
      }

      saveAuth(data.token, data.user);
      return data.user;
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, 'The OTP could not be verified.'));
    } finally {
      setIsLoading(false);
    }
  };

  const logout = useCallback(() => {
    clearAuth();
  }, [clearAuth]);

  const value: AuthContextType = {
    token: auth.token,
    user: auth.user,
    isAuthenticated: Boolean(auth.token && auth.user && auth.user.role === 'customer'),
    isLoading,
    loginWithPassword,
    sendOtp,
    verifyOtp,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
