
import { Button } from "@/components/ui/button";
import { useWorkOrderStatusUpdate } from "@/hooks/workOrders/useWorkOrderStatusUpdate";
import { WorkOrder } from "@/types/workOrder";
import { Loader2, CheckCircle } from "lucide-react";
import { useState, useEffect } from "react";
import { statusConfig } from "@/utils/workOrders/statusManagement";

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrder["status"];
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  className?: string;
  variant?: "default" | "outline" | "ghost";
  size?: "default" | "sm" | "lg";
}

export const StatusUpdateButton = ({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  className = "",
  variant = "default",
  size = "default"
}: StatusUpdateButtonProps) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusUpdate();
  const [showSuccess, setShowSuccess] = useState(false);
  const config = statusConfig[newStatus];

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (showSuccess) {
      timer = setTimeout(() => setShowSuccess(false), 2000);
    }
    return () => clearTimeout(timer);
  }, [showSuccess]);

  const handleClick = async () => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      setShowSuccess(true);
      onStatusUpdate(updatedWorkOrder);
    }
  };

  // Use status-specific colors for the button
  const buttonColorClass = (() => {
    if (variant !== "default") return "";
    
    switch (newStatus) {
      case "completed":
        return "bg-green-600 hover:bg-green-700";
      case "in-progress":
        return "bg-blue-600 hover:bg-blue-700";
      case "cancelled":
        return "bg-red-600 hover:bg-red-700";
      default:
        return ""; // Use default button color
    }
  })();

  return (
    <Button
      onClick={handleClick}
      disabled={isUpdating || showSuccess}
      variant={variant}
      size={size}
      className={`${className} ${buttonColorClass} transition-all duration-200`}
    >
      {isUpdating ? (
        <Loader2 className="h-4 w-4 animate-spin mr-1" />
      ) : showSuccess ? (
        <>
          <CheckCircle className="h-4 w-4 mr-1" />
          Updated
        </>
      ) : (
        `Mark as ${config?.label || newStatus}`
      )}
    </Button>
  );
};
