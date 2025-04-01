
import { useState, useEffect } from "react";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "@/components/work-orders/WorkOrderFormFields";
import { InventoryItemExtended } from "@/types/inventory";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";
import { toast } from "@/hooks/use-toast";
import { WorkOrderInventoryItem } from "@/types/workOrder";

export const useWorkOrderInventory = (form: UseFormReturn<WorkOrderFormFieldValues>) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const { checkItemAvailability, reserveInventory } = useInventoryManager();
  
  // Get current inventory items
  const selectedItems = form.watch("inventoryItems") || [];

  // Reserve inventory items when submitting the form
  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      // Only run when the form is about to be submitted (status changes to in-progress or completed)
      if (name === "status" && (value.status === "in-progress" || value.status === "completed")) {
        const items = value.inventoryItems || [];
        
        if (items.length > 0) {
          // Prepare items for reservation
          const itemsToReserve = items.map(item => ({
            id: item.id,
            quantity: item.quantity
          }));
          
          // Attempt to reserve the inventory
          reserveInventory(itemsToReserve).then(result => {
            if (!result.success) {
              // Show warning about inventory availability issues
              toast({
                title: "Inventory Warning",
                description: "Some items have insufficient inventory. Please review inventory levels.",
                variant: "warning"
              });
            }
          });
        }
      }
    });
    
    return () => subscription.unsubscribe();
  }, [form, reserveInventory]);

  // Check inventory availability for the current items
  useEffect(() => {
    // Skip if no items or not mounted yet
    if (!selectedItems.length) return;
    
    // Check each item's availability
    selectedItems.forEach(item => {
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
          if (availability.availableQuantity) {
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
          quantity: newQuantity
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
        const newItem = {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category,
          quantity: 1,
          unitPrice: item.unitPrice
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
      
      const currentItems = form.getValues("inventoryItems") || [];
      const updatedItems = currentItems.map(item => 
        item.id === id ? { ...item, quantity } : item
      );
      
      form.setValue("inventoryItems", updatedItems);
    });
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
