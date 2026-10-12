import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { api, getRequestErrorMessage } from '../services/api';

export interface AdminUser {
  _id: string;
  name: string;
  email: string;
  role: string;
  phone?: string;
  [key: string]: unknown;
}

interface LoginResponse {
  success: boolean;
  token: string;
  user: AdminUser;
  message?: string;
}

interface AuthContextType {
  token: string | null;
  user: AdminUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<AdminUser>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_KEY = 'it_admin_token';
const USER_KEY = 'it_admin_user';

const getInitialAuth = (): { token: string | null; user: AdminUser | null } => {
  try {
    const storedToken = localStorage.getItem(TOKEN_KEY);
    const storedUserStr = localStorage.getItem(USER_KEY);
    if (storedToken && storedUserStr) {
      const parsedUser = JSON.parse(storedUserStr) as AdminUser;
      if (parsedUser.role === 'admin') {
        return { token: storedToken, user: parsedUser };
      }
    }
  } catch {
    // Malformed storage fallback
  }
  return { token: null, user: null };
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [auth, setAuth] = useState(getInitialAuth);
  const [isLoading, setIsLoading] = useState(false);

  const clearAuth = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    setAuth({ token: null, user: null });
  }, []);

  useEffect(() => {
    const handleUnauthorized = () => {
      clearAuth();
    };
    window.addEventListener('auth:admin_unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:admin_unauthorized', handleUnauthorized);
  }, [clearAuth]);

  const login = async (email: string, password: string): Promise<AdminUser> => {
    setIsLoading(true);
    try {
      const response = await api.post<LoginResponse>('/auth/login', {
        email: email.trim(),
        password,
      });

      const { data } = response;
      if (!data.success || !data.token || !data.user) {
        throw new Error(data.message || 'Login failed. Invalid credentials.');
      }

      // Hard role restriction: Admin app allows ONLY role 'admin'
      if (data.user.role !== 'admin') {
        clearAuth();
        throw new Error("Access denied: This portal is for system administrators only. Please sign in via the customer or vendor portal.");
      }

      localStorage.setItem(TOKEN_KEY, data.token);
      localStorage.setItem(USER_KEY, JSON.stringify(data.user));
      setAuth({ token: data.token, user: data.user });
      return data.user;
    } catch (error) {
      throw new Error(getRequestErrorMessage(error, 'Login failed'));
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
    isAuthenticated: Boolean(auth.token && auth.user && auth.user.role === 'admin'),
    isLoading,
    login,
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
