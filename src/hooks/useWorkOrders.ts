
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
    if (isAuthenticated && !authLoading) {
      console.log('useWorkOrders: Fetching work orders for authenticated user...');
      await fetchWorkOrders();
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
      refetch();
      setInitialized(true);
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
