
import { inventoryItems } from "@/data/mockInventoryData";
import { useNotifications } from "@/context/notifications";
import { toast } from "@/hooks/use-toast";

export function useManualReorder() {
  const { addNotification } = useNotifications();

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
    reorderItem
  };
}
