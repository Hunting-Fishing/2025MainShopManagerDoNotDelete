
import { Button } from "@/components/ui/button";
import { useWorkOrderStatusUpdate } from "@/hooks/workOrders/useWorkOrderStatusUpdate";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { Loader2 } from "lucide-react";

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrderStatusType;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  className?: string;
}

export const StatusUpdateButton = ({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  className = ""
}: StatusUpdateButtonProps) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusUpdate();

  const handleClick = async () => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
    }
  };

  return (
    <Button
      onClick={handleClick}
      disabled={isUpdating}
      className={className}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        `Mark as ${newStatus}`
      )}
    </Button>
  );
};
