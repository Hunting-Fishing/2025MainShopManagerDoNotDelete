
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
import { cn } from "@/lib/utils";

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
          className={cn(
            'w-[130px] justify-center',
            'border-2 transition-all duration-200',
            'shadow-sm hover:shadow-md',
            'transform hover:scale-102 active:scale-98',
            statusColor,
            'font-medium'
          )}
          disabled={isUpdating}
        >
          {isUpdating ? (
            <Loader2 className="h-4 w-4 animate-spin mr-2" />
          ) : (
            <span>{statusConfig[currentStatus]?.label || currentStatus}</span>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent 
        className="bg-white rounded-lg border border-gray-100 shadow-lg p-1 min-w-[160px]"
        align="end"
      >
        {Object.keys(statusConfig).map((status) => {
          const statusKey = status as WorkOrder["status"];
          const isValid = isStatusTransitionAllowed(currentStatus, statusKey);
          const config = statusConfig[statusKey];
          const StatusIcon = config.icon;
          
          return (
            <DropdownMenuItem
              key={status}
              disabled={!isValid || status === currentStatus}
              onClick={() => handleStatusChange(statusKey)}
              className={cn(
                'my-1 rounded-md transition-all duration-200',
                'flex items-center gap-2 px-3 py-2',
                isValid && status !== currentStatus ? config.color : '',
                !isValid || status === currentStatus ? 'opacity-50' : 'hover:scale-102 active:scale-98',
              )}
            >
              <StatusIcon className="h-4 w-4" />
              {config?.label || status}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
