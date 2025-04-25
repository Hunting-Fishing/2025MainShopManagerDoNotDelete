
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface WorkOrder {
  id: string;
  status: string;
  technician_id: string;
  created_at: string;
}

/**
 * Hook for fetching work orders from Supabase
 */
export function useFetchWorkOrders() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchWorkOrders = async (): Promise<WorkOrder[]> => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Try to fetch work orders directly
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, status, technician_id, created_at');
        
      if (error) {
        // If there's an error, it might be that the table doesn't exist yet
        console.warn("Error fetching work orders:", error);
        setError(error.message);
        return [];
      }

      return data || [];
    } catch (err) {
      console.error('Error in fetchWorkOrders:', err);
      setError(err instanceof Error ? err.message : 'Failed to load work orders');
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  return {
    fetchWorkOrders,
    isLoading,
    error
  };
}
