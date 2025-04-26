
import { useState } from 'react';
import { useInventory } from '@/hooks/inventory/useInventory';
import { checkItemAvailability, consumeWorkOrderInventory, reserveInventoryItems } from '@/services/inventoryService';
import { toast } from '@/components/ui/use-toast';

export function useWorkOrderInventory(workOrderId: string) {
  const { items, loading, error, refreshInventory } = useInventory();
  const [reservedItems, setReservedItems] = useState<string[]>([]);
  const [processingItems, setProcessingItems] = useState<Record<string, boolean>>({});

  // Wrapper for checkItemAvailability that works with our hook
  const checkAvailability = async (itemId: string, quantity: number) => {
    setProcessingItems(prev => ({ ...prev, [itemId]: true }));
    
    try {
      const result = await checkItemAvailability(itemId, quantity);
      return result;
    } catch (error) {
      console.error("Error checking item availability:", error);
      toast({
        title: "Error",
        description: "Failed to check item availability",
        variant: "destructive"
      });
      return false;
    } finally {
      setProcessingItems(prev => ({ ...prev, [itemId]: false }));
    }
  };

  // Reserve items for the work order
  const reserveItems = async (items: {id: string, quantity: number}[]) => {
    try {
      const success = await reserveInventoryItems(workOrderId, items);
      
      if (success) {
        setReservedItems(items.map(item => item.id));
        toast({
          title: "Success",
          description: "Items reserved successfully",
        });
        
        // Refresh inventory to get updated quantities
        refreshInventory();
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to reserve items",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error reserving items:", error);
      toast({
        title: "Error",
        description: "Failed to reserve items",
        variant: "destructive"
      });
      return false;
    }
  };

  // Consume items for the work order
  const consumeItems = async (items: {id: string, quantity: number}[]) => {
    try {
      const success = await consumeWorkOrderInventory(workOrderId, items);
      
      if (success) {
        toast({
          title: "Success",
          description: "Inventory updated successfully",
        });
        
        // Refresh inventory to get updated quantities
        refreshInventory();
        return true;
      } else {
        toast({
          title: "Error",
          description: "Failed to update inventory",
          variant: "destructive"
        });
        return false;
      }
    } catch (error) {
      console.error("Error consuming items:", error);
      toast({
        title: "Error",
        description: "Failed to update inventory",
        variant: "destructive"
      });
      return false;
    }
  };

  return {
    inventoryItems: items,
    loading,
    error,
    reservedItems,
    processingItems,
    checkAvailability,
    reserveItems,
    consumeItems,
    refreshInventory
  };
}
