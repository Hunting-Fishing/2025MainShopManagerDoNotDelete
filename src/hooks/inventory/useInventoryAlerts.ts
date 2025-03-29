
import { inventoryItems } from "@/data/mockInventoryData";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "@/hooks/use-toast";

export function useInventoryAlerts() {
  const { addNotification } = useNotifications();

  // Check for low stock items
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity <= item.reorderPoint && item.quantity > 0
  );
  
  // Check for out of stock items
  const outOfStockItems = inventoryItems.filter(item => 
    item.quantity === 0
  );

  // Function to check inventory and create alerts
  const checkInventoryAlerts = (placeAutomaticOrder: (itemId: string) => void, autoReorderSettings: Record<string, { enabled: boolean; threshold: number; quantity: number }>) => {
    // Check for items that need attention
    lowStockItems.forEach(item => {
      // Create a notification for low stock
      addNotification({
        title: "Low Stock Alert",
        message: `${item.name} is running low (${item.quantity} remaining)`,
        type: "warning",
        link: "/inventory"
      });
      
      // Check if auto-reorder is enabled and threshold is met
      if (
        autoReorderSettings[item.id] && 
        autoReorderSettings[item.id].enabled && 
        item.quantity <= autoReorderSettings[item.id].threshold
      ) {
        placeAutomaticOrder(item.id);
      }
    });

    outOfStockItems.forEach(item => {
      // Create a notification for out of stock
      addNotification({
        title: "Out of Stock Alert",
        message: `${item.name} is out of stock and needs to be reordered`,
        type: "error",
        link: "/inventory"
      });
      
      // Auto-reorder if enabled
      if (autoReorderSettings[item.id] && autoReorderSettings[item.id].enabled) {
        placeAutomaticOrder(item.id);
      }
    });
  };

  return {
    lowStockItems,
    outOfStockItems,
    checkInventoryAlerts,
  };
}
