
import React from 'react';
import { Button } from "@/components/ui/button";
import { WorkOrder } from "@/types/workOrder";
import { updateWorkOrder } from "@/utils/workOrders";
import { recordWorkOrderActivity } from "@/utils/workOrders/activity";
import { Check, X, RefreshCcw, Play } from "lucide-react";
import { toast } from "@/hooks/use-toast";

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
  const [isUpdating, setIsUpdating] = React.useState(false);

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
    setIsUpdating(true);
    try {
      // Create updated work order object
      const updatedWorkOrder = {
        ...workOrder,
        status: newStatus,
        lastUpdatedBy: userName,
        lastUpdatedAt: new Date().toISOString()
      };
      
      // Capture status-specific timestamps
      if (newStatus === "in-progress" && workOrder.status !== "in-progress") {
        updatedWorkOrder.startTime = new Date().toISOString();
      } else if (newStatus === "completed") {
        updatedWorkOrder.endTime = new Date().toISOString();
      }
      
      // Update work order in database
      await updateWorkOrder(updatedWorkOrder);
      
      // Record activity
      const action = getActionLabel();
      await recordWorkOrderActivity(
        action,
        workOrder.id,
        userId,
        userName
      );
      
      // Call parent callback
      onStatusUpdate(updatedWorkOrder);
      
      // Show success message
      toast({
        title: "Status Updated",
        description: `Work order ${workOrder.id.substring(0, 8)} has been ${newStatus.replace('-', ' ')}.`,
      });
    } catch (error) {
      console.error("Error updating work order status:", error);
      toast({
        title: "Error",
        description: "Failed to update work order status",
        variant: "destructive",
      });
    } finally {
      setIsUpdating(false);
    }
  };

  // Get appropriate action label for activity record
  const getActionLabel = () => {
    switch(newStatus) {
      case "completed": return "Completed";
      case "cancelled": return "Cancelled";
      case "in-progress": 
        return workOrder.status === "completed" || workOrder.status === "cancelled" 
          ? "Reopened" 
          : "Started";
      case "pending": return "Reopened";
      default: return "Updated";
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
