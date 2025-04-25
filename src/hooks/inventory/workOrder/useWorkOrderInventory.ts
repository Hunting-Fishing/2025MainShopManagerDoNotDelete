
import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues, WorkOrderInventoryItem } from "@/types/workOrder";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { useInventoryStatusEffects } from "./useInventoryStatusEffects";
import { useInventoryItemOperations } from "./useInventoryItemOperations";
import { consumeWorkOrderInventory, reserveInventory } from "@/services/inventoryService";

/**
 * Main hook for managing work order inventory
 */
export const useWorkOrderInventory = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  // Instead of directly using useInventoryManager, use the direct functions
  // to avoid typing issues
  
  // Wrapper for consumeWorkOrderInventory to match expected type
  const handleConsumeInventory = async (items: WorkOrderInventoryItem[]): Promise<void> => {
    await consumeWorkOrderInventory(items);
    // No return needed as we're converting to void
  };
  
  // Use the inventory status effects hook with the wrapper function
  useInventoryStatusEffects(form, handleConsumeInventory, reserveInventory);
  
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
