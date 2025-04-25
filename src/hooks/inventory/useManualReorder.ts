
import { useState } from 'react';
import { getInventoryItemById, updateInventoryQuantity } from '@/services/inventoryService';
import { toast } from '@/components/ui/use-toast';

export function useManualReorder() {
  const [isReordering, setIsReordering] = useState(false);

  const reorderItem = async (itemId: string, quantity: number) => {
    if (!itemId || quantity <= 0) {
      toast({
        title: "Invalid reorder",
        description: "Item ID and quantity must be provided",
        variant: "destructive"
      });
      return;
    }

    setIsReordering(true);
    
    try {
      // First, get the current item to get its existing quantity
      const currentItem = await getInventoryItemById(itemId);
      
      if (!currentItem) {
        throw new Error("Item not found");
      }
      
      // Calculate new quantity (adding to existing)
      const newQuantity = (currentItem.quantity || 0) + quantity;
      
      // Update the item with new quantity
      await updateInventoryQuantity(itemId, newQuantity);
      
      toast({
        title: "Reorder successful",
        description: `Added ${quantity} units of ${currentItem.name} to inventory`
      });
    } catch (error) {
      console.error("Error reordering item:", error);
      toast({
        title: "Reorder failed",
        description: "There was a problem processing the reorder",
        variant: "destructive"
      });
    } finally {
      setIsReordering(false);
    }
  };
  
  return { reorderItem, isReordering };
}
