
import { useState } from 'react';
import { toast } from '@/hooks/use-toast';
import { getInventoryItemById } from '@/utils/inventory/inventoryUtils';
import { useNotifications } from '@/context/notifications';

export const useManualReorder = () => {
  const [isReordering, setIsReordering] = useState(false);
  const { addNotification } = useNotifications();

  const reorderItem = async (itemId: string, quantity: number) => {
    try {
      setIsReordering(true);
      
      // Get the item details
      const item = await getInventoryItemById(itemId);
      
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        });
        return;
      }
      
      // In a real app, this would connect to a purchasing API
      // For now, we'll just show a toast and notification
      
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
      
      return true;
    } catch (error) {
      console.error("Error placing manual order:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsReordering(false);
    }
  };

  return {
    reorderItem,
    isReordering
  };
};
