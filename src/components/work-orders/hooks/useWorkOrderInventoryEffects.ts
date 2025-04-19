
import { useEffect } from "react";
import { WorkOrder } from "@/types/workOrder";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { toast } from "@/hooks/use-toast";

/**
 * Hook that handles inventory-related side effects when work order status changes
 */
export const useWorkOrderInventoryEffects = (
  workOrder: WorkOrder,
  previousStatus?: string
) => {
  const { consumeWorkOrderInventory, reserveInventory } = useInventoryManager();
  
  // Handle inventory effects when work order status changes
  useEffect(() => {
    // Skip if there are no inventory items or if status hasn't changed
    if (!workOrder?.inventoryItems?.length || workOrder.status === previousStatus) {
      return;
    }
    
    const inventoryItems = workOrder.inventoryItems.filter(
      item => !item.itemStatus || item.itemStatus === "in-stock"
    );
    
    // Skip if no regular inventory items (only special orders, etc.)
    if (!inventoryItems.length) return;
    
    // If work order is completed, consume inventory
    if (workOrder.status === "completed" && previousStatus !== "completed") {
      const itemsData = inventoryItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      
      consumeWorkOrderInventory(itemsData)
        .then(success => {
          if (success) {
            toast({
              title: "Inventory Updated",
              description: "Inventory items have been deducted from stock"
            });
          }
        });
    }
    
    // If work order is moved to in-progress, reserve inventory
    else if (workOrder.status === "in-progress" && previousStatus !== "in-progress") {
      const itemsData = inventoryItems.map(item => ({
        id: item.id,
        quantity: item.quantity
      }));
      
      reserveInventory(itemsData);
    }
  }, [workOrder?.status, workOrder?.inventoryItems, previousStatus]);
};
