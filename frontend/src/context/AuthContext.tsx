import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import * as authApi from '../api/auth';
import { AUTH_EXPIRED_EVENT } from '../api/client';
import type { User } from '../api/types';
import { clearAuth, loadAuth, saveAuth } from '../lib/storage';

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  /** UI convenience only. The backend enforces roles on every request. */
  isAdmin: boolean;
  login(email: string, password: string): Promise<void>;
  register(email: string, password: string): Promise<void>;
  logout(): void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => loadAuth()?.user ?? null);

  const logout = useCallback(() => {
    clearAuth();
    setUser(null);
  }, []);

  // The API client fires this when the server rejects our token (e.g. expired).
  useEffect(() => {
    window.addEventListener(AUTH_EXPIRED_EVENT, logout);
    return () => window.removeEventListener(AUTH_EXPIRED_EVENT, logout);
  }, [logout]);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedIn } = await authApi.login(email, password);
    saveAuth({ token, user: loggedIn });
    setUser(loggedIn);
  }, []);

  const register = useCallback(
    async (email: string, password: string) => {
      await authApi.register(email, password);
      await login(email, password); // sign the new user straight in
    },
    [login],
  );

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isAdmin: user?.role === 'ADMIN', login, register, logout }),
    [user, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside <AuthProvider>');
  return ctx;
}