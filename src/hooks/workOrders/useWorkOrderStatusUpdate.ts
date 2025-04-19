
import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { isValidStatusTransition } from "@/utils/workOrders/statusManagement";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (
    workOrder: WorkOrder,
    newStatus: WorkOrderStatusType,
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    if (!isValidStatusTransition(workOrder.status, newStatus)) {
      toast({
        title: "Invalid Status Transition",
        description: `Cannot change status from '${workOrder.status}' to '${newStatus}'`,
        variant: "destructive"
      });
      return null;
    }

    setIsUpdating(true);

    try {
      // Update the work order status
      const { data, error } = await supabase
        .from('work_orders')
        .update({ status: newStatus })
        .eq('id', workOrder.id)
        .select('*')
        .single();

      if (error) throw error;

      // Record the activity
      await supabase.rpc('record_work_order_activity', {
        p_action: `status_changed_to_${newStatus}`,
        p_work_order_id: workOrder.id,
        p_user_id: userId,
        p_user_name: userName
      });

      const updatedWorkOrder = {
        ...workOrder,
        status: newStatus
      };

      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus}`,
      });

      return updatedWorkOrder;
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
};
