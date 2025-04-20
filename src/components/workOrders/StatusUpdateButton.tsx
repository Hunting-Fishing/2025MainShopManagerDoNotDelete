
import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { useWorkOrderStatusManagement } from '@/hooks/workOrders/useWorkOrderStatusManagement';
import { getStatusIcon, statusConfig } from '@/utils/workOrders/statusManagement';

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrder['status'];
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  size?: "xs" | "sm" | "default" | "lg" | "icon";
}

export function StatusUpdateButton({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  size = "default"
}: StatusUpdateButtonProps) {
  const { updateStatus, isUpdating } = useWorkOrderStatusManagement();
  const StatusIcon = getStatusIcon(newStatus);
  const config = statusConfig[newStatus];

  const handleClick = async () => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={isUpdating || workOrder.status === newStatus}
      className={`${config.color} border-2`}
    >
      <StatusIcon className="h-4 w-4 mr-2" />
      {config.label}
    </Button>
  );
}
