
import { useState } from "react";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { updateWorkOrder } from "@/utils/workOrders";
import { updateWorkOrderStatus } from "@/utils/workOrders/statusManagement";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState(false);

  const updateStatus = async (
    workOrder: WorkOrder,
    newStatus: WorkOrderStatusType,
    userId: string,
    userName: string
  ) => {
    setIsUpdating(true);

    try {
      // First validate and record the status change
      const success = await updateWorkOrderStatus(workOrder, newStatus, userId, userName);

      if (!success) {
        throw new Error("Status update validation failed");
      }

      // Update the work order
      const updatedWorkOrder = await updateWorkOrder({
        ...workOrder,
        status: newStatus,
        lastUpdatedBy: userName,
        lastUpdatedAt: new Date().toISOString()
      });

      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus}`,
      });

      return updatedWorkOrder;
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Update failed",
        description: error instanceof Error ? error.message : "Failed to update status",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    updateStatus,
    isUpdating
  };
};
