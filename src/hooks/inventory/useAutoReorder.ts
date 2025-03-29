
import { useState } from "react";
import { inventoryItems } from "@/data/mockInventoryData";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "@/hooks/use-toast";

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export function useAutoReorder() {
  const { addNotification } = useNotifications();
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});

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

  return {
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    placeAutomaticOrder
  };
}
