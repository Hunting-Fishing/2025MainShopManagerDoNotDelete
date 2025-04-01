
import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { SpecialOrderItemForm } from "./SpecialOrderItemForm";
import { WorkOrderInventoryItem } from "@/types/workOrder";

interface SpecialOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddItem: (item: Partial<WorkOrderInventoryItem>) => void;
  suppliers: string[];
}

export function SpecialOrderDialog({
  open,
  onOpenChange,
  onAddItem,
  suppliers
}: SpecialOrderDialogProps) {
  const handleAddSpecialOrder = (item: Partial<WorkOrderInventoryItem>) => {
    onAddItem(item);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Add Special Order Item</DialogTitle>
          <DialogDescription>
            Create a special order item that will be ordered specifically for this work order.
          </DialogDescription>
        </DialogHeader>
        
        <SpecialOrderItemForm
          onAdd={handleAddSpecialOrder}
          onCancel={() => onOpenChange(false)}
          suppliers={suppliers}
        />
      </DialogContent>
    </Dialog>
  );
}
