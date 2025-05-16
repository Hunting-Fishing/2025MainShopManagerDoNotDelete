
import { useState } from 'react';
import { useNotifications } from '@/context/notifications';

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

  return {
    reorderItems,
    isReordering,
    lastReorderResult
  };
}
