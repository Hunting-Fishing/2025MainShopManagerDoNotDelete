
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

interface UseShopIdReturnType {
  shopId: string | null;
  loading: boolean;
  error: Error | null;
}

export function useShopId(): UseShopIdReturnType {
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not authenticated');
        }

        // Get user's profile with shop_id
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();

        if (profileError) {
          throw profileError;
        }

        setShopId(profileData.shop_id);
        
      } catch (err) {
        console.error('Error fetching shop ID:', err);
        setError(err instanceof Error ? err : new Error('Failed to fetch shop ID'));
      } finally {
        setLoading(false);
      }
    };

    fetchShopId();
  }, []);

  return { shopId, loading, error };
}
