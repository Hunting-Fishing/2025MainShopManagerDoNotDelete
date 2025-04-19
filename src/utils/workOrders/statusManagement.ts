
import { WorkOrder, WorkOrderStatusType } from "@/types/workOrder";

export interface StatusOption {
  status: WorkOrderStatusType;
  label: string;
  color: string;
  nextSteps?: string[];
}

export interface PriorityOption {
  priority: WorkOrder["priority"];
  label: string;
  color: string;
  icon: string;
}

// Define the allowed status transitions and configurations
export const statusConfig: Record<WorkOrderStatusType, StatusOption> = {
  "pending": {
    status: "pending",
    label: "In Queue",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    nextSteps: ["in-progress", "cancelled"]
  },
  "in-progress": {
    status: "in-progress",
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    nextSteps: ["completed", "cancelled"]
  },
  "completed": {
    status: "completed",
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    nextSteps: ["in-progress"] // Allow reopening if needed
  },
  "cancelled": {
    status: "cancelled",
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    nextSteps: ["pending"] // Allow reactivating if needed
  }
};

// Define priority configurations
export const priorityConfig: Record<string, PriorityOption> = {
  "low": {
    priority: "low",
    label: "Low",
    color: "bg-green-100 text-green-800 border-green-300",
    icon: "ArrowDown"
  },
  "medium": {
    priority: "medium",
    label: "Medium",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    icon: "Minus"
  },
  "high": {
    priority: "high",
    label: "High",
    color: "bg-red-100 text-red-800 border-red-300",
    icon: "ArrowUp"
  }
};

// Get all possible next status options based on current status
export const getNextStatusOptions = (currentStatus: WorkOrderStatusType): StatusOption[] => {
  const config = statusConfig[currentStatus];
  
  if (!config || !config.nextSteps) {
    return [];
  }
  
  return config.nextSteps.map(status => statusConfig[status as WorkOrderStatusType]);
};

// Check if a status transition is allowed
export const isStatusTransitionAllowed = (
  currentStatus: WorkOrderStatusType,
  newStatus: WorkOrderStatusType
): boolean => {
  const config = statusConfig[currentStatus];
  return config?.nextSteps?.includes(newStatus) || false;
};

// Handle special actions when transitioning between statuses
export const handleStatusTransition = (
  workOrder: WorkOrder,
  newStatus: WorkOrderStatusType
): Partial<WorkOrder> => {
  const updates: Partial<WorkOrder> = { status: newStatus };
  
  // Add timestamp when work is started
  if (newStatus === 'in-progress' && workOrder.status === 'pending') {
    updates.startTime = new Date().toISOString();
  }
  
  // Add timestamp when work is completed
  if (newStatus === 'completed') {
    updates.endTime = new Date().toISOString();
  }
  
  // If reopening a completed work order
  if (newStatus === 'in-progress' && workOrder.status === 'completed') {
    // Don't reset the start time, but clear the end time
    updates.endTime = null;
  }
  
  return updates;
};

// Generate an audit message for status changes
export const generateStatusChangeMessage = (
  previousStatus: WorkOrderStatusType,
  newStatus: WorkOrderStatusType,
  userName: string
): string => {
  const prevLabel = statusConfig[previousStatus]?.label || previousStatus;
  const newLabel = statusConfig[newStatus]?.label || newStatus;
  
  return `Status changed from ${prevLabel} to ${newLabel} by ${userName}`;
};
