
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { useInventoryStatusEffects } from "./useInventoryStatusEffects";
import { useInventoryItemOperations } from "./useInventoryItemOperations";

/**
 * Main hook for managing work order inventory
 */
export const useWorkOrderInventory = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [selectedItems, setSelectedItems] = useState<WorkOrderInventoryItem[]>([]);
  
  const { 
    reserveInventory, 
    consumeWorkOrderInventory 
  } = useInventoryManager();
  
  // Use the inventory status effects hook
  useInventoryStatusEffects(form, consumeWorkOrderInventory, reserveInventory);
  
  // Use the inventory item operations hook
  const {
    items,
    isAdding,
    isUpdating,
    addItem,
    removeItem,
    updateQuantity,
  } = useInventoryItemOperations(form);

  const handleAddItem = (item: InventoryItemExtended) => {
    addItem(item);
  };

  const handleRemoveItem = (itemId: string) => {
    removeItem(itemId);
  };

  const handleUpdateQuantity = (itemId: string, quantity: number) => {
    updateQuantity(itemId, quantity);
  };

  return {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  };
};
