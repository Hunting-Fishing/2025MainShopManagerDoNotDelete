
import React from 'react';
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { Check, X, RefreshCcw, Play } from "lucide-react";
import { useWorkOrderStatusManager } from "@/hooks/workOrders";

interface StatusUpdateButtonProps {
  workOrder: WorkOrder;
  newStatus: WorkOrder["status"];
  userId: string;
  userName: string;
  onStatusUpdate: (updatedWorkOrder: WorkOrder) => void;
  size?: "sm" | "default" | "lg";
}

export const StatusUpdateButton: React.FC<StatusUpdateButtonProps> = ({
  workOrder,
  newStatus,
  userId,
  userName,
  onStatusUpdate,
  size = "default"
}) => {
  const { updateStatus, isUpdating } = useWorkOrderStatusManager();

  // Determine button appearance based on status
  const getButtonVariant = () => {
    switch(newStatus) {
      case "completed": return "default";
      case "cancelled": return "destructive";
      case "in-progress": return workOrder.status === "completed" ? "outline" : "default";
      case "pending": return "outline";
      default: return "outline";
    }
  };

  // Get appropriate icon for the button
  const getButtonIcon = () => {
    switch(newStatus) {
      case "completed": return <Check className="h-4 w-4 mr-1" />;
      case "cancelled": return <X className="h-4 w-4 mr-1" />;
      case "in-progress": 
        return workOrder.status === "completed" || workOrder.status === "cancelled" 
          ? <RefreshCcw className="h-4 w-4 mr-1" /> 
          : <Play className="h-4 w-4 mr-1" />;
      case "pending": return <RefreshCcw className="h-4 w-4 mr-1" />;
      default: return null;
    }
  };

  // Get button label
  const getButtonLabel = () => {
    if (workOrder.status === "completed" || workOrder.status === "cancelled") {
      return "Reopen";
    }
    
    switch(newStatus) {
      case "completed": return "Complete";
      case "cancelled": return "Cancel";
      case "in-progress": return "Start Work";
      default: return "Update Status";
    }
  };

  const handleStatusUpdate = async () => {
    const updatedWorkOrder = await updateStatus(workOrder, newStatus, userId, userName);
    if (updatedWorkOrder) {
      onStatusUpdate(updatedWorkOrder);
    }
  };

  return (
    <Button
      variant={getButtonVariant()}
      onClick={handleStatusUpdate}
      disabled={isUpdating}
      size={size}
    >
      {isUpdating ? (
        <div className="flex items-center">
          <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          Updating...
        </div>
      ) : (
        <>
          {getButtonIcon()}
          {getButtonLabel()}
        </>
      )}
    </Button>
  );
};
