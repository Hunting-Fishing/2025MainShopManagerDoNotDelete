
import { WorkOrder } from "@/types/workOrder";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { isValidStatusTransition } from "@/utils/workOrders/statusManagement";
import { useWorkOrderStatusUpdate } from "@/hooks/workOrders/useWorkOrderStatusUpdate";
import { Loader2 } from "lucide-react";

interface StatusCellProps {
  workOrder: WorkOrder;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  userId: string;
  userName: string;
}

const getStatusColor = (status: WorkOrder["status"]) => {
  const colors = {
    "pending": "bg-yellow-100 text-yellow-800 border-yellow-300",
    "in-progress": "bg-blue-100 text-blue-800 border-blue-300",
    "completed": "bg-green-100 text-green-800 border-green-300",
    "cancelled": "bg-red-100 text-red-800 border-red-300"
  };
  return colors[status];
};

export const StatusCell = ({ workOrder, onStatusUpdate, userId, userName }: StatusCellProps) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusUpdate();
  const statusColor = getStatusColor(workOrder.status);

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
            workOrder.status
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        {Object.keys(getStatusColor(workOrder.status)).map((status) => {
          const isValid = isValidStatusTransition(workOrder.status, status as WorkOrder["status"]);
          return (
            <DropdownMenuItem
              key={status}
              disabled={!isValid || status === workOrder.status}
              onClick={() => handleStatusChange(status as WorkOrder["status"])}
            >
              <div className={`h-2 w-2 rounded-full mr-2 ${getStatusColor(status as WorkOrder["status"])}`} />
              {status}
            </DropdownMenuItem>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};
