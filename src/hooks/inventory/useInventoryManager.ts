
import { useInventoryAlerts } from "./useInventoryAlerts";
import { useAutoReorder, type AutoReorderSettings } from "./useAutoReorder";
import { useManualReorder } from "./useManualReorder";
import { getInventoryItemById } from "@/services/inventoryService";
import { useEffect, useCallback } from "react";
import { toast } from "@/hooks/use-toast";

export type { AutoReorderSettings } from "./useAutoReorder";

export function useInventoryManager() {
  const { lowStockItems, outOfStockItems, checkInventoryAlerts } = useInventoryAlerts();
  const { autoReorderSettings, enableAutoReorder, disableAutoReorder, placeAutomaticOrder } = useAutoReorder();
  const { reorderItem } = useManualReorder();

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
      const item = await getInventoryItemById(itemId);
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
  }, []);
  
  // Function to reserve inventory for a work order
  const reserveInventory = useCallback(async (items: {id: string, quantity: number}[]) => {
    // In a real app, this would update a database
    // For this demo, we just validate and show toast messages
    
    const unavailableItemsPromises = items.map(async item => {
      const availability = await checkItemAvailability(item.id, item.quantity);
      if (!availability.available) {
        const inventoryItem = await getInventoryItemById(item.id);
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
  }, [checkItemAvailability]);

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    checkInventoryAlerts: () => checkInventoryAlerts(placeAutomaticOrder, autoReorderSettings),
    reorderItem,
    checkItemAvailability,
    reserveInventory
  };
}
