'use client';

import { libraryResponseSchema } from '@neogamelabs/contracts';
import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

import { useAuth } from './auth-provider';

const apiUrl = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:4000';

type OwnershipContextValue = {
  error?: string;
  isOwned: (gameSlug: string) => boolean;
  loading: boolean;
  refreshOwnership: () => Promise<void>;
};

const OwnershipContext = createContext<OwnershipContextValue | undefined>(
  undefined,
);

export function OwnershipProvider({
  children,
}: Readonly<{ children: ReactNode }>) {
  const { authenticated, loading: authLoading } = useAuth();
  const [ownedSlugs, setOwnedSlugs] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>();

  const refreshOwnership = useCallback(async () => {
    if (!authenticated) {
      setOwnedSlugs(new Set());
      setError(undefined);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(undefined);
    try {
      const response = await fetch(`${apiUrl}/v1/purchases/library`, {
        credentials: 'include',
      });
      if (!response.ok) throw new Error('Ownership request failed');
      const library = libraryResponseSchema.parse(await response.json());
      setOwnedSlugs(new Set(library.games.map((game) => game.slug)));
    } catch {
      setError('Ownership status is temporarily unavailable.');
    } finally {
      setLoading(false);
    }
  }, [authenticated]);

  useEffect(() => {
    if (!authLoading) void refreshOwnership();
  }, [authLoading, refreshOwnership]);

  const value = useMemo<OwnershipContextValue>(
    () => ({
      ...(error ? { error } : {}),
      isOwned: (gameSlug) => ownedSlugs.has(gameSlug),
      loading: authLoading || loading,
      refreshOwnership,
    }),
    [authLoading, error, loading, ownedSlugs, refreshOwnership],
  );

  return (
    <OwnershipContext.Provider value={value}>
      {children}
    </OwnershipContext.Provider>
  );
}

export function useOwnership(): OwnershipContextValue {
  const context = useContext(OwnershipContext);
  if (!context) {
    throw new Error('useOwnership must be used inside OwnershipProvider');
  }
  return context;
}
