
import { WorkOrder } from "@/types/workOrder";
import { CheckCircle, Clock, Play, XCircle } from "lucide-react";

// Enhanced status configuration with more detailed metadata
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-amber-100 text-amber-800 border-amber-300",
    icon: Clock,
    description: "Work order has been created but work hasn't started",
    allowedTransitions: ["in-progress", "cancelled"] as WorkOrder["status"][],
    nextSteps: [
      { status: "in-progress" as WorkOrder["status"], label: "Start Work" },
      { status: "cancelled" as WorkOrder["status"], label: "Cancel Order" }
    ]
  },
  "in-progress": {
    label: "In Progress", 
    color: "bg-blue-100 text-blue-800 border-blue-300",
    icon: Play,
    description: "Work is currently being performed",
    allowedTransitions: ["completed", "cancelled", "pending"] as WorkOrder["status"][],
    nextSteps: [
      { status: "completed" as WorkOrder["status"], label: "Complete Work" },
      { status: "cancelled" as WorkOrder["status"], label: "Cancel Work" },
      { status: "pending" as WorkOrder["status"], label: "Pause Work" }
    ]
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: CheckCircle,
    description: "All work has been completed",
    allowedTransitions: ["in-progress"] as WorkOrder["status"][],
    nextSteps: [
      { status: "in-progress" as WorkOrder["status"], label: "Reopen Work" }
    ]
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: XCircle,
    description: "Work order has been cancelled",
    allowedTransitions: ["pending", "in-progress"] as WorkOrder["status"][],
    nextSteps: [
      { status: "pending" as WorkOrder["status"], label: "Reactivate Order" },
      { status: "in-progress" as WorkOrder["status"], label: "Resume Work" }
    ]
  }
} as const;

// Get the appropriate icon component for a status
export const getStatusIcon = (status: WorkOrder["status"]) => {
  return statusConfig[status].icon;
};

// Enhanced transition validation
export const validateStatusTransition = (
  currentStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"]
): boolean => {
  if (currentStatus === newStatus) return false;
  return statusConfig[currentStatus].allowedTransitions.includes(newStatus);
};

// Alias for validateStatusTransition to match component imports
export const isStatusTransitionAllowed = validateStatusTransition;

// Get next possible statuses based on current status
export const getNextStatusOptions = (
  currentStatus: WorkOrder["status"]
): Array<{ status: WorkOrder["status"]; label: string }> => {
  return statusConfig[currentStatus].nextSteps;
};

// Detailed status change description generator
export const generateStatusChangeDescription = (
  oldStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"], 
  userName: string
): string => {
  const oldStatusLabel = statusConfig[oldStatus].label;
  const newStatusLabel = statusConfig[newStatus].label;
  return `Work order status changed from ${oldStatusLabel} to ${newStatusLabel} by ${userName}`;
};

// Alias for generateStatusChangeDescription to match component imports
export const generateStatusChangeMessage = generateStatusChangeDescription;

// Comprehensive status change handler
export const handleStatusTransition = (
  workOrder: WorkOrder, 
  newStatus: WorkOrder["status"]
): Partial<WorkOrder> => {
  if (!validateStatusTransition(workOrder.status, newStatus)) {
    throw new Error(`Invalid status transition from ${workOrder.status} to ${newStatus}`);
  }

  const updates: Partial<WorkOrder> = {
    status: newStatus
  };

  // Timestamp management
  switch (newStatus) {
    case "in-progress":
      if (!workOrder.startTime) {
        updates.startTime = new Date().toISOString();
      }
      break;
    case "completed":
    case "cancelled":
      updates.endTime = new Date().toISOString();
      break;
  }

  return updates;
};
