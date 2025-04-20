
import { useState } from 'react';
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
  const [isAutomating, setIsAutomating] = useState(false);

  const handleStatusChange = async (workOrder: WorkOrder) => {
    try {
      setIsAutomating(true);
      const nextStatus = await evaluateWorkflowRules(workOrder);
      
      if (nextStatus && nextStatus !== workOrder.status) {
        // Record automated notification
        await supabase
          .from('work_order_notifications')
          .insert({
            work_order_id: workOrder.id,
            notification_type: 'automation',
            title: 'Automated Status Change',
            message: `Work order status automatically updated from ${workOrder.status} to ${nextStatus}`,
            recipient_type: 'system',
            recipient_id: user?.id || 'system',
            status: 'pending'
          });
        
        // Update the status
        await updateStatus(
          workOrder,
          nextStatus,
          user?.id || '',
          'Automated System'
        );

        toast({
          title: "Automation Triggered",
          description: `Work order status automatically updated to ${nextStatus}`,
          variant: "default",
        });
        
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error in automated status change:', error);
      toast({
        title: "Automation Error",
        description: "Failed to process automated status change",
        variant: "destructive"
      });
      return false;
    } finally {
      setIsAutomating(false);
    }
  };

  return {
    handleStatusChange,
    isAutomating
  };
}
