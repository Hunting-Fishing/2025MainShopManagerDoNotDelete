
import { useState, useEffect, useCallback } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts } from '@/services/workOrder';
import { toast } from 'sonner';

export function useWorkOrderPartsData(workOrderId: string) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching parts for work order:', workOrderId);
      
      const partsData = await getWorkOrderParts(workOrderId);
      console.log('Parts fetched successfully:', partsData.length);
      setParts(partsData);
    } catch (err) {
      console.error('Error fetching parts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parts';
      setError(errorMessage);
      toast.error(`Failed to load parts: ${errorMessage}`);
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId]);

  const refreshParts = useCallback(async () => {
    console.log('Refreshing parts data...');
    await fetchParts();
  }, [fetchParts]);

  useEffect(() => {
    if (workOrderId) {
      fetchParts();
    }
  }, [workOrderId, fetchParts]);

  return {
    parts,
    isLoading,
    error,
    refreshParts
  };
}
