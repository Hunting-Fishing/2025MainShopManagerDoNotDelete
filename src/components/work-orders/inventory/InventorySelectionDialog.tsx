
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { InventoryItemCard } from "./InventoryItemCard";
import { InventoryItemExtended, mockInventoryItems } from "@/data/mockInventoryData";

interface InventorySelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: InventoryItemExtended) => void;
}

export const InventorySelectionDialog: React.FC<InventorySelectionDialogProps> = ({
  open,
  onOpenChange,
  onAddItem,
}) => {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Select Inventory Item</DialogTitle>
          <DialogDescription>
            Choose items from inventory to add to the work order.
          </DialogDescription>
        </DialogHeader>
        <div className="max-h-[400px] overflow-y-auto mt-4">
          <div className="space-y-3">
            {mockInventoryItems.map((item) => (
              <InventoryItemCard 
                key={item.id} 
                item={item} 
                onAddItem={onAddItem} 
              />
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
