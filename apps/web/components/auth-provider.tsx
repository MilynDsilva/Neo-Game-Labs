'use client';

import {
  authStatusSchema,
  type AuthStatus,
  type CustomerProfile,
} from '@neogamelabs/contracts';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type AuthContextValue = {
  authenticated: boolean;
  customer?: CustomerProfile;
  error?: string;
  loading: boolean;
  refresh: () => Promise<void>;
  signOut: () => Promise<boolean>;
};

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: Readonly<{ children: ReactNode }>) {
  const [status, setStatus] = useState<AuthStatus>();
  const [error, setError] = useState<string>();

  const refresh = useCallback(async () => {
    setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/auth/me`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Authentication request failed');
      setStatus(authStatusSchema.parse(await response.json()));
    } catch {
      setError('Account status is temporarily unavailable.');
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const signOut = useCallback(async () => {
    setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/auth/sign-out`, {
        credentials: 'include',
        method: 'POST',
      });
      if (!response.ok) throw new Error('Sign-out request failed');
      setStatus({ authenticated: false });
      return true;
    } catch {
      setError('Sign out failed. Please try again.');
      return false;
    }
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated: status?.authenticated === true,
      ...(status?.authenticated ? { customer: status.customer } : {}),
      ...(error ? { error } : {}),
      loading: status === undefined && error === undefined,
      refresh,
      signOut,
    }),
    [error, refresh, signOut, status],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside AuthProvider');
  return context;
}
