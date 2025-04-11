
import { useState, useEffect, useCallback } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { toast } from "@/hooks/use-toast";
import { WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Hook to manage inventory item operations in work orders
 */
export const useInventoryItemOperations = (
  form: UseFormReturn<WorkOrderFormFieldValues>
) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const { checkItemAvailability } = useInventoryManager();
  
  // Get current inventory items
  const selectedItems = form.watch("inventoryItems") || [];

  // Check inventory availability for the current items
  useEffect(() => {
    // Skip if no items or not mounted yet
    if (!selectedItems.length) return;
    
    // Check each item's availability but only for regular inventory items
    selectedItems.forEach(item => {
      // Skip special order items and other non-inventory items
      if (item.itemStatus && item.itemStatus !== "in-stock") return;
      
      checkItemAvailability(item.id, item.quantity).then(availability => {
        if (!availability.available) {
          toast({
            title: "Inventory Issue",
            description: availability.message,
            variant: "destructive"
          });
        }
      });
    });
  }, [selectedItems, checkItemAvailability]);

  // Handle adding inventory item
  const handleAddItem = (item: InventoryItemExtended) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Check if item already exists
    const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...currentItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + 1;
      
      // Check if new quantity is available
      checkItemAvailability(item.id, newQuantity).then(availability => {
        if (!availability.available) {
          toast({
            title: "Insufficient Inventory",
            description: availability.message,
            variant: "destructive"
          });
          if (availability.availableQuantity !== undefined) {
            updatedItems[existingItemIndex] = {
              ...updatedItems[existingItemIndex],
              quantity: availability.availableQuantity
            };
            form.setValue("inventoryItems", updatedItems);
          }
          setShowInventoryDialog(false);
          return;
        }
        
        updatedItems[existingItemIndex] = {
          ...updatedItems[existingItemIndex],
          quantity: newQuantity,
          itemStatus: "in-stock" // Ensure correct status
        };
        form.setValue("inventoryItems", updatedItems);
        setShowInventoryDialog(false);
      });
    } else {
      // Check if new item is available
      checkItemAvailability(item.id, 1).then(availability => {
        if (!availability.available) {
          toast({
            title: "Item Unavailable",
            description: availability.message,
            variant: "destructive"
          });
          setShowInventoryDialog(false);
          return;
        }
        
        // Add new item with required properties to satisfy WorkOrderInventoryItem type
        const newItem: WorkOrderInventoryItem = {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: 1,
          unitPrice: item.unitPrice,
          itemStatus: "in-stock" // Set default status for inventory items
        };
        
        form.setValue("inventoryItems", [...currentItems, newItem]);
        setShowInventoryDialog(false);
      });
    }
  };

  // Handle removing inventory item
  const handleRemoveItem = (id: string) => {
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", currentItems.filter(item => item.id !== id));
  };

  // Handle updating item quantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    if (quantity < 1) return;
    
    const currentItems = form.getValues("inventoryItems") || [];
    const itemIndex = currentItems.findIndex(item => item.id === id);
    
    if (itemIndex === -1) return;
    
    const item = currentItems[itemIndex];
    
    // Only check availability for regular inventory items
    if (!item.itemStatus || item.itemStatus === "in-stock") {
      // Check if the new quantity is available in inventory
      checkItemAvailability(id, quantity).then(availability => {
        if (!availability.available) {
          toast({
            title: "Insufficient Inventory",
            description: availability.message,
            variant: "warning"
          });
          
          // If there's some available, use that quantity
          if (availability.availableQuantity !== undefined) {
            quantity = availability.availableQuantity;
          } else {
            return; // Don't update if no inventory is available
          }
        }
        
        const updatedItems = currentItems.map(item => 
          item.id === id ? { ...item, quantity } : item
        );
        
        form.setValue("inventoryItems", updatedItems);
      });
    } else {
      // For special order items and others, no need to check availability
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      form.setValue("inventoryItems", updatedItems);
    }
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
