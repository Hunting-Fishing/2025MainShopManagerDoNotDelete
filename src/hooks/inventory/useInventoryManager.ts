
import { useInventoryAlerts } from "./useInventoryAlerts";
import { useAutoReorder, type AutoReorderSettings } from "./useAutoReorder";
import { useManualReorder } from "./useManualReorder";
import { useInventoryCrud } from "./useInventoryCrud";
import { useEffect, useCallback, useState } from "react";
import { toast } from "@/hooks/use-toast";
import { InventoryItemExtended } from "@/types/inventory";

export type { AutoReorderSettings } from "./useAutoReorder";

export function useInventoryManager() {
  const { lowStockItems, outOfStockItems, checkInventoryAlerts } = useInventoryAlerts();
  const { autoReorderSettings, enableAutoReorder, disableAutoReorder, placeAutomaticOrder } = useAutoReorder();
  const { reorderItem } = useManualReorder();
  const { getItem, updateItem, consumeInventory } = useInventoryCrud();
  const [inventoryRefreshNeeded, setInventoryRefreshNeeded] = useState(false);

  // Enhanced inventory check that runs on component mount
  useEffect(() => {
    const checkAlerts = () => checkInventoryAlerts(placeAutomaticOrder, autoReorderSettings);
    // Check alerts when component mounts
    checkAlerts();
    
    // Set up a polling interval to periodically check inventory levels
    // In a real app, this would be replaced with real-time database listeners
    const intervalId = setInterval(checkAlerts, 300000); // Check every 5 minutes
    
    return () => clearInterval(intervalId); // Clean up on unmount
  }, [checkInventoryAlerts, placeAutomaticOrder, autoReorderSettings]);
  
  // Function to check if an item can be used in a work order
  const checkItemAvailability = useCallback(async (itemId: string, requestedQuantity: number) => {
    try {
      const item = await getItem(itemId);
      if (!item) return { available: false, message: "Item not found in inventory" };
      
      if (item.quantity < requestedQuantity) {
        return { 
          available: false, 
          message: `Only ${item.quantity} units of ${item.name} available`,
          availableQuantity: item.quantity
        };
      }
      
      return { available: true };
    } catch (error) {
      console.error("Error checking item availability:", error);
      return { available: false, message: "Error checking inventory availability" };
    }
  }, [getItem]);
  
  // Function to reserve inventory for a work order
  const reserveInventory = useCallback(async (items: {id: string, quantity: number}[]) => {
    // In a real app, this would create reservations in the database
    // For now, we just validate availability
    
    const unavailableItemsPromises = items.map(async item => {
      const availability = await checkItemAvailability(item.id, item.quantity);
      if (!availability.available) {
        const inventoryItem = await getItem(item.id);
        return {
          id: item.id,
          name: inventoryItem?.name || "Unknown item",
          requestedQuantity: item.quantity,
          availableQuantity: availability.availableQuantity || 0,
          message: availability.message
        };
      }
      return null;
    });
    
    const results = await Promise.all(unavailableItemsPromises);
    const unavailableItems = results.filter(Boolean);
    
    if (unavailableItems.length > 0) {
      toast({
        title: "Inventory availability issue",
        description: `Some items have insufficient inventory`,
        variant: "destructive"
      });
      
      return { success: false, unavailableItems };
    }
    
    return { success: true };
  }, [checkItemAvailability, getItem]);

  // Function to actually consume inventory when a work order is completed
  const consumeWorkOrderInventory = useCallback(async (items: {id: string, quantity: number}[]) => {
    try {
      // First make sure all items are available
      const checkResult = await reserveInventory(items);
      if (!checkResult.success) {
        return { ...checkResult, message: "Some items have insufficient inventory" };
      }

      // If all items are available, update the inventory
      const success = await consumeInventory(items);
      
      if (success) {
        setInventoryRefreshNeeded(true);
        toast({
          title: "Inventory updated",
          description: "Inventory quantities have been updated based on work order",
          variant: "success"
        });
        return { success: true };
      } else {
        return { 
          success: false, 
          message: "Failed to update some inventory items. Please check inventory levels." 
        };
      }
    } catch (error) {
      console.error("Error consuming work order inventory:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory quantities",
        variant: "destructive"
      });
      return { success: false, message: "An unexpected error occurred" };
    }
  }, [reserveInventory, consumeInventory]);

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    checkInventoryAlerts: () => checkInventoryAlerts(placeAutomaticOrder, autoReorderSettings),
    reorderItem,
    checkItemAvailability,
    reserveInventory,
    consumeWorkOrderInventory,
    inventoryRefreshNeeded,
    clearInventoryRefreshFlag: () => setInventoryRefreshNeeded(false)
  };
}
