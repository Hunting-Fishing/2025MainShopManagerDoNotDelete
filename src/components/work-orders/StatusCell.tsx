
import { WorkOrder } from "@/types/workOrder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { statusConfig, isStatusTransitionAllowed } from "@/utils/workOrders/statusManagement";
import { useWorkOrderStatusUpdate } from "@/hooks/workOrders/useWorkOrderStatusUpdate";
import { Loader2 } from "lucide-react";

interface StatusCellProps {
  workOrder: WorkOrder;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  userId: string;
  userName: string;
}

export const StatusCell = ({ workOrder, onStatusUpdate, userId, userName }: StatusCellProps) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusUpdate();
  const currentStatus = workOrder.status;
  const statusColor = statusConfig[currentStatus]?.color || "";

  const handleStatusChange = async (newStatus: WorkOrder["status"]) => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
    }
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className={`w-[120px] justify-center ${statusColor} border`}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            statusConfig[currentStatus]?.label || currentStatus
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(statusConfig).map((status) => {
          const statusKey = status as WorkOrder["status"];
          const isValid = isStatusTransitionAllowed(currentStatus, statusKey);
          return (
            <DropdownMenuItem
              key={status}
              disabled={!isValid || status === currentStatus}
              onClick={() => handleStatusChange(statusKey)}
            >
              <div className={`h-2 w-2 rounded-full mr-2 ${statusConfig[statusKey]?.color || ""}`} />
              {statusConfig[statusKey]?.label || status}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
