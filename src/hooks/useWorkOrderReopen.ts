
import { useState } from 'react';
import { updateWorkOrderStatus } from '@/services/workOrder';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderReopen() {
  const [isReopening, setIsReopening] = useState(false);

  const reopenWorkOrder = async (workOrderId: string, newStatus: string = 'in-progress') => {
    setIsReopening(true);
    
    try {
      const updatedWorkOrder = await updateWorkOrderStatus(workOrderId, newStatus);
      
      if (updatedWorkOrder) {
        toast({
          title: "Success",
          description: "Work order has been reopened and is now editable",
        });
        
        return { success: true, data: updatedWorkOrder };
      } else {
        throw new Error('Failed to reopen work order');
      }
    } catch (err: any) {
      const errorMessage = err?.message || 'Failed to reopen work order';
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive"
      });
      
      return { success: false, error: errorMessage };
    } finally {
      setIsReopening(false);
    }
  };

  return {
    reopenWorkOrder,
    isReopening
  };
}
