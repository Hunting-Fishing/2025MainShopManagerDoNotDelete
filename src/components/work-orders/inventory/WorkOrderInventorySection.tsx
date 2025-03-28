
import React, { useState } from "react";
import { Package } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FormField, FormItem, FormLabel } from "@/components/ui/form";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { UseFormReturn } from "react-hook-form";
import { InventoryItemSelector } from "./InventoryItemSelector";
import { WorkOrderInventoryTable } from "./WorkOrderInventoryTable";

// Mock data for inventory items
const inventoryItems = [
  {
    id: "INV-1001",
    name: "HVAC Filter - Premium",
    sku: "HVF-P-100",
    category: "HVAC",
    supplier: "TechSupplies Inc.",
    quantity: 45,
    unitPrice: 24.99,
    status: "In Stock",
  },
  {
    id: "INV-1002",
    name: "Copper Pipe - 3/4\" x 10'",
    sku: "CP-34-10",
    category: "Plumbing",
    supplier: "PlumbPro Distributors",
    quantity: 120,
    unitPrice: 18.75,
    status: "In Stock",
  },
  {
    id: "INV-1003",
    name: "Circuit Breaker - 30 Amp",
    sku: "CB-30A",
    category: "Electrical",
    supplier: "ElectroSupply Co.",
    quantity: 35,
    unitPrice: 42.50,
    status: "In Stock",
  },
  {
    id: "INV-1004",
    name: "Door Lock Set - Commercial Grade",
    sku: "DL-CG-100",
    category: "Security",
    supplier: "SecureTech Systems",
    quantity: 12,
    unitPrice: 89.99,
    status: "Low Stock",
  },
];

interface WorkOrderInventoryFormValues {
  inventoryItems?: WorkOrderInventoryItem[];
  [key: string]: any;
}

interface WorkOrderInventorySectionProps {
  form: UseFormReturn<WorkOrderInventoryFormValues>;
}

export const WorkOrderInventorySection: React.FC<WorkOrderInventorySectionProps> = ({
  form
}) => {
  const [showInventoryDialog, setShowInventoryDialog] = useState(false);
  
  // Get current inventory items
  const selectedItems = form.watch("inventoryItems") || [];

  // Handle adding inventory item
  const handleAddItem = (item: typeof inventoryItems[0]) => {
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
            
            <WorkOrderInventoryTable 
              items={selectedItems} 
              onUpdateQuantity={handleUpdateQuantity}
              onRemoveItem={handleRemoveItem}
            />
          </div>

          <InventoryItemSelector 
            showDialog={showInventoryDialog}
            setShowDialog={setShowInventoryDialog}
            inventoryItems={inventoryItems}
            onAddItem={handleAddItem}
          />
        </FormItem>
      )}
    />
  );
};
