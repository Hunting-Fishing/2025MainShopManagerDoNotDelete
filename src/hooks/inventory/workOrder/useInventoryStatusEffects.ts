
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { toast } from "@/hooks/use-toast";

/**
 * Hook to manage inventory status effects when work order status changes
 */
export const useInventoryStatusEffects = (
  form: UseFormReturn<WorkOrderFormFieldValues>,
  consumeWorkOrderInventory: (items: {id: string, quantity: number}[]) => Promise<any>,
  reserveInventory: (items: {id: string, quantity: number}[]) => Promise<any>
) => {
  // Handle inventory when work order status changes
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // When work order status changes to completed, consume inventory
      if (name === "status" && value.status === "completed") {
        const items = value.inventoryItems || [];
        
        if (items.length > 0) {
          // Prepare items for consumption
          const itemsToConsume = items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }));
          
          // Actually update the inventory quantities
          consumeWorkOrderInventory(itemsToConsume).then(result => {
            if (!result.success) {
              // Show warning about inventory issues
              toast({
                title: "Inventory Warning",
                description: result.message || "Some items could not be consumed. Check inventory levels.",
                variant: "warning"
              });
            }
          });
        }
      }
      // When work order is just started (in-progress), reserve but don't consume inventory
      else if (name === "status" && value.status === "in-progress") {
        const items = value.inventoryItems || [];
        
        if (items.length > 0) {
          // Prepare items for reservation
          const itemsToReserve = items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }));
          
          // Attempt to reserve the inventory
          reserveInventory(itemsToReserve).then(result => {
            if (!result.success) {
              // Show warning about inventory availability issues
              toast({
                title: "Inventory Warning",
                description: result.message || "Some items have insufficient inventory. Please review inventory levels.",
                variant: "warning"
              });
            }
          });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, reserveInventory, consumeWorkOrderInventory]);
  
  return {};
};
