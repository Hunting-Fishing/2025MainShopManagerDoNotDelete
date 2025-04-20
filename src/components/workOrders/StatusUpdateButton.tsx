import React from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrder } from '@/types/workOrder';
import { useWorkOrderStatusManagement } from '@/hooks/workOrders/useWorkOrderStatusManagement';
import { getStatusIcon, statusConfig } from '@/utils/workOrders/statusManagement';
import { Loader2, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrder['status'];
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  size?: "xs" | "sm" | "default" | "lg" | "icon";
  showAutomation?: boolean;
}

export function StatusUpdateButton({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  size = "default",
  showAutomation = false
}: StatusUpdateButtonProps) {
  const { updateStatus, isUpdating } = useWorkOrderStatusManagement();
  const StatusIcon = getStatusIcon(newStatus);
  const config = statusConfig[newStatus];
  const [automating, setAutomating] = React.useState(false);

  const handleClick = async () => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
      if (showAutomation) {
        setAutomating(true);
        setTimeout(() => setAutomating(false), 2000);
      }
    }
  };

  return (
    <Button
      variant="outline"
      size={size}
      onClick={handleClick}
      disabled={isUpdating || workOrder.status === newStatus || automating}
      className={cn(
        config.color,
        'border-2 relative',
        'shadow-sm transition-all duration-300',
        'hover:shadow-md hover:scale-102 active:scale-98',
        'focus:outline-none focus:ring-2 focus:ring-offset-2'
      )}
    >
      {isUpdating || automating ? (
        automating ? (
          <>
            <Zap className="h-4 w-4 mr-2 animate-pulse" />
            <span className="animate-pulse">Automating...</span>
          </>
        ) : (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            <span>{config.label}</span>
          </>
        )
      ) : (
        <>
          <StatusIcon className="h-4 w-4 mr-2" />
          <span className="font-medium">{config.label}</span>
        </>
      )}
    </Button>
  );
}
