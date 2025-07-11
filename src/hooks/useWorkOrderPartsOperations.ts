import { useCallback, useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { 
  createWorkOrderPart, 
  updateWorkOrderPart, 
  deleteWorkOrderPart 
} from '@/services/workOrder/workOrderPartsService';
import { toast } from 'sonner';

interface UseWorkOrderPartsOperationsProps {
  workOrderId: string;
  onPartsChange?: () => Promise<void>;
}

export function useWorkOrderPartsOperations({ 
  workOrderId, 
  onPartsChange 
}: UseWorkOrderPartsOperationsProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleAddPart = useCallback(async (partData: WorkOrderPartFormValues): Promise<WorkOrderPart> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Adding new part:', partData);

      const newPart = await createWorkOrderPart({
        ...partData,
        work_order_id: workOrderId,
      });

      console.log('Part added successfully:', newPart);
      
      // Refresh parts list
      if (onPartsChange) {
        await onPartsChange();
      }
      
      toast.success('Part added successfully');
      return newPart;
    } catch (err) {
      console.error('Error adding part:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to add part';
      setError(errorMessage);
      toast.error(`Failed to add part: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [workOrderId, onPartsChange]);

  const handleUpdatePart = useCallback(async (partId: string, updates: Partial<WorkOrderPart>): Promise<WorkOrderPart> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Updating part:', partId, updates);

      const updatedPart = await updateWorkOrderPart(partId, updates);

      console.log('Part updated successfully:', updatedPart);
      
      // Refresh parts list
      if (onPartsChange) {
        await onPartsChange();
      }
      
      toast.success('Part updated successfully');
      return updatedPart;
    } catch (err) {
      console.error('Error updating part:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update part';
      setError(errorMessage);
      toast.error(`Failed to update part: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onPartsChange]);

  const handleDeletePart = useCallback(async (partId: string): Promise<void> => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Deleting part:', partId);

      await deleteWorkOrderPart(partId);

      console.log('Part deleted successfully:', partId);
      
      // Refresh parts list
      if (onPartsChange) {
        await onPartsChange();
      }
      
      toast.success('Part deleted successfully');
    } catch (err) {
      console.error('Error deleting part:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete part';
      setError(errorMessage);
      toast.error(`Failed to delete part: ${errorMessage}`);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [onPartsChange]);

  return {
    isLoading,
    error,
    handleAddPart,
    handleUpdatePart,
    handleDeletePart
  };
}