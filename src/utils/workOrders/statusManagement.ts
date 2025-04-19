
import { WorkOrder } from "@/types/workOrder";

// Status configuration with labels and UI styling
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border border-yellow-300"
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border border-blue-300"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border border-green-300"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-slate-100 text-slate-800 border border-slate-300"
  }
};

// Define valid status transitions
const validStatusTransitions = {
  "pending": ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled", "pending"],
  "completed": ["in-progress", "pending"],
  "cancelled": ["pending"]
};

// Check if a status transition is allowed
export function isStatusTransitionAllowed(
  currentStatus: WorkOrder["status"], 
  newStatus: WorkOrder["status"]
): boolean {
  // Always allow setting to the same status
  if (currentStatus === newStatus) return true;
  
  // Check if the transition is in the allowed transitions list
  return validStatusTransitions[currentStatus]?.includes(newStatus) || false;
}

// Get next possible status options
export function getNextStatusOptions(currentStatus: WorkOrder["status"]) {
  const allowedStatuses = validStatusTransitions[currentStatus] || [];
  
  return allowedStatuses.map(status => ({
    status: status as WorkOrder["status"],
    label: statusConfig[status].label
  }));
}

// Handle the business logic for transitioning from one status to another
export function handleStatusTransition(
  workOrder: WorkOrder, 
  newStatus: WorkOrder["status"]
): Partial<WorkOrder> {
  const updates: Partial<WorkOrder> = {
    status: newStatus,
  };
  
  const currentDate = new Date().toISOString();
  
  switch (newStatus) {
    case "in-progress":
      // When moving to "in-progress", set the start time if it's not already set
      if (!workOrder.startTime) {
        updates.startTime = currentDate;
      }
      break;
      
    case "completed":
      // When completing a work order, set the end time
      updates.endTime = currentDate;
      break;
      
    case "cancelled":
      // For cancelled orders, also set an end time
      updates.endTime = currentDate;
      break;
      
    case "pending":
      // If moving back to pending from in-progress, keep the start time
      break;
  }
  
  return updates;
}

// Generate an appropriate message for activity tracking
export function generateStatusChangeMessage(
  oldStatus: string,
  newStatus: string,
  userName: string
): string {
  return `Status changed from ${oldStatus} to ${newStatus} by ${userName}`;
}
