
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";
import { InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { v4 as uuidv4 } from "uuid";

// Create a mock service implementation for now
const mockWorkOrderService = {
  addInventoryToWorkOrder: async () => true,
  removeInventoryFromWorkOrder: async () => true,
  updateWorkOrderInventoryQuantity: async () => true,
};

export const useInventoryItemOperations = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(
    form.getValues()?.inventoryItems || []
  );
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);

  // Add inventory item to work order
  const addItem = async (inventoryItem: InventoryItemExtended) => {
    try {
      // Check if item already exists in the list
      const existingItem = items.find((item) => item.id === inventoryItem.id);
      
      if (existingItem) {
        // If item exists, increment quantity
        await updateQuantity(existingItem.id, existingItem.quantity + 1);
        return;
      }
      
      setIsAdding(true);
      
      // Create new inventory item for the work order
      const newItem: WorkOrderInventoryItem = {
        id: inventoryItem.id || uuidv4(),
        name: inventoryItem.name,
        sku: inventoryItem.sku,
        category: inventoryItem.category || "",
        workOrderId: form.getValues().id, // Use camelCase for the TypeScript property
        quantity: 1,
        unit_price: inventoryItem.unit_price,
        total: inventoryItem.unit_price,
      };
      
      // Add to API
      await mockWorkOrderService.addInventoryToWorkOrder(newItem);
      
      // Update local state
      const updatedItems = [...items, newItem];
      setItems(updatedItems);
      
      // Update form values
      form.setValue("inventoryItems", updatedItems, { shouldDirty: true });
      
    } catch (error) {
      console.error("Failed to add inventory item:", error);
    } finally {
      setIsAdding(false);
    }
  };

  // Remove inventory item from work order
  const removeItem = async (itemId: string) => {
    try {
      setIsUpdating(true);
      
      // Filter out the item to be removed
      const updatedItems = items.filter((item) => item.id !== itemId);
      
      // Remove from API
      await mockWorkOrderService.removeInventoryFromWorkOrder(itemId);
      
      // Update local state
      setItems(updatedItems);
      
      // Update form values
      form.setValue("inventoryItems", updatedItems, { shouldDirty: true });
      
    } catch (error) {
      console.error("Failed to remove inventory item:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Update inventory item quantity
  const updateQuantity = async (itemId: string, quantity: number) => {
    try {
      if (quantity < 1) return;
      
      setIsUpdating(true);
      
      // Find the item to update
      const updatedItems = items.map((item) => {
        if (item.id === itemId) {
          const updatedQuantity = Math.max(1, quantity);
          return {
            ...item,
            quantity: updatedQuantity,
            total: updatedQuantity * item.unit_price,
          };
        }
        return item;
      });
      
      // Update in API
      await mockWorkOrderService.updateWorkOrderInventoryQuantity(itemId, quantity);
      
      // Update local state
      setItems(updatedItems);
      
      // Update form values
      form.setValue("inventoryItems", updatedItems, { shouldDirty: true });
      
    } catch (error) {
      console.error("Failed to update inventory quantity:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  // Function to update inventory quantity
  const updateInventoryQuantity = async (itemId: string, newQuantity: number) => {
    return updateQuantity(itemId, newQuantity);
  };
  
  return {
    items,
    setItems,
    isAdding,
    isUpdating,
    addItem,
    removeItem,
    updateQuantity,
    updateInventoryQuantity
  };
};
