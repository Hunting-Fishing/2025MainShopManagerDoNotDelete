
import { useState } from "react";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { toast } from "@/hooks/use-toast";
import { updateWorkOrder } from "@/utils/workOrders";
import { handleStatusTransition, generateStatusChangeMessage, isStatusTransitionAllowed } from "@/utils/workOrders/statusManagement";
import { recordWorkOrderActivity, recordStatusChange } from "@/utils/workOrders/activity";

/**
 * Hook for managing work order status updates
 */
export function useWorkOrderStatusManager() {
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Updates the status of a work order
   * @param workOrder - The current work order
   * @param newStatus - The status to update to
   * @param userId - The ID of the user making the update
   * @param userName - The name of the user making the update
   * @returns The updated work order or null if the update failed
   */
  const updateStatus = async (
    workOrder: WorkOrder,
    newStatus: WorkOrderStatusType,
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    // Check if this is a valid transition
    if (!isStatusTransitionAllowed(workOrder.status, newStatus)) {
      toast({
        title: "Invalid Status Change",
        description: `Cannot change from ${workOrder.status} to ${newStatus}`,
        variant: "destructive",
      });
      return workOrder; // Return original work order
    }
    
    // If no actual change, just return
    if (workOrder.status === newStatus) {
      return workOrder;
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
      
      // Record this status change activity
      await recordStatusChange(
        workOrder.id,
        workOrder.status,
        newStatus,
        userId,
        userName
      );
      
      // Show success message
      toast({
        title: "Status Updated",
        description: `Work order status is now ${newStatus}`,
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
