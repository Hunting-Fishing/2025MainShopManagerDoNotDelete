
import React, { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventoryItemExtended } from "@/data/mockInventoryData";
import { AddInventoryButton } from "./AddInventoryButton";
import { InventoryQuantityManager } from "./InventoryQuantityManager";

interface WorkOrderInventorySectionContainerProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const WorkOrderInventorySectionContainer: React.FC<WorkOrderInventorySectionContainerProps> = ({
  form
}) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  
  // Get current inventory items
  const selectedItems = form.watch("inventoryItems") || [];

  // Handle adding inventory item
  const handleAddItem = (item: InventoryItemExtended) => {
    const currentItems = form.getValues("inventoryItems") || [];
    
    // Check if item already exists
    const existingItemIndex = currentItems.findIndex(i => i.id === item.id);
    
    if (existingItemIndex >= 0) {
      // Update quantity if item already exists
      const updatedItems = [...currentItems];
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: updatedItems[existingItemIndex].quantity + 1
      };
      form.setValue("inventoryItems", updatedItems);
    } else {
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
    }
    
    setShowInventoryDialog(false);
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
    const updatedItems = currentItems.map(item => 
      item.id === id ? { ...item, quantity } : item
    );
    
    form.setValue("inventoryItems", updatedItems);
  };

  return (
    <FormField
      name="inventoryItems"
      render={() => (
        <FormItem className="col-span-1 md:col-span-2">
          <FormLabel>Parts & Materials</FormLabel>
          
          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <div className="text-sm text-muted-foreground">
                Add parts and materials from inventory that will be used for this work order
              </div>
              
              <AddInventoryButton onShowDialog={() => setShowInventoryDialog(true)} />
            </div>
            
            <WorkOrderInventoryTable 
              items={selectedItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <InventorySelectionDialog
            open={showInventoryDialog}
            onOpenChange={setShowInventoryDialog}
            onAddItem={handleAddItem}
          />
        </FormItem>
      )}
    />
  );
};
