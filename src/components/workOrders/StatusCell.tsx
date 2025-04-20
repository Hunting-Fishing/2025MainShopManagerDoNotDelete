
import { WorkOrder } from "@/types/workOrder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { statusConfig, isStatusTransitionAllowed } from "@/utils/workOrders/statusManagement";
import { useWorkOrderStatusManager } from "@/hooks/workOrders";
import { Loader2 } from "lucide-react";

interface StatusCellProps {
  workOrder: WorkOrder;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  userId: string;
  userName: string;
}

export const StatusCell = ({ workOrder, onStatusUpdate, userId, userName }: StatusCellProps) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusManager();
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
          className={`w-[130px] justify-center ${statusColor} border-2 shadow-sm hover:shadow transition-all`}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span className="font-medium">{statusConfig[currentStatus]?.label || currentStatus}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="bg-white border border-gray-100 shadow-md rounded-xl p-1">
        {Object.keys(statusConfig).map((status) => {
          const statusKey = status as WorkOrder["status"];
          const isValid = isStatusTransitionAllowed(currentStatus, statusKey);
          const config = statusConfig[statusKey];
          
          return (
            <DropdownMenuItem
              key={status}
              disabled={!isValid || status === currentStatus}
              onClick={() => handleStatusChange(statusKey)}
              className={`${isValid && status !== currentStatus ? config.color : ''} my-1 rounded-lg cursor-pointer ${!isValid || status === currentStatus ? 'opacity-50' : 'hover:shadow-sm'}`}
            >
              <div className={`h-2 w-2 rounded-full mr-2 bg-current`} />
              {config?.label || status}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
