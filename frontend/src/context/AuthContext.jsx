import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  registerRequest,
  loginRequest,
  logoutRequest,
  fetchProfile,
} from '../services/auth.service';

const AuthContext = createContext(null);

/**
 * Wraps the app and hydrates the current session on load by calling
 * GET /api/auth/profile. Since the JWT lives in an httpOnly cookie, this
 * is the only way the frontend can know "am I logged in?" after a reload.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const hydrate = useCallback(async () => {
    try {
      const { data } = await fetchProfile();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    hydrate();
  }, [hydrate]);

  const register = async ({ fullName, email, password }) => {
    const { data } = await registerRequest({ fullName, email, password });
    setUser(data.user);
    return data.user;
  };

  const login = async ({ email, password }) => {
    const { data } = await loginRequest({ email, password });
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    await logoutRequest();
    setUser(null);
  };

  const value = { user, loading, isAuthenticated: !!user, register, login, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return ctx;
}
