
import { WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";

// Status map for display
export const statusMap: Record<WorkOrderStatusType, string> = {
  "pending": "Pending",
  "in-progress": "In Progress",
  "completed": "Completed",
  "cancelled": "Cancelled"
};

// Priority map for display with styling
export const priorityMap: Record<WorkOrderPriorityType, { label: string; classes: string; }> = {
  "low": {
    label: "Low",
    classes: "bg-slate-100 text-slate-700"
  },
  "medium": {
    label: "Medium",
    classes: "bg-blue-100 text-blue-700"
  },
  "high": {
    label: "High", 
    classes: "bg-red-100 text-red-700"
  }
};

// Helper function to get status display name
export const getStatusDisplay = (status: WorkOrderStatusType): string => {
  return statusMap[status] || "Unknown";
};

// Helper function to get priority display information
export const getPriorityDisplay = (priority: WorkOrderPriorityType): { label: string; classes: string; } => {
  return priorityMap[priority] || { label: "Unknown", classes: "" };
};
