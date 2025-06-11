
import { useState } from 'react';
import { WorkOrderPart } from '@/types/workOrderPart';
import { getJobLineParts, deleteWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

export function useParts() {
  const [isLoading, setIsLoading] = useState(false);

  const fetchJobLineParts = async (jobLineId: string): Promise<WorkOrderPart[]> => {
    try {
      setIsLoading(true);
      return await getJobLineParts(jobLineId);
    } catch (error) {
      console.error('Error fetching parts:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  };

  const removePart = async (partId: string): Promise<boolean> => {
    try {
      setIsLoading(true);
      return await deleteWorkOrderPart(partId);
    } catch (error) {
      console.error('Error removing part:', error);
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    isLoading,
    fetchJobLineParts,
    removePart
  };
}
