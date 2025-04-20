
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig, getStatusIcon, getNextStatusOptions } from "@/utils/workOrders/statusManagement";
import { useWorkOrderStatusManager } from "@/hooks/workOrders";
import { Loader2 } from "lucide-react";

interface StatusUpdateDialogProps {
  workOrder: WorkOrder;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  children: React.ReactNode;
}

export function StatusUpdateDialog({ 
  workOrder, 
  userId, 
  userName, 
  onStatusUpdate,
  children 
}: StatusUpdateDialogProps) {
  const { updateStatus, isUpdating } = useWorkOrderStatusManager();
  const [open, setOpen] = React.useState(false);
  const nextStatusOptions = getNextStatusOptions(workOrder.status);

  const handleStatusChange = async (newStatus: WorkOrder["status"]) => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
      setOpen(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Update Work Order Status</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <div className="mb-4">
            <p className="text-sm text-muted-foreground">
              Current Status: 
              <span className={`inline-block ml-2 px-2 py-0.5 rounded-full ${statusConfig[workOrder.status].color}`}>
                {statusConfig[workOrder.status].label}
              </span>
            </p>
          </div>
          
          <div className="space-y-2">
            <p className="text-sm font-medium">Select New Status:</p>
            <div className="grid grid-cols-2 gap-3 pt-2">
              {nextStatusOptions.map((option) => {
                const StatusIcon = getStatusIcon(option.status);
                return (
                  <Button
                    key={option.status}
                    variant="outline"
                    className={`${option.color} justify-start`}
                    onClick={() => handleStatusChange(option.status)}
                    disabled={isUpdating}
                  >
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {isUpdating && (
            <div className="flex justify-center items-center mt-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <p>Updating status...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
