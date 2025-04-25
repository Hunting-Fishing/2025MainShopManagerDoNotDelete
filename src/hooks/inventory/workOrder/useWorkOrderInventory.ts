
import { useState } from "react";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { toast } from "@/components/ui/use-toast";
import { useInventory } from "@/hooks/inventory/useInventory";
import { consumeWorkOrderInventory, reserveInventoryItems } from "@/services/inventoryService";

export function useWorkOrderInventory(workOrderId: string) {
  const [isProcessing, setIsProcessing] = useState(false);
  const { checkItemAvailability } = useInventory();

  // Consume inventory when work order is completed
  const handleConsumeInventory = async () => {
    setIsProcessing(true);
    try {
      const success = await consumeWorkOrderInventory(workOrderId);
      
      if (success) {
        toast({
          title: "Inventory updated",
          description: "Work order parts have been deducted from inventory",
        });
        return true;
      } else {
        throw new Error("Failed to update inventory");
      }
    } catch (error) {
      toast({
        title: "Error updating inventory",
        description: "There was a problem deducting parts from inventory",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  // Reserve inventory items for a work order
  const handleReserveInventory = async (items: WorkOrderInventoryItem[]) => {
    if (!items.length) return true;
    
    setIsProcessing(true);
    try {
      // Check if all items are available first
      for (const item of items) {
        const available = await checkItemAvailability(item.id, item.quantity);
        if (!available) {
          toast({
            title: "Insufficient inventory",
            description: `Not enough ${item.name} in stock`,
            variant: "destructive",
          });
          setIsProcessing(false);
          return false;
        }
      }

      // If all items are available, reserve them
      await reserveInventoryItems(items);
      
      toast({
        title: "Inventory reserved",
        description: "Parts have been reserved for this work order",
      });
      
      return true;
    } catch (error) {
      toast({
        title: "Error reserving inventory",
        description: "There was a problem reserving parts for this work order",
        variant: "destructive",
      });
      return false;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    handleConsumeInventory,
    handleReserveInventory,
    isProcessing,
  };
}
