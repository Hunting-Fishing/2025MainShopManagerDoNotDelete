
import { WorkOrder } from "@/types/workOrder";

type WorkOrderStatusType = WorkOrder['status'];

/**
 * Valid workflow status transitions for work orders
 */
const validTransitions: Record<WorkOrderStatusType, WorkOrderStatusType[]> = {
  "pending": ["in-progress", "cancelled"],
  "in-progress": ["completed", "cancelled"],
  "completed": ["in-progress"], // Allow reopening a completed work order
  "cancelled": ["pending", "in-progress"] // Allow reactivating a cancelled work order
};

/**
 * Check if a status transition is valid
 */
export const isValidStatusTransition = (
  currentStatus: WorkOrder['status'],
  newStatus: WorkOrder['status']
): boolean => {
  // Allow same status (no transition)
  if (currentStatus === newStatus) return true;
  
  // Check transition rules
  return validTransitions[currentStatus]?.includes(newStatus) || false;
};

/**
 * Get available status transitions for a given status
 */
export const getAvailableStatusTransitions = (
  currentStatus: WorkOrder['status']
): WorkOrder['status'][] => {
  return validTransitions[currentStatus] || [];
};

/**
 * Status for badge display
 */
export const statusConfig = {
  "pending": {
    label: "Pending",
    color: "bg-yellow-100 text-yellow-800 border-yellow-300",
    description: "Work not yet started"
  },
  "in-progress": {
    label: "In Progress",
    color: "bg-blue-100 text-blue-800 border-blue-300",
    description: "Work is currently in progress"
  },
  "completed": {
    label: "Completed",
    color: "bg-green-100 text-green-800 border-green-300",
    description: "Work has been completed"
  },
  "cancelled": {
    label: "Cancelled",
    color: "bg-red-100 text-red-800 border-red-300",
    description: "Work has been cancelled"
  }
};
