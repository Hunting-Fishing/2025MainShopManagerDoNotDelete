
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";
import { InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { useInventoryManager } from "@/hooks/inventory/useInventoryManager";

interface WorkOrderFormValues {
  customer?: string;
  customer_id?: string;
  vehicle?: string;
  vehicle_id?: string;
  description: string;
  status: string;
  priority: string;
  technician?: string;
  technician_id?: string;
  service_date?: string;
  notes: string;
  inventoryItems: WorkOrderInventoryItem[];
}

/**
 * Main hook for managing work order inventory
 */
export const useWorkOrderInventory = (form: UseFormReturn<WorkOrderFormValues>) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const [isAdding, setIsAdding] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  
  const { 
    reserveInventory, 
    consumeWorkOrderInventory 
  } = useInventoryManager();
  
  // Get the current inventory items from the form
  const items = form.watch("inventoryItems") || [];
  
  const addItem = (item: InventoryItemExtended) => {
    try {
      setIsAdding(true);
      
      // Check if item already exists in the list
      const existingItemIndex = items.findIndex(i => i.id === item.id);
      
      if (existingItemIndex >= 0) {
        // Update quantity if item exists
        const updatedItems = [...items];
        updatedItems[existingItemIndex].quantity += 1;
        form.setValue("inventoryItems", updatedItems);
      } else {
        // Add new item
        const newItem: WorkOrderInventoryItem = {
          id: item.id,
          name: item.name,
          sku: item.sku,
          category: item.category || '',
          quantity: 1,
          unit_price: item.unit_price
        };
        
        form.setValue("inventoryItems", [...items, newItem]);
      }
      
      setShowInventoryDialog(false);
    } finally {
      setIsAdding(false);
    }
  };

  const removeItem = (itemId: string) => {
    const filteredItems = items.filter(item => item.id !== itemId);
    form.setValue("inventoryItems", filteredItems);
  };

  const updateQuantity = (itemId: string, quantity: number) => {
    try {
      setIsUpdating(true);
      
      const updatedItems = items.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      );
      
      form.setValue("inventoryItems", updatedItems);
    } finally {
      setIsUpdating(false);
    }
  };

  return {
    showInventoryDialog,
    setShowInventoryDialog,
    isAdding,
    isUpdating,
    items,
    addItem,
    removeItem,
    updateQuantity,
    reserveInventory,
    consumeWorkOrderInventory
  };
};
