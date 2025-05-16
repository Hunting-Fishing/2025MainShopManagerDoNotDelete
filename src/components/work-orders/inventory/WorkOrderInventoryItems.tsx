
import React from "react";
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { SelectedInventoryTable } from "./SelectedInventoryTable";

export interface WorkOrderInventoryItemsProps {
  workOrderId: string;
  inventoryItems: WorkOrderInventoryItem[];
}

export const WorkOrderInventoryItems: React.FC<WorkOrderInventoryItemsProps> = ({
  workOrderId,
  inventoryItems,
}) => {
  // These handlers would normally connect to API services
  const handleUpdateQuantity = (id: string, quantity: number) => {
    console.log(`Update quantity for ${id} to ${quantity}`);
  };

  const handleRemoveItem = (id: string) => {
    console.log(`Remove item ${id}`);
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-medium">Parts and Materials</h3>
      
      <SelectedInventoryTable
        items={inventoryItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />
      
      <div className="flex justify-end mt-4">
        <div className="bg-slate-50 p-4 rounded-md">
          <span className="text-sm text-slate-500">Total Cost: </span>
          <span className="font-medium">
            ${inventoryItems.reduce((sum, item) => sum + (item.quantity * item.unit_price), 0).toFixed(2)}
          </span>
        </div>
      </div>
    </div>
  );
};
