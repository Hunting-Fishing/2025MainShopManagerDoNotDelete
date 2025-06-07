
import { useState, useEffect, useCallback, useRef } from 'react';
import { ServiceSector } from '@/types/serviceHierarchy';
import { fetchServiceSectors } from '@/lib/services/serviceApi';
import { useToast } from '@/hooks/use-toast';

interface ServiceManagementState {
  sectors: ServiceSector[];
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}

let globalState: ServiceManagementState = {
  sectors: [],
  loading: false,
  error: null,
  lastUpdated: null
};

let subscribers: Set<() => void> = new Set();
let fetchPromise: Promise<ServiceSector[]> | null = null;

export function useServiceManagementState() {
  const [state, setState] = useState<ServiceManagementState>(globalState);
  const { toast } = useToast();
  const mountedRef = useRef(true);

  useEffect(() => {
    const subscriber = () => {
      if (mountedRef.current) {
        setState({ ...globalState });
      }
    };
    
    subscribers.add(subscriber);
    
    return () => {
      mountedRef.current = false;
      subscribers.delete(subscriber);
    };
  }, []);

  const notifySubscribers = useCallback(() => {
    subscribers.forEach(callback => callback());
  }, []);

  const updateGlobalState = useCallback((updates: Partial<ServiceManagementState>) => {
    globalState = { ...globalState, ...updates };
    notifySubscribers();
  }, [notifySubscribers]);

  const fetchData = useCallback(async (force = false) => {
    // Prevent duplicate fetches unless forced
    if (!force && (globalState.loading || fetchPromise)) {
      return fetchPromise;
    }

    // Check if we have recent data (less than 30 seconds old)
    if (!force && globalState.lastUpdated && globalState.sectors.length > 0) {
      const timeDiff = Date.now() - globalState.lastUpdated.getTime();
      if (timeDiff < 30000) {
        console.log('Using cached service data');
        return Promise.resolve(globalState.sectors);
      }
    }

    updateGlobalState({ loading: true, error: null });
    
    fetchPromise = fetchServiceSectors()
      .then((sectors) => {
        updateGlobalState({
          sectors,
          loading: false,
          error: null,
          lastUpdated: new Date()
        });
        
        console.log(`Service data fetched: ${sectors.length} sectors`);
        fetchPromise = null;
        return sectors;
      })
      .catch((error) => {
        console.error('Service fetch error:', error);
        
        let errorMessage = 'Failed to fetch service data';
        
        // Handle specific error types
        if (error?.message?.includes('406')) {
          errorMessage = 'Database access denied. Please check permissions.';
        } else if (error?.message?.includes('401')) {
          errorMessage = 'Authentication required. Please log in.';
        } else if (error?.message?.includes('403')) {
          errorMessage = 'Insufficient permissions to access service data.';
        } else if (error?.message) {
          errorMessage = error.message;
        }
        
        updateGlobalState({
          loading: false,
          error: errorMessage
        });
        
        // Only show toast for critical errors, not for expected empty states
        if (!error?.message?.includes('No sectors found')) {
          toast({
            title: "Service Data Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
        
        fetchPromise = null;
        throw error;
      });

    return fetchPromise;
  }, [updateGlobalState, toast]);

  const refetch = useCallback(() => {
    return fetchData(true);
  }, [fetchData]);

  // Auto-fetch on mount if no data
  useEffect(() => {
    if (globalState.sectors.length === 0 && !globalState.loading && !globalState.error) {
      fetchData().catch(error => {
        console.log('Initial fetch failed, but this is expected for empty databases:', error);
      });
    }
  }, [fetchData]);

  return {
    ...state,
    refetch,
    fetchData
  };
}
