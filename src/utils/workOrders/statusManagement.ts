
import { WorkOrder } from "@/types/workOrder";
import { CheckCircle, Clock, Play, XCircle } from "lucide-react";

// Status configuration for consistent styling and labels with improved icon support
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: "Clock",
    description: "Work order has been created but work hasn't started"
  },
  "in-progress": {
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: "Play",
    description: "Work is currently being performed"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "CheckCircle",
    description: "All work has been completed"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: "XCircle",
    description: "Work order has been cancelled"
  }
};

// Define allowed status transitions map for consistent reference
export const allowedStatusTransitions = {
  "pending": ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled", "pending"],
  "completed": ["in-progress", "pending"],
  "cancelled": ["in-progress", "pending"]
};

/**
 * Determines if a status transition is allowed
 */
export const isStatusTransitionAllowed = (
  currentStatus: WorkOrder["status"],
  newStatus: WorkOrder["status"]
): boolean => {
  // Always deny if same status
  if (currentStatus === newStatus) return false;
  
  return allowedStatusTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Returns the available status options for the given current status
 */
export const getNextStatusOptions = (
  currentStatus: WorkOrder["status"]
): { label: string; status: WorkOrder["status"]; color: string }[] => {
  // Get allowed next statuses
  const nextStatuses = allowedStatusTransitions[currentStatus] || [];
  
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

/**
 * Get the appropriate icon component for a status
 */
export const getStatusIcon = (status: WorkOrder["status"]) => {
  switch (status) {
    case "pending":
      return Clock;
    case "in-progress":
      return Play;
    case "completed":
      return CheckCircle;
    case "cancelled":
      return XCircle;
    default:
      return Clock;
  }
};

/**
 * Returns status details including label, color, icon and description
 */
export const getStatusDetails = (status: WorkOrder["status"]) => {
  return statusConfig[status] || statusConfig["pending"];
};
