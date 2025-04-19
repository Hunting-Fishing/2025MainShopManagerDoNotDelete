
import { useState } from "react";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { supabase } from "@/lib/supabase";
import { handleStatusTransition, generateStatusChangeMessage } from "@/utils/workOrders/statusManagement";
import { toast } from "@/hooks/use-toast";
import { updateWorkOrder } from "@/utils/workOrders";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";

export function useWorkOrderStatus() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (
    workOrder: WorkOrder,
    newStatus: WorkOrderStatusType,
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    if (workOrder.status === newStatus) {
      return workOrder; // No change needed
    }
    
    setIsUpdating(true);
    
    try {
      // Get updates based on the transition
      const updates = handleStatusTransition(workOrder, newStatus);
      
      // Update the work order with new status
      const updatedWorkOrder = await updateWorkOrder({
        ...workOrder,
        ...updates,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      });
      
      // Record this activity
      const activityMessage = generateStatusChangeMessage(
        workOrder.status,
        newStatus,
        userName
      );
      
      await recordWorkOrderActivity(
        activityMessage,
        workOrder.id,
        userId,
        userName
      );
      
      // Show success message
      toast({
        title: "Status Updated",
        description: `Work order status updated to ${newStatus}`,
      });
      
      return updatedWorkOrder;
    } catch (error) {
      console.error("Failed to update work order status:", error);
      toast({
        title: "Update Failed",
        description: "Could not update work order status",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
}
