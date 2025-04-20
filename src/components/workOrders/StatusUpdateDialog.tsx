
import React from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { statusConfig, getStatusIcon, getNextStatusOptions } from "@/utils/workOrders/statusManagement";
import { useWorkOrderStatusManager } from "@/hooks/workOrders";
import { useWorkOrderAutomation } from "@/hooks/workOrders/useWorkOrderAutomation";
import { Loader2, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";

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
  const { handleStatusChange: handleAutomation } = useWorkOrderAutomation();
  const [open, setOpen] = React.useState(false);
  const [automationPending, setAutomationPending] = React.useState(false);
  const nextStatusOptions = getNextStatusOptions(workOrder.status);

  const handleStatusChange = async (newStatus: WorkOrder["status"]) => {
    setAutomationPending(true);
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
      
      // After updating status, we check if automation rules should run
      try {
        await handleAutomation(updatedWorkOrder);
      } catch (error) {
        console.error("Automation error:", error);
      } finally {
        setAutomationPending(false);
        setOpen(false);
      }
    } else {
      setAutomationPending(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            Update Work Order Status
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 ml-2">
              <Zap className="h-3 w-3 mr-1" /> Auto-workflows enabled
            </Badge>
          </DialogTitle>
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
                    disabled={isUpdating || automationPending}
                  >
                    <StatusIcon className="h-4 w-4 mr-2" />
                    {option.label}
                  </Button>
                );
              })}
            </div>
          </div>
          
          {(isUpdating || automationPending) && (
            <div className="flex justify-center items-center mt-4">
              <Loader2 className="h-5 w-5 animate-spin mr-2" />
              <p>{isUpdating ? "Updating status..." : "Running automation workflows..."}</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
