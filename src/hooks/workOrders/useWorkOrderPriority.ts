
import { useState } from "react";
import { WorkOrder } from "@/types/workOrder";
import { calculateWorkOrderPriority, updatePriorityBasedOnDueDate } from "@/utils/workOrders/priorityManagement";
import { updateWorkOrder } from "@/utils/workOrders";
import { toast } from "@/hooks/use-toast";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";

export function useWorkOrderPriority() {
  const [isUpdating, setIsUpdating] = useState(false);

  const updatePriority = async (
    workOrder: WorkOrder,
    newPriority: WorkOrder["priority"],
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    if (workOrder.priority === newPriority) {
      return workOrder;
    }
    
    setIsUpdating(true);
    
    try {
      const updatedWorkOrder = await updateWorkOrder({
        ...workOrder,
        priority: newPriority,
        lastUpdatedBy: userId,
        lastUpdatedAt: new Date().toISOString()
      });
      
      await recordWorkOrderActivity(
        `Priority changed from ${workOrder.priority} to ${newPriority} by ${userName}`,
        workOrder.id,
        userId,
        userName
      );
      
      toast({
        title: "Priority Updated",
        description: `Work order priority is now ${newPriority}`,
      });
      
      return updatedWorkOrder;
    } catch (error) {
      console.error("Failed to update work order priority:", error);
      toast({
        title: "Update Failed",
        description: "Could not update work order priority",
        variant: "destructive"
      });
      return null;
    } finally {
      setIsUpdating(false);
    }
  };

  const recalculatePriority = async (
    workOrder: WorkOrder,
    userId: string,
    userName: string
  ): Promise<WorkOrder | null> => {
    const calculatedPriority = calculateWorkOrderPriority(workOrder);
    
    if (workOrder.priority === calculatedPriority) {
      return workOrder;
    }
    
    return updatePriority(workOrder, calculatedPriority, userId, userName);
  };

  return { updatePriority, recalculatePriority, isUpdating };
}
