
import { WorkOrder } from "@/types/workOrder";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface WorkOrderSelectorDialogProps {
  workOrders: WorkOrder[];
  open: boolean;
  onSelect: (workOrder: WorkOrder) => void;
  onClose: () => void;
}

export function WorkOrderSelectorDialog({
  workOrders,
  open,
  onSelect,
  onClose,
}: WorkOrderSelectorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Select Work Order</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          {workOrders.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">
              No work orders available.
            </p>
          ) : (
            <div className="space-y-2">
              {workOrders.map((workOrder) => (
                <div
                  key={workOrder.id}
                  className="p-3 border rounded cursor-pointer hover:bg-accent"
                  onClick={() => {
                    onSelect(workOrder);
                    onClose();
                  }}
                >
                  <div className="font-medium">{workOrder.customer}</div>
                  <div className="text-sm text-muted-foreground">
                    {workOrder.description}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
