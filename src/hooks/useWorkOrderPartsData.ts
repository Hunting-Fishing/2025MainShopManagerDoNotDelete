
import { useState, useEffect, useCallback } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getWorkOrderParts } from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

export function useWorkOrderPartsData(workOrderId: string) {
  const [parts, setParts] = useState<WorkOrderPart[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchParts = useCallback(async () => {
    if (!workOrderId) {
      console.log('No work order ID provided, skipping parts fetch');
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching parts for work order:', workOrderId);
      
      const partsData = await getWorkOrderParts(workOrderId);
      console.log('Parts fetched successfully:', partsData.length, 'parts');
      setParts(partsData);
    } catch (err) {
      console.error('Error fetching parts:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch parts';
      setError(errorMessage);
      
      // Only show toast for unexpected errors, not for empty results
      if (!errorMessage.includes('No parts found')) {
        toast.error(`Failed to load parts: ${errorMessage}`);
      }
      
      // Set empty array on error to prevent showing stale data
      setParts([]);
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
    } else {
      setIsLoading(false);
      setParts([]);
      setError(null);
    }
  }, [workOrderId, fetchParts]);

  return {
    parts,
    isLoading,
    error,
    refreshParts
  };
}
