
import React from "react";
import { X, Check, LinkIcon } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface WorkOrder {
  id: string;
  customer: string;
  description: string;
  status: string;
  date: string;
  dueDate: string;
  priority: string;
  technician: string;
  location: string;
}

interface WorkOrderLinkSectionProps {
  workOrderId: string;
  description: string;
  workOrders: WorkOrder[];
  onSelectWorkOrder: (workOrder: WorkOrder) => void;
  onClearWorkOrder: () => void;
  showWorkOrderDialog: boolean;
  setShowWorkOrderDialog: (show: boolean) => void;
}

export function WorkOrderLinkSection({
  workOrderId,
  description,
  workOrders,
  onSelectWorkOrder,
  onClearWorkOrder,
  showWorkOrderDialog,
  setShowWorkOrderDialog,
}: WorkOrderLinkSectionProps) {
  return (
    <>
      <div className="flex items-center justify-between mb-2">
        <Label>Work Order Reference</Label>
        <Dialog open={showWorkOrderDialog} onOpenChange={setShowWorkOrderDialog}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="flex items-center gap-1">
              <LinkIcon className="h-3 w-3" />
              {workOrderId ? "Change" : "Link"} Work Order
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Select Work Order</DialogTitle>
              <DialogDescription>
                Choose a work order to link to this invoice.
              </DialogDescription>
            </DialogHeader>
            <div className="max-h-[400px] overflow-y-auto">
              <div className="space-y-4">
                {workOrders.map((wo) => (
                  <div 
                    key={wo.id} 
                    className="flex justify-between items-center p-3 rounded border border-slate-200 hover:bg-slate-50 cursor-pointer"
                    onClick={() => onSelectWorkOrder(wo)}
                  >
                    <div>
                      <div className="font-medium">{wo.id} - {wo.customer}</div>
                      <div className="text-sm text-slate-500">{wo.description}</div>
                    </div>
                    <Button variant="ghost" size="sm">
                      <Check className="h-4 w-4" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
      {workOrderId ? (
        <div className="p-3 mb-6 rounded border border-slate-200 bg-slate-50">
          <div className="flex justify-between">
            <div>
              <div className="font-medium">{workOrderId}</div>
              <div className="text-sm text-slate-500">{description}</div>
            </div>
            <Button variant="ghost" size="sm" className="text-red-500 hover:text-red-700" onClick={onClearWorkOrder}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="p-3 mb-6 rounded border border-dashed border-slate-300 text-center text-slate-500">
          No work order linked
        </div>
      )}
    </>
  );
}
