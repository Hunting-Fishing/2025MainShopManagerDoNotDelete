
import { WorkOrder } from "@/types/workOrder";

// Define configurations for each status
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-300",
    description: "Work has not yet been started"
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border border-blue-300",
    description: "Work is currently being performed"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border border-green-300",
    description: "Work has been completed"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border border-red-300",
    description: "Work has been cancelled"
  }
};

// Define status transitions
interface StatusTransition {
  status: WorkOrder["status"];
  label: string;
  color: string;
  buttonVariant: "outline" | "secondary" | "destructive" | "default";
  icon: string;
}

// Define what status can be transitioned to from current status
export const getNextStatusOptions = (currentStatus: WorkOrder["status"]): StatusTransition[] => {
  switch (currentStatus) {
    case "pending":
      return [
        { 
          status: "in-progress", 
          label: "Start Work", 
          color: "bg-blue-100", 
          buttonVariant: "default",
          icon: "play" 
        },
        { 
          status: "cancelled", 
          label: "Cancel", 
          color: "bg-red-100", 
          buttonVariant: "destructive",
          icon: "x" 
        }
      ];
    case "in-progress":
      return [
        { 
          status: "completed", 
          label: "Complete", 
          color: "bg-green-100", 
          buttonVariant: "default",
          icon: "check" 
        },
        { 
          status: "cancelled", 
          label: "Cancel", 
          color: "bg-red-100", 
          buttonVariant: "destructive",
          icon: "x" 
        }
      ];
    case "completed":
      return [
        { 
          status: "in-progress", 
          label: "Reopen", 
          color: "bg-blue-100", 
          buttonVariant: "outline",
          icon: "refresh-ccw" 
        }
      ];
    case "cancelled":
      return [
        { 
          status: "pending", 
          label: "Reopen", 
          color: "bg-yellow-100", 
          buttonVariant: "outline",
          icon: "refresh-ccw" 
        }
      ];
    default:
      return [];
  }
};

// Check if a status transition is allowed
export const isStatusTransitionAllowed = (
  currentStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"]
): boolean => {
  if (currentStatus === newStatus) {
    return false; // No change needed
  }
  
  // Get list of allowed next statuses
  const allowedTransitions = getNextStatusOptions(currentStatus);
  
  // Check if the new status is in the list of allowed transitions
  return allowedTransitions.some(transition => transition.status === newStatus);
};

// Generate updates when transitioning to a new status
export const handleStatusTransition = (
  workOrder: WorkOrder, 
  newStatus: WorkOrder["status"]
): Partial<WorkOrder> => {
  const updates: Partial<WorkOrder> = { status: newStatus };
  
  // Add any status-specific updates
  if (newStatus === "in-progress" && workOrder.status !== "in-progress") {
    updates.startTime = new Date().toISOString();
  } else if (newStatus === "completed" && !workOrder.endTime) {
    updates.endTime = new Date().toISOString();
  }
  
  return updates;
};

// Generate human-readable message for status changes
export const generateStatusChangeMessage = (
  oldStatus: WorkOrder["status"],
  newStatus: WorkOrder["status"],
  userName: string
): string => {
  const statusLabels = {
    pending: "Pending",
    "in-progress": "In Progress",
    completed: "Completed",
    cancelled: "Cancelled"
  };
  
  if (oldStatus === "completed" || oldStatus === "cancelled") {
    if (newStatus === "in-progress") {
      return `Work order reopened and marked as In Progress by ${userName}`;
    } else if (newStatus === "pending") {
      return `Work order reopened and marked as Pending by ${userName}`;
    }
  }
  
  return `Status changed from ${statusLabels[oldStatus]} to ${statusLabels[newStatus]} by ${userName}`;
};
