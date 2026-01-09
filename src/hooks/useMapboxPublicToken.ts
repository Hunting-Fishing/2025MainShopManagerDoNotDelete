import { useCallback, useMemo, useState } from 'react';

const STORAGE_KEY = 'mapbox_public_token';

export function useMapboxPublicToken() {
  const envToken = (import.meta as any).env?.VITE_MAPBOX_PUBLIC_TOKEN as string | undefined;

  const [storedToken, setStoredToken] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || '';
    } catch {
      return '';
    }
  });

  const token = useMemo(() => {
    return (envToken || storedToken || '').trim();
  }, [envToken, storedToken]);

  const setToken = useCallback((nextToken: string) => {
    const trimmed = (nextToken || '').trim();
    setStoredToken(trimmed);

    try {
      if (trimmed) localStorage.setItem(STORAGE_KEY, trimmed);
      else localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  }, []);

  return {
    token,
    setToken,
    hasEnvToken: Boolean(envToken && envToken.trim()),
  };
}
