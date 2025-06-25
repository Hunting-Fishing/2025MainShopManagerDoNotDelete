
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
    // Don't fetch if auth is still loading
    if (authLoading) {
      console.log('useWorkOrders: Auth still loading, waiting...');
      return;
    }

    // Don't fetch if not authenticated
    if (!isAuthenticated) {
      console.log('useWorkOrders: User not authenticated, clearing data');
      setWorkOrders([]);
      setLoading(false);
      setError(null);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      console.log('useWorkOrders: Fetching work orders for authenticated user...');
      
      const data = await getAllWorkOrders();
      console.log('useWorkOrders: Received data:', data);
      
      // Ensure data is always an array
      const safeData = Array.isArray(data) ? data : [];
      setWorkOrders(safeData);
      
    } catch (err: any) {
      console.error('useWorkOrders: Error fetching work orders:', err);
      const errorMessage = err?.message || 'Failed to fetch work orders';
      setError(errorMessage);
      setWorkOrders([]); // Set empty array on error
      
      // Handle API errors but don't throw
      try {
        handleApiError(err, 'Failed to fetch work orders');
      } catch (handleError) {
        console.error('useWorkOrders: Error in handleApiError:', handleError);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    let isMounted = true;
    
    console.log('useWorkOrders: Effect triggered', { authLoading, isAuthenticated });
    
    // Add delay to ensure auth state is stable
    const timer = setTimeout(() => {
      if (isMounted) {
        fetchWorkOrders();
      }
    }, 100);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [fetchWorkOrders]);

  return { 
    workOrders, 
    loading, 
    error, 
    setWorkOrders, 
    refetch: fetchWorkOrders 
  };
}
