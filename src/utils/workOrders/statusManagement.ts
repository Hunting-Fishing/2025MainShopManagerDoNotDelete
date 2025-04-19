import { WorkOrder } from "@/types/workOrder";

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
