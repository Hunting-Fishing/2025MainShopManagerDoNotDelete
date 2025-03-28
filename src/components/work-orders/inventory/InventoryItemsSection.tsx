
import React, { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { UseFormReturn } from "react-hook-form";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { SelectedInventoryTable } from "./SelectedInventoryTable";
import { InventorySelectionDialog } from "./InventorySelectionDialog";
import { InventoryItemExtended } from "@/data/mockInventoryData";
import { WorkOrderFormFieldValues } from "../WorkOrderFormFields";

interface InventoryItemsSectionProps {
  form: UseFormReturn<WorkOrderFormFieldValues>;
}

export const InventoryItemsSection: React.FC<InventoryItemsSectionProps> = ({ form }) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  const selectedItems = form.watch("inventoryItems") || [];

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
      // Add new item - create a proper WorkOrderInventoryItem
      const newItem: WorkOrderInventoryItem = {
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

  const handleRemoveItem = (id: string) => {
    const currentItems = form.getValues("inventoryItems") || [];
    form.setValue("inventoryItems", currentItems.filter(item => item.id !== id));
  };

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
              
              <Button 
                variant="outline" 
                size="sm" 
                className="flex items-center gap-1"
                onClick={() => setShowInventoryDialog(true)}
              >
                <Package className="h-4 w-4" />
                Add Inventory Item
              </Button>
            </div>
            
            <SelectedInventoryTable 
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
