
import { useWorkflowRules } from './useWorkflowRules';
import { WorkOrder } from '@/types/workOrder';
import { useWorkOrderStatusManagement } from './useWorkOrderStatusManagement';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/hooks/useAuth';
import { toast } from '@/hooks/use-toast';

export function useWorkOrderAutomation() {
  const { evaluateWorkflowRules } = useWorkflowRules();
  const { updateStatus } = useWorkOrderStatusManagement();
  const { user } = useAuth();

  const handleStatusChange = async (workOrder: WorkOrder) => {
    try {
      const nextStatus = await evaluateWorkflowRules(workOrder);
      
      if (nextStatus && nextStatus !== workOrder.status) {
        await updateStatus(
          workOrder,
          nextStatus,
          user?.id || '',
          'Automated System'
        );

        toast({
          title: "Status Updated",
          description: `Work order status automatically updated to ${nextStatus}`,
        });
      }
    } catch (error) {
      console.error('Error in automated status change:', error);
      toast({
        title: "Automation Error",
        description: "Failed to process automated status change",
        variant: "destructive"
      });
    }
  };

  return {
    handleStatusChange
  };
}
