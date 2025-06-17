
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { getAllWorkOrders } from '@/services/workOrder';
import { handleApiError } from '@/utils/errorHandling';

export function useWorkOrders() {
  const [workOrders, setWorkOrders] = useState<WorkOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWorkOrders = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await getAllWorkOrders();
        setWorkOrders(data || []);
      } catch (err: any) {
        const errorMessage = err?.message || 'Failed to fetch work orders';
        setError(errorMessage);
        handleApiError(err, 'Failed to fetch work orders');
      } finally {
        setLoading(false);
      }
    };

    fetchWorkOrders();
  }, []);

  return { workOrders, loading, error, setWorkOrders };
}
