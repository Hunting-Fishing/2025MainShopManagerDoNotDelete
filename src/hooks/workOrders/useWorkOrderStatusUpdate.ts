
import { useState } from "react";
import { WorkOrder } from "@/types/workOrder";
import { isValidStatusTransition } from "@/utils/workOrders/statusManagement";
import { updateWorkOrder } from "@/utils/workOrders/crud";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";
import { toast } from "@/hooks/use-toast";

export const useWorkOrderStatusUpdate = () => {
  const [isUpdating, setIsUpdating] = useState<boolean>(false);

  const updateStatus = async (
    workOrder: WorkOrder,
    newStatus: WorkOrder["status"],
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    setIsUpdating(true);

    try {
      // Check if the status transition is valid
      if (!isValidStatusTransition(workOrder.status, newStatus)) {
        toast({
          title: "Invalid Status Change",
          description: `Cannot change status from ${workOrder.status} to ${newStatus}`,
          variant: "destructive",
        });
        return null;
      }

      // Create an updated work order object
      const updatedWorkOrder: WorkOrder = {
        ...workOrder,
        status: newStatus,
        lastUpdatedBy: userName,
        lastUpdatedAt: new Date().toISOString(),
      };

      // Update the work order in the database
      await updateWorkOrder(updatedWorkOrder);

      // Record the status change activity
      await recordWorkOrderActivity(
        `Status changed from ${workOrder.status} to ${newStatus}`,
        workOrder.id,
        userId,
        userName
      );

      toast({
        title: "Status Updated",
        description: `Work order status changed to ${newStatus}`,
      });

      return updatedWorkOrder;
    } catch (error) {
      console.error("Error updating status:", error);
      toast({
        title: "Status Update Failed",
        description: "An error occurred while updating the status.",
        variant: "destructive",
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  return { updateStatus, isUpdating };
};
