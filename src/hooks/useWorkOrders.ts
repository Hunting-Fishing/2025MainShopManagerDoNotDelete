
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { getAllWorkOrders } from '@/services/workOrder';
import { handleApiError } from '@/utils/errorHandling';
import { useAuthUser } from '@/hooks/useAuthUser';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, isLoading: authLoading } = useAuthUser();

  useEffect(() => {
    // Don't fetch if still loading auth or not authenticated
    if (authLoading) return;
    
    if (!isAuthenticated) {
      console.log('User not authenticated, skipping work orders fetch');
      setLoading(false);
      setWorkOrders([]);
      return;
    }

    const fetchWorkOrders = async () => {
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
    };

    fetchWorkOrders();
  }, [isAuthenticated, authLoading]);

  return { workOrders, loading, error, setWorkOrders };
}
