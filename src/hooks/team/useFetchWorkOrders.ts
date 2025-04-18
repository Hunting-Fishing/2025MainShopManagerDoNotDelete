
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
      // Check if the work_orders table exists first
      const { data: tableExists, error: tableCheckError } = await supabase
        .rpc('check_if_table_exists', { table_name: 'work_orders' });
      
      if (tableCheckError) {
        console.warn("Error checking if work_orders table exists:", tableCheckError);
      }
      
      if (!tableExists) {
        console.info("Work orders table doesn't exist yet, returning empty array");
        return [];
      }
      
      // Fetch work orders if the table exists
      const { data, error } = await supabase
        .from('work_orders')
        .select('id, status, technician_id, created_at');
        
      if (error) {
        // If there's an error but it's just that the table doesn't exist, return empty array
        if (error.code === '42P01') {  // PostgreSQL code for undefined_table
          console.info("Work orders table doesn't exist yet, returning empty array");
          return [];
        }
        
        console.error("Error fetching work orders:", error);
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
