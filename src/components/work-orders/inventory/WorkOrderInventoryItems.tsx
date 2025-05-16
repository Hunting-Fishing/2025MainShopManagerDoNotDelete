
import React, { useState } from "react";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { SelectedInventoryTable } from "./SelectedInventoryTable";

interface WorkOrderInventoryItemsProps {
  workOrderId: string;
  inventoryItems: WorkOrderInventoryItem[];
}

export function WorkOrderInventoryItems({
  workOrderId,
  inventoryItems
}: WorkOrderInventoryItemsProps) {
  const [items, setItems] = useState<WorkOrderInventoryItem[]>(inventoryItems || []);
  const [isAddingItem, setIsAddingItem] = useState(false);
  
  // Handle updating quantity
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setItems(prevItems =>
      prevItems.map(item =>
        item.id === id ? { ...item, quantity } : item
      )
    );
  };
  
  // Handle removing item
  const handleRemove = (id: string) => {
    setItems(prevItems => prevItems.filter(item => item.id !== id));
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between">
        <h3 className="text-lg font-medium">Parts & Materials</h3>
        <Button 
          variant="outline" 
          size="sm" 
          onClick={() => setIsAddingItem(true)}
        >
          <Plus className="mr-2 h-4 w-4" />
          Add Item
        </Button>
      </div>
      
      <SelectedInventoryTable
        items={items}
        onUpdateQuantity={handleUpdateQuantity}
        onRemove={handleRemove}
      />
    </div>
  );
}
