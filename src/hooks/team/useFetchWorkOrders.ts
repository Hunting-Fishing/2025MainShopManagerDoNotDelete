
import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export interface WorkOrder {
  technician_id: string;
  status: string;
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
      // Fetch work orders from Supabase
      const { data: workOrderData, error: workOrderError } = await supabase
        .from('work_orders')
        .select('technician_id, status');
        
      if (workOrderError) {
        console.warn('Error fetching work orders:', workOrderError);
        setError(workOrderError.message);
        return [];
      }

      return workOrderData || [];
    } catch (err) {
      console.error('Error fetching work orders:', err);
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
