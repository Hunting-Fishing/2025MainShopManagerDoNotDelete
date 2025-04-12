
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useShopId() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function getShopId() {
      try {
        setLoading(true);
        // Get the current authenticated user
        const { data: { user }, error: userError } = await supabase.auth.getUser();
        
        if (userError) {
          throw userError;
        }
        
        if (!user) {
          setShopId(null);
          return;
        }
        
        // Get the shop ID from the user's profile
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('shop_id')
          .eq('id', user.id)
          .single();
        
        if (profileError) {
          throw profileError;
        }
        
        setShopId(profile?.shop_id || null);
      } catch (err) {
        console.error("Error getting shop ID:", err);
        setError(err instanceof Error ? err : new Error('Failed to get shop ID'));
        setShopId(null);
      } finally {
        setLoading(false);
      }
    }
    
    getShopId();
  }, []);
  
  return { shopId, loading, error };
}
