
import { useState, useEffect } from 'react';
import { WorkOrder } from '@/types/workOrder';
import { getWorkOrderById } from '@/services/workOrder';

export function useWorkOrder(workOrderId: string) {
  const [workOrder, setWorkOrder] = useState<WorkOrder | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!workOrderId) return;

    const fetchWorkOrder = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await getWorkOrderById(workOrderId);
        setWorkOrder(data);
      } catch (err) {
        setError(err as Error);
        console.error('Error fetching work order:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchWorkOrder();
  }, [workOrderId]);

  return { workOrder, isLoading, error };
}
