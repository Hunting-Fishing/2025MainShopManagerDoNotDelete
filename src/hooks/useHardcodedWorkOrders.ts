
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { hardcodedWorkOrderService } from '@/services/workOrder/HardcodedWorkOrderService';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useHardcodedWorkOrders() {
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  const fetchWorkOrders = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.log('useHardcodedWorkOrders: User not authenticated, skipping fetch');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      console.log('useHardcodedWorkOrders: Fetching work orders...');
      const data = await hardcodedWorkOrderService.getAllWorkOrders();
      
      setWorkOrders(data);
      console.log('useHardcodedWorkOrders: Successfully loaded', data.length, 'work orders');
      
      // Log cache status for debugging
      const cacheStatus = hardcodedWorkOrderService.getCacheStatus();
      console.log('useHardcodedWorkOrders: Cache status:', cacheStatus);
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch work orders';
      console.error('useHardcodedWorkOrders: Error fetching work orders:', err);
      setError(errorMessage);
      
      // Even on error, try to get cached data
      try {
        const cachedData = hardcodedWorkOrderService.getCachedWorkOrders();
        if (cachedData.length > 0) {
          setWorkOrders(cachedData);
          setError(`Using cached data: ${errorMessage}`);
          console.log('useHardcodedWorkOrders: Loaded', cachedData.length, 'cached work orders');
        }
      } catch (cacheError) {
        console.error('useHardcodedWorkOrders: Failed to load cached data:', cacheError);
      }
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading]);

  const refetch = useCallback(async () => {
    console.log('useHardcodedWorkOrders: Manual refetch requested');
    await fetchWorkOrders();
  }, [fetchWorkOrders]);

  // Initialize on mount and auth changes
  useEffect(() => {
    if (authLoading) {
      console.log('useHardcodedWorkOrders: Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated) {
      console.log('useHardcodedWorkOrders: User not authenticated, clearing data');
      setWorkOrders([]);
      setError(null);
      setLoading(false);
      setInitialized(true);
      return;
    }

    if (!initialized) {
      console.log('useHardcodedWorkOrders: Initializing work orders fetch...');
      fetchWorkOrders().finally(() => {
        setInitialized(true);
      });
    }
  }, [isAuthenticated, authLoading, initialized, fetchWorkOrders]);

  // Periodic refresh every 30 seconds when authenticated
  useEffect(() => {
    if (!isAuthenticated || !initialized) return;

    const interval = setInterval(() => {
      console.log('useHardcodedWorkOrders: Periodic refresh...');
      fetchWorkOrders();
    }, 30000);

    return () => clearInterval(interval);
  }, [isAuthenticated, initialized, fetchWorkOrders]);

  const clearCache = useCallback(() => {
    hardcodedWorkOrderService.clearCache();
    console.log('useHardcodedWorkOrders: Cache cleared');
  }, []);

  const getCacheStatus = useCallback(() => {
    return hardcodedWorkOrderService.getCacheStatus();
  }, []);

  return {
    workOrders,
    loading: loading || authLoading,
    error,
    refetch,
    clearCache,
    getCacheStatus,
    initialized
  };
}
