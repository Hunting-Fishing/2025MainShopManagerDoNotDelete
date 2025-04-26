
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { WorkOrder } from "@/types/workOrder";
import { formatDate } from "@/utils/formatters";

interface WorkOrderDialogProps {
  open: boolean;
  onClose: () => void;
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
}

export function WorkOrderDialog({
  open,
  onClose,
  workOrders,
  onSelectWorkOrder,
}: WorkOrderDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>Select Work Order</DialogTitle>
        </DialogHeader>
        
        <ScrollArea className="h-[400px] mt-4">
          <div className="space-y-4">
            {workOrders.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No work orders found
              </div>
            ) : (
              workOrders.map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="p-4 border rounded-lg hover:bg-muted transition-colors cursor-pointer"
                  onClick={() => onSelectWorkOrder(workOrder)}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-medium">
                      {workOrder.customer || "Unknown Customer"}
                    </h3>
                    <div className="text-sm bg-blue-100 text-blue-800 px-2 py-0.5 rounded">
                      {workOrder.status}
                    </div>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2 line-clamp-2">
                    {workOrder.description || "No description"}
                  </p>
                  <div className="flex text-xs text-muted-foreground">
                    <div>Created: {formatDate(workOrder.created_at || "")}</div>
                    <div className="ml-4">
                      Due: {formatDate(workOrder.due_date || "")}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
        
        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
