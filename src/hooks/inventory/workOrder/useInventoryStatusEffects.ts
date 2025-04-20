
import { useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/types/workOrder.d"; // Explicitly reference .d.ts file
import { WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Hook to handle inventory status changes based on work order status
 */
export const useInventoryStatusEffects = (
  form: UseFormReturn<any>,
  consumeWorkOrderInventory: Function,
  reserveInventory: Function
) => {
  // Get current values
  const status = form.watch("status");
  const inventoryItems = form.watch("inventoryItems") || [];
  
  // Effect to handle work order status changes that affect inventory
  useEffect(() => {
    // When work order is completed, consume in-stock inventory
    if (status === "completed") {
      // Only consume in-stock items, not special orders or other types
      const inStockItems = inventoryItems
        .filter(item => !item.itemStatus || item.itemStatus === "in-stock")
        .map(item => ({ id: item.id, quantity: item.quantity }));
      
      if (inStockItems.length > 0) {
        consumeWorkOrderInventory(inStockItems);
      }
    }
    // When work order is in progress, reserve inventory
    else if (status === "in-progress") {
      // Only reserve in-stock items
      const inStockItems = inventoryItems
        .filter(item => !item.itemStatus || item.itemStatus === "in-stock")
        .map(item => ({ id: item.id, quantity: item.quantity }));
      
      if (inStockItems.length > 0) {
        reserveInventory(inStockItems);
      }
    }
    // Other statuses don't affect inventory directly
  }, [status, consumeWorkOrderInventory, reserveInventory]);
  
  return null;
};
