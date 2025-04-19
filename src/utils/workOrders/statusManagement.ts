
import { WorkOrder } from "@/types/workOrder";

// Status configuration for consistent styling and labels
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "Clock"
  },
  "in-progress": {
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "Play"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "CheckCircle"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: "XCircle"
  }
};

/**
 * Determines if a status transition is allowed
 */
export const isStatusTransitionAllowed = (
  currentStatus: WorkOrder["status"],
  newStatus: WorkOrder["status"]
): boolean => {
  // Always allow if same status
  if (currentStatus === newStatus) return false;
  
  // Define allowed transitions
  const allowedTransitions: Record<string, string[]> = {
    "pending": ["in-progress", "cancelled"],
    "in-progress": ["completed", "cancelled", "pending"],
    "completed": ["in-progress", "pending"],
    "cancelled": ["in-progress", "pending"]
  };
  
  return allowedTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Returns the available status options for the given current status
 */
export const getNextStatusOptions = (
  currentStatus: WorkOrder["status"]
): { label: string; status: WorkOrder["status"]; color: string }[] => {
  // Define allowed transitions
  const allowedTransitions: Record<string, string[]> = {
    "pending": ["in-progress", "cancelled"],
    "in-progress": ["completed", "cancelled", "pending"],
    "completed": ["in-progress", "pending"],
    "cancelled": ["in-progress", "pending"]
  };
  
  // Get allowed next statuses
  const nextStatuses = allowedTransitions[currentStatus] || [];
  
  // Map to objects with label and color
  return nextStatuses.map(status => ({
    label: statusConfig[status].label,
    status: status as WorkOrder["status"],
    color: statusConfig[status].color
  }));
};

/**
 * Handles side effects of status changes
 */
export const handleStatusTransition = (
  workOrder: WorkOrder,
  newStatus: WorkOrder["status"]
): Partial<WorkOrder> => {
  const updates: Partial<WorkOrder> = {
    status: newStatus
  };
  
  // Add timestamps based on the status change
  if (newStatus === "in-progress" && workOrder.status !== "in-progress") {
    updates.startTime = new Date().toISOString();
  } else if (newStatus === "completed") {
    updates.endTime = new Date().toISOString();
  }
  
  return updates;
};

/**
 * Generates activity message for status changes
 */
export const generateStatusChangeMessage = (
  oldStatus: WorkOrder["status"],
  newStatus: WorkOrder["status"],
  userName: string
): string => {
  const fromStatus = statusConfig[oldStatus]?.label || oldStatus;
  const toStatus = statusConfig[newStatus]?.label || newStatus;
  
  return `Status changed from ${fromStatus} to ${toStatus} by ${userName}`;
};
