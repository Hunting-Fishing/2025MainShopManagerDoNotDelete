
import { getInventoryItemById, reorderItem as reorderItemService } from "@/services/inventoryService";
import { useNotifications } from "@/context/notifications";
import { toast } from "@/hooks/use-toast";

export function useManualReorder() {
  const { addNotification } = useNotifications();

  // Function to manually reorder an item
  const reorderItem = async (itemId: string, quantity: number) => {
    try {
      const item = await getInventoryItemById(itemId);
      if (!item) {
        toast({
          title: "Error",
          description: "Item not found",
          variant: "destructive",
        });
        return;
      }
      
      // Call the reorderItem service function
      await reorderItemService(itemId, quantity);
      
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
    } catch (error) {
      console.error("Error placing manual order:", error);
      toast({
        title: "Error",
        description: "Failed to place order",
        variant: "destructive",
      });
    }
  };

  return {
    reorderItem
  };
}
