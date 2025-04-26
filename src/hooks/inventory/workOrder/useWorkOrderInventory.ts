
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues, WorkOrderInventoryItem } from "@/types/workOrder.d"; // Import both from .d.ts file
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { useInventoryStatusEffects } from "./useInventoryStatusEffects";
import { useInventoryItemOperations } from "./useInventoryItemOperations";

/**
 * Main hook for managing work order inventory
 */
export const useWorkOrderInventory = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  const { 
    reserveInventory, 
    consumeWorkOrderInventory 
  } = useInventoryManager();
  
  // Use the inventory status effects hook
  useInventoryStatusEffects(form, consumeWorkOrderInventory, reserveInventory);
  
  // Use the inventory item operations hook
  const {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  } = useInventoryItemOperations(form);

  return {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  };
};
