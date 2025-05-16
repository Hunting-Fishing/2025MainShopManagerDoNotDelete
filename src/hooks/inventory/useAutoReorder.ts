
import { useState, useCallback } from 'react';
import { useNotifications } from '@/context/notifications';
import { AutoReorderSettings } from '@/types/inventory';

// Mock function to simulate an API call to reorder inventory
const makeReorderApiCall = (items: any[]): Promise<any> => {
  return new Promise((resolve) => {
    // Simulate API call delay
    setTimeout(() => {
      resolve({
        success: true,
        orderId: `PO-${Math.floor(Math.random() * 100000)}`,
        items: items
      });
    }, 1500);
  });
};

export function useAutoReorder() {
  const [isReordering, setIsReordering] = useState(false);
  const [lastReorderResult, setLastReorderResult] = useState<any>(null);
  const [autoReorderSettings, setAutoReorderSettings] = useState<Record<string, AutoReorderSettings>>({});
  const { addNotification } = useNotifications();

  /**
   * Automatically reorder items that are low in stock
   * @param items Array of items that need to be reordered
   */
  const reorderItems = async (items: any[]) => {
    if (isReordering || !items.length) return;
    
    setIsReordering(true);
    
    try {
      // In a real app, this would call your inventory API
      const result = await makeReorderApiCall(items);
      
      setLastReorderResult(result);
      
      if (result.success) {
        // Show success notification
        addNotification({
          title: "Auto-Reorder Complete",
          message: `Successfully ordered ${items.length} items. Order #${result.orderId}`,
          type: "success",
          category: "inventory",
          priority: "medium",
          link: "/inventory/orders"
        });
      } else {
        // Show error notification
        addNotification({
          title: "Reorder Failed",
          message: "There was an issue with the automatic reordering process",
          type: "error",
          category: "inventory",
          priority: "high"
        });
      }
    } catch (error) {
      console.error("Error during auto-reorder:", error);
      
      addNotification({
        title: "Reorder Failed",
        message: "There was an error processing your auto-reorder",
        type: "error",
        category: "system",
        priority: "high"
      });
    } finally {
      setIsReordering(false);
    }
  };

  // Function to enable auto-reorder for an item
  const enableAutoReorder = useCallback((itemId: string, threshold: number, quantity: number) => {
    setAutoReorderSettings(prev => ({
      ...prev,
      [itemId]: {
        enabled: true,
        threshold,
        quantity
      }
    }));
    // In a real app, this would make an API call to update settings in the database
  }, []);

  // Function to disable auto-reorder for an item
  const disableAutoReorder = useCallback((itemId: string) => {
    setAutoReorderSettings(prev => {
      if (prev[itemId]) {
        return {
          ...prev,
          [itemId]: {
            ...prev[itemId],
            enabled: false
          }
        };
      }
      return prev;
    });
    // In a real app, this would make an API call to update settings in the database
  }, []);

  // Function to place automatic order
  const placeAutomaticOrder = useCallback(async (items: any[]) => {
    return reorderItems(items);
  }, [reorderItems]);

  return {
    reorderItems,
    isReordering,
    lastReorderResult,
    autoReorderSettings,
    enableAutoReorder,
    disableAutoReorder,
    placeAutomaticOrder
  };
}
