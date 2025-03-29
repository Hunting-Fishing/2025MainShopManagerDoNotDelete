
import { useNotifications } from "@/context/NotificationsContext";
import { inventoryItems } from "@/data/mockInventoryData";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export function useInventoryManager() {
  const { addNotification } = useNotifications();
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});

  // Check for low stock items
  const lowStockItems = inventoryItems.filter(item => 
    item.quantity <= item.reorderPoint && item.quantity > 0
  );
  
  // Check for out of stock items
  const outOfStockItems = inventoryItems.filter(item => 
    item.quantity === 0
  );

  // Function to enable auto-reordering for an item
  const enableAutoReorder = (itemId: string, threshold: number, quantity: number) => {
    setAutoReorderSettings(prev => ({
      ...prev,
      [itemId]: { enabled: true, threshold, quantity }
    }));
    
    toast({
      title: "Auto-reorder enabled",
      description: `Auto-reorder has been enabled for this item when stock falls below ${threshold}`,
    });
  };

  // Function to disable auto-reordering for an item
  const disableAutoReorder = (itemId: string) => {
    setAutoReorderSettings(prev => {
      const newSettings = { ...prev };
      if (newSettings[itemId]) {
        newSettings[itemId] = { ...newSettings[itemId], enabled: false };
      }
      return newSettings;
    });
    
    toast({
      title: "Auto-reorder disabled",
      description: "Auto-reorder has been disabled for this item",
    });
  };

  // Function to check inventory and create alerts
  const checkInventoryAlerts = () => {
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

  // Function to place an automatic order
  const placeAutomaticOrder = (itemId: string) => {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    const orderQuantity = autoReorderSettings[itemId]?.quantity || 10;
    
    // In a real app, this would connect to a purchasing API
    // For demo purposes, we'll just show a toast notification
    toast({
      title: "Automatic Order Placed",
      description: `Ordered ${orderQuantity} units of ${item.name}`,
    });
    
    addNotification({
      title: "Automatic Order Placed",
      message: `Ordered ${orderQuantity} units of ${item.name}`,
      type: "info",
      link: "/inventory"
    });
  };

  // Function to manually reorder an item
  const reorderItem = (itemId: string, quantity: number) => {
    const item = inventoryItems.find(item => item.id === itemId);
    if (!item) return;
    
    toast({
      title: "Order Placed",
      description: `Manually ordered ${quantity} units of ${item.name}`,
    });
    
    addNotification({
      title: "Order Placed",
      message: `Manually ordered ${quantity} units of ${item.name}`,
      type: "success",
      link: "/inventory"
    });
  };

  return {
    lowStockItems,
    outOfStockItems,
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    checkInventoryAlerts,
    reorderItem
  };
}
