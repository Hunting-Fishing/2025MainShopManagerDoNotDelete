
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";
import { useWorkOrderStatusUpdate } from "@/hooks/workOrders/useWorkOrderStatusUpdate";
import { Loader2 } from "lucide-react";

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrderStatusType;
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  size?: "default" | "sm" | "lg" | "icon";
}

export function StatusUpdateButton({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  size = "default"
}: StatusUpdateButtonProps) {
  const { updateStatus, isUpdating } = useWorkOrderStatusUpdate();
  const [loading, setLoading] = useState(false);

  // Define button appearance based on status
  const getButtonConfig = (status: WorkOrderStatusType) => {
    switch (status) {
      case "pending":
        return { label: "Move to Queue", variant: "outline" as const };
      case "in-progress":
        return { label: "Start Work", variant: "default" as const, className: "bg-blue-600 hover:bg-blue-700" };
      case "completed":
        return { label: "Complete", variant: "default" as const, className: "bg-green-600 hover:bg-green-700" };
      case "cancelled":
        return { label: "Cancel", variant: "outline" as const, className: "text-red-600 border-red-300 hover:bg-red-50" };
      default:
        return { label: "Update Status", variant: "outline" as const };
    }
  };

  const buttonConfig = getButtonConfig(newStatus);
  
  const handleClick = async () => {
    setLoading(true);
    try {
      const updatedWorkOrder = await updateStatus(
        workOrder,
        newStatus,
        userId,
        userName
      );
      
      if (updatedWorkOrder) {
        onStatusUpdate(updatedWorkOrder);
      }
    } catch (error) {
      console.error("Error updating status:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Button
      variant={buttonConfig.variant}
      size={size}
      className={buttonConfig.className}
      onClick={handleClick}
      disabled={loading || isUpdating}
    >
      {loading ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : null}
      {buttonConfig.label}
    </Button>
  );
}
