
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormSchemaValues } from "@/schemas/workOrderSchema";
import { InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Hook to manage inventory item operations in a work order
 */
export const useInventoryItemOperations = (form: UseFormReturn<WorkOrderFormSchemaValues>) => {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>([]);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Internal methods to simulate API calls for now
  const simulateAddInventoryCall = async (item: WorkOrderInventoryItem): Promise<WorkOrderInventoryItem> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(item), 500);
    });
  };

  const simulateRemoveInventoryCall = async (itemId: string): Promise<boolean> => {
    return new Promise(resolve => {
      setTimeout(() => resolve(true), 500);
    });
  };

  const simulateUpdateInventoryCall = async (itemId: string, quantity: number): Promise<WorkOrderInventoryItem> => {
    return new Promise(resolve => {
      const item = items.find(i => i.id === itemId);
      if (item) {
        const updatedItem = { ...item, quantity, total: item.unit_price * quantity };
        resolve(updatedItem);
      } else {
        throw new Error("Item not found");
      }
    });
  };

  /**
   * Add inventory item to work order
   */
  const addItem = async (inventoryItem: InventoryItemExtended) => {
    try {
      setIsAdding(true);
      
      const workOrderInventoryItem: WorkOrderInventoryItem = {
        id: inventoryItem.id,
        workOrderId: crypto.randomUUID(), // This would normally come from the work order
        name: inventoryItem.name,
        sku: inventoryItem.sku,
        category: inventoryItem.category,
        quantity: 1, // Default to 1
        unit_price: inventoryItem.unit_price,
        total: inventoryItem.unit_price // total = unit_price * quantity (1)
      };
      
      // Simulate API call
      await simulateAddInventoryCall(workOrderInventoryItem);
      
      // Update local state
      setItems(prev => [...prev, workOrderInventoryItem]);
      
      return workOrderInventoryItem;
    } catch (error) {
      console.error("Error adding inventory item:", error);
      throw error;
    } finally {
      setIsAdding(false);
    }
  };

  /**
   * Remove inventory item from work order
   */
  const removeItem = async (itemId: string) => {
    try {
      // Simulate API call
      await simulateRemoveInventoryCall(itemId);
      
      // Update local state
      setItems(prev => prev.filter(item => item.id !== itemId));
      
      return true;
    } catch (error) {
      console.error("Error removing inventory item:", error);
      throw error;
    }
  };

  /**
   * Update inventory item quantity
   */
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      setIsUpdating(true);
      
      // Simulate API call
      const updatedItem = await simulateUpdateInventoryCall(itemId, quantity);
      
      // Update local state
      setItems(prev => prev.map(item => 
        item.id === itemId ? updatedItem : item
      ));
      
      return updatedItem;
    } catch (error) {
      console.error("Error updating inventory quantity:", error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    items,
    isAdding,
    isUpdating,
    addItem,
    removeItem,
    updateQuantity,
  };
};
