import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";

/**
 * Hook to handle inventory status effects based on work order status changes
 */
export const useInventoryStatusEffects = (
  form: UseFormReturn<WorkOrderFormFieldValues>,
  consumeWorkOrderInventory: (workOrderId: string) => Promise<boolean>,
  reserveInventory: (workOrderId: string) => Promise<boolean>
) => {
  // Watch for status changes to handle inventory effects
  const status = form.watch("status");

  useEffect(() => {
    // This is a simplified implementation
    // In a real app, you'd need to handle this more robustly
    const handleStatusChange = async () => {
      try {
        const workOrderId = "demo-work-order-id"; // This would come from form data
        
        // When status changes to completed, consume inventory
        if (status === "completed") {
          await consumeWorkOrderInventory(workOrderId);
        }
        
        // When status changes to in-progress, reserve inventory
        if (status === "in-progress") {
          await reserveInventory(workOrderId);
        }
        
        // When status changes to on-hold, keep inventory reserved
        // When status changes to cancelled, release inventory (not implemented)
      } catch (error) {
        console.error("Error handling inventory status effects:", error);
      }
    };

    // Only run effect if status is defined
    if (status) {
      handleStatusChange();
    }
  }, [status, consumeWorkOrderInventory, reserveInventory]);

  return null; // This hook doesn't return any values
};
