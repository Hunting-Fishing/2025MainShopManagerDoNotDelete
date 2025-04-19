
import { useState } from "react";
import { WorkOrder } from "@/types/workOrder";
import { updateWorkOrderPriority } from "@/utils/workOrders/priorityManagement";
import { useToast } from "@/hooks/use-toast";

export const useWorkOrderPriority = (workOrder: WorkOrder) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const { toast } = useToast();

  const updatePriority = async (newPriority: WorkOrder["priority"], userId: string) => {
    setIsUpdating(true);
    try {
      const { success, error } = await updateWorkOrderPriority(
        workOrder.id,
        newPriority,
        userId
      );

      if (!success) {
        throw new Error(error);
      }

      toast({
        title: "Priority Updated",
        description: `Work order priority changed to ${newPriority}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update priority",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    isUpdating,
    updatePriority,
  };
};
