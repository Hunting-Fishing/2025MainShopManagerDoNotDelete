
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { getAllWorkOrders } from '@/services/workOrder';
import { handleApiError } from '@/utils/errorHandling';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();

  // Memoized fetch function to prevent unnecessary re-renders
  const fetchWorkOrders = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching work orders for authenticated user...');
      const data = await getAllWorkOrders();
      setWorkOrders(data || []);
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to fetch work orders';
      setError(errorMessage);
      console.error('Work orders fetch error:', err);
      handleApiError(err, 'Failed to fetch work orders');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    
    // Don't fetch if still loading auth or not authenticated
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping work orders fetch');
      if (isMounted) {
        setLoading(false);
        setWorkOrders([]);
      }
      return;
    }

    fetchWorkOrders();

    return () => {
      isMounted = false;
    };
  }, [isAuthenticated, authLoading, fetchWorkOrders]);

  return { workOrders, loading, error, setWorkOrders, refetch: fetchWorkOrders };
}
