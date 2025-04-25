
import { useState, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues, WorkOrderInventoryItem } from "@/types/workOrder";
import { InventoryItemExtended } from "@/types/inventory";
import { checkItemAvailability } from "@/services/inventoryService";
import { toast } from "@/hooks/use-toast";

export const useInventoryItemOperations = (
  form: UseFormReturn<WorkOrderFormFieldValues>
) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);

  // Get inventory items from the form
  const selectedItems = form.watch("inventoryItems") || [];

  // Check inventory availability before adding
  const checkAvailability = useCallback(async (
    item: InventoryItemExtended, 
    quantity: number
  ): Promise<boolean> => {
    // We make a direct call to the service instead of using useInventoryManager
    const isAvailable = await checkItemAvailability(item.id, quantity);
    
    if (!isAvailable) {
      toast({
        title: "Insufficient inventory",
        description: `Not enough ${item.name} in stock.`,
        variant: "destructive"
      });
      return false;
    }
    
    return true;
  }, []);

  // Function to add inventory item
  const handleAddItem = useCallback(async (
    item: InventoryItemExtended, 
    quantity: number
  ) => {
    // Check if there's enough inventory
    const isAvailable = await checkAvailability(item, quantity);
    if (!isAvailable) return;
    
    // Check if the item already exists
    const currentItems = form.getValues("inventoryItems") || [];
    const existingItemIndex = currentItems.findIndex(
      (i) => i.id === item.id
    );

    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex].quantity += quantity;
      
      form.setValue("inventoryItems", updatedItems);
    } else {
      // Add new item
      const newItem: WorkOrderInventoryItem = {
        id: item.id,
        name: item.name,
        sku: item.sku || "",
        category: item.category,
        quantity,
        unitPrice: item.unitPrice
      };
      
      form.setValue("inventoryItems", [...currentItems, newItem]);
    }

    toast({
      title: "Item added",
      description: `${quantity} x ${item.name} added to work order.`
    });
  }, [form, checkAvailability]);

  // Function to remove inventory item
  const handleRemoveItem = useCallback((index: number) => {
    const currentItems = form.getValues("inventoryItems") || [];
    const updatedItems = [...currentItems];
    updatedItems.splice(index, 1);
    
    form.setValue("inventoryItems", updatedItems);
  }, [form]);

  // Function to update inventory item quantity
  const handleUpdateQuantity = useCallback(async (
    index: number, 
    newQuantity: number
  ) => {
    const currentItems = form.getValues("inventoryItems") || [];
    const item = currentItems[index];
    
    // Check if there's enough inventory for the new quantity
    const quantityDiff = newQuantity - item.quantity;
    
    if (quantityDiff > 0) {
      const isAvailable = await checkAvailability({
        ...item,
        id: item.id
      } as InventoryItemExtended, quantityDiff);
      
      if (!isAvailable) return;
    }
    
    // Update the quantity
    const updatedItems = [...currentItems];
    updatedItems[index].quantity = newQuantity;
    
    form.setValue("inventoryItems", updatedItems);
  }, [form, checkAvailability]);

  return {
    showInventoryDialog,
    setShowInventoryDialog,
    selectedItems,
    handleAddItem,
    handleRemoveItem,
    handleUpdateQuantity
  };
};
