
import { useState, useEffect } from "react";
import { InventoryItemExtended } from "@/types/inventory";
import { getLowStockItems, getOutOfStockItems } from "@/services/inventory/filterService";
import { useNotifications } from "@/context/NotificationsContext";

export function useInventoryAlerts() {
  const [lowStockItems, setLowStockItems] = useState<InventoryItemExtended[]>([]);
  const [outOfStockItems, setOutOfStockItems] = useState<InventoryItemExtended[]>([]);
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Load low stock and out of stock items
  useEffect(() => {
    async function loadAlertItems() {
      try {
        const [lowItems, outItems] = await Promise.all([
          getLowStockItems(),
          getOutOfStockItems()
        ]);
        
        setLowStockItems(lowItems);
        setOutOfStockItems(outItems);
      } catch (error) {
        console.error("Error loading inventory alerts:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadAlertItems();
  }, []);

  // Function to check inventory and create alerts
  const checkInventoryAlerts = async (
    placeAutomaticOrder: (itemId: string) => void, 
    autoReorderSettings: Record<string, { enabled: boolean; threshold: number; quantity: number }>
  ) => {
    try {
      // Reload the data
      const [lowItems, outItems] = await Promise.all([
        getLowStockItems(),
        getOutOfStockItems()
      ]);
      
      setLowStockItems(lowItems);
      setOutOfStockItems(outItems);
      
      // Create notifications for low stock items
      lowItems.forEach(item => {
        addNotification({
          title: "Low Stock Alert",
          message: `${item.name} is running low (${item.quantity} remaining)`,
          type: "warning",
          link: "/inventory",
          // Adding duration property to make notifications stay visible longer
          duration: 8000
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

      // Create notifications for out of stock items
      outItems.forEach(item => {
        addNotification({
          title: "Out of Stock Alert",
          message: `${item.name} is out of stock and needs to be reordered`,
          type: "error",
          link: "/inventory",
          // Adding duration property to make notifications stay visible longer
          duration: 10000
        });
        
        // Auto-reorder if enabled
        if (autoReorderSettings[item.id] && autoReorderSettings[item.id].enabled) {
          placeAutomaticOrder(item.id);
        }
      });
    } catch (error) {
      console.error("Error checking inventory alerts:", error);
    }
  };

  return {
    lowStockItems,
    outOfStockItems,
    loading,
    checkInventoryAlerts,
  };
}
