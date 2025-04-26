
import { useState, useEffect } from "react";
import { 
  getAutoReorderSettings as getAutoReorderSettingsService, 
  enableAutoReorder as enableAutoReorderService
} from "@/services/inventory/autoReorderService";
import { getInventoryItemById } from "@/services/inventory/crudService";
import { useNotifications } from "@/context/NotificationsContext";
import { toast } from "@/hooks/use-toast";

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export function useAutoReorder() {
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const [loading, setLoading] = useState(true);
  const { addNotification } = useNotifications();

  // Load auto-reorder settings
  useEffect(() => {
    async function loadSettings() {
      try {
        const settings = await getAutoReorderSettingsService(null);
        if (settings) {
          const formattedSettings: Record<string, AutoReorderSettings> = {};
          settings.forEach(setting => {
            formattedSettings[setting.itemId] = {
              enabled: setting.enabled,
              threshold: setting.threshold,
              quantity: setting.quantity
            };
          });
          setAutoReorderSettings(formattedSettings);
        }
      } catch (error) {
        console.error("Error loading auto-reorder settings:", error);
      } finally {
        setLoading(false);
      }
    }
    
    loadSettings();
  }, []);

  // Function to enable auto-reordering for an item
  const enableAutoReorder = async (itemId: string, threshold: number, quantity: number) => {
    try {
      const success = await enableAutoReorderService(itemId, threshold, quantity);
      
      if (success) {
        // Update local state
        setAutoReorderSettings(prev => ({
          ...prev,
          [itemId]: { enabled: true, threshold, quantity }
        }));
        
        toast({
          title: "Auto-reorder enabled",
          description: `Auto-reorder has been enabled for this item when stock falls below ${threshold}`,
        });

        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to enable auto-reorder",
          variant: "destructive",
        });
        
        return false;
      }
    } catch (error) {
      console.error("Error enabling auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to enable auto-reorder",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Function to disable auto-reordering for an item
  const disableAutoReorder = async (itemId: string) => {
    try {
      // Call to service function to disable auto-reorder
      const { error } = await fetch(`/api/inventory/auto-reorder/${itemId}`, {
        method: 'DELETE',
      }).then(res => res.json());
      
      if (error) throw new Error(error);
      
      // Update local state
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
      
      return true;
    } catch (error) {
      console.error("Error disabling auto-reorder:", error);
      toast({
        title: "Error",
        description: "Failed to disable auto-reorder",
        variant: "destructive",
      });
      
      return false;
    }
  };

  // Function to place an automatic order
  const placeAutomaticOrder = async (itemId: string) => {
    try {
      const item = await getInventoryItemById(itemId);
      if (!item) return;
      
      const orderQuantity = autoReorderSettings[itemId]?.quantity || 10;
      
      // In a real app, this would connect to a purchasing API
      // For now, we'll just show a toast notification
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

      return true;
    } catch (error) {
      console.error("Error placing automatic order:", error);
      return false;
    }
  };

  return {
    autoReorderSettings,
    loading,
    enableAutoReorder,
    disableAutoReorder,
    placeAutomaticOrder
  };
}
