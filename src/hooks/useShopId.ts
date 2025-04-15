
import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export function useShopId() {
  const [shopId, setShopId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShopId = async () => {
      try {
        // Get the current authenticated user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsLoading(false);
          return;
        }
        
        // Get the shop associated with this user
        const { data, error } = await supabase
          .from('shops')
          .select('id')
          .eq('owner_id', user.id)
          .single();
          
        if (error) {
          console.error('Error fetching shop:', error);
        } else if (data) {
          setShopId(data.id);
        }
      } catch (error) {
        console.error('Error in useShopId:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchShopId();
  }, []);

  return { shopId, isLoading };
}
