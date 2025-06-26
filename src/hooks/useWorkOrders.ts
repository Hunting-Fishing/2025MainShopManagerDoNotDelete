
import { useState, useEffect, useCallback } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { useWorkOrderService } from './useWorkOrderService';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useWorkOrders() {
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();
  const { 
    workOrders, 
    loading, 
    error, 
    fetchWorkOrders 
  } = useWorkOrderService();

  const [initialized, setInitialized] = useState(false);

  const refetch = useCallback(async () => {
    if (!isAuthenticated || authLoading) {
      console.log('useWorkOrders: User not authenticated or auth loading, skipping fetch');
      return;
    }

    console.log('useWorkOrders: Refetching work orders for authenticated user...');
    try {
      await fetchWorkOrders();
      console.log('useWorkOrders: Successfully refetched work orders');
    } catch (err) {
      console.error('useWorkOrders: Error during refetch:', err);
    }
  }, [isAuthenticated, authLoading, fetchWorkOrders]);

  useEffect(() => {
    if (authLoading) {
      console.log('useWorkOrders: Auth still loading, waiting...');
      return;
    }

    if (!isAuthenticated) {
      console.log('useWorkOrders: User not authenticated, clearing data');
      setInitialized(true);
      return;
    }

    if (!initialized) {
      console.log('useWorkOrders: Initializing work orders fetch...');
      refetch().then(() => {
        setInitialized(true);
        console.log('useWorkOrders: Initialization complete');
      }).catch((err) => {
        console.error('useWorkOrders: Initialization failed:', err);
        setInitialized(true); // Set to true anyway to prevent infinite retries
      });
    }
  }, [isAuthenticated, authLoading, initialized, refetch]);

  // Legacy setter function for backward compatibility
  const setWorkOrders = useCallback((updater: WorkOrder[] | ((prev: WorkOrder[]) => WorkOrder[])) => {
    console.warn('setWorkOrders is deprecated. Use the service methods instead.');
    // For backward compatibility, we'll allow this but it won't persist
    if (typeof updater === 'function') {
      // Can't easily support function updaters without exposing internal state
      console.warn('Function updaters not supported in refactored version');
    }
  }, []);

  return { 
    workOrders: workOrders || [], 
    loading: loading || authLoading, 
    error, 
    setWorkOrders, 
    refetch 
  };
}
