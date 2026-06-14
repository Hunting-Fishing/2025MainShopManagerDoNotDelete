import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuthUser } from '@/hooks/useAuthUser';

const SHOP_LOOKUP_TIMEOUT_MS = 6000;

export function useShopId() {
  const { userId, isLoading: authLoading } = useAuthUser();
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [refetchTick, setRefetchTick] = useState(0);

  const refetch = useCallback(() => setRefetchTick((t) => t + 1), []);

  useEffect(() => {
    if (authLoading) return;

    if (!userId) {
      setShopId(null);
      setError(null);
      setLoading(false);
      return;
    }

    let cancelled = false;
    setLoading(true);
    setError(null);

    const timeout = new Promise<never>((_, reject) =>
      setTimeout(
        () => reject(new Error('Profile lookup timed out. Please retry.')),
        SHOP_LOOKUP_TIMEOUT_MS,
      ),
    );

    const query = supabase
      .from('profiles')
      .select('shop_id')
      .or(`id.eq.${userId},user_id.eq.${userId}`)
      .maybeSingle();

    Promise.race([query, timeout])
      .then((result: any) => {
        if (cancelled) return;
        if (result?.error) {
          console.error('useShopId: profile error', result.error);
          setError(result.error instanceof Error ? result.error : new Error(String(result.error)));
          setShopId(null);
          return;
        }
        setShopId(result?.data?.shop_id ?? null);
      })
      .catch((err) => {
        if (cancelled) return;
        console.error('useShopId: error/timeout', err);
        setError(err instanceof Error ? err : new Error('Failed to get shop ID'));
        setShopId(null);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [userId, authLoading, refetchTick]);

  return { shopId, loading: loading || authLoading, error, refetch };
}
