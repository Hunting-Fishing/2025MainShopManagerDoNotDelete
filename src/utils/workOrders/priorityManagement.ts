
import { WorkOrder } from "@/types/workOrder";
import { differenceInDays, parseISO } from "date-fns";

/**
 * Calculate priority based on due date and work order type
 */
export const calculateWorkOrderPriority = (workOrder: WorkOrder): "low" | "medium" | "high" => {
  if (!workOrder.dueDate) return "medium";
  
  const dueDate = parseISO(workOrder.dueDate);
  const now = new Date();
  
  // Calculate days until due
  const daysUntilDue = differenceInDays(dueDate, now);
  
  // Check if already overdue
  if (daysUntilDue < 0) {
    return "high";
  }
  
  // Priority logic based on days until due and service type
  if (daysUntilDue <= 1) {
    return "high";
  } else if (daysUntilDue <= 3) {
    // Emergency services are always high priority when close to due date
    if (workOrder.serviceType === "emergency") {
      return "high";
    }
    return "medium";
  } else if (daysUntilDue <= 7) {
    if (workOrder.serviceType === "emergency") {
      return "medium";
    }
    return "low";
  }
  
  return "low";
};

/**
 * Get priority label and style classes
 */
export const getPriorityDetails = (priority: WorkOrder["priority"]) => {
  switch (priority) {
    case "high":
      return {
        label: "High Priority",
        classes: "bg-red-100 text-red-800 border border-red-200"
      };
    case "medium":
      return {
        label: "Medium Priority",
        classes: "bg-yellow-100 text-yellow-800 border border-yellow-200"
      };
    case "low":
      return {
        label: "Low Priority",
        classes: "bg-green-100 text-green-800 border border-green-200"
      };
    default:
      return {
        label: "Normal Priority",
        classes: "bg-gray-100 text-gray-800 border border-gray-200"
      };
  }
};

/**
 * Update priority based on due date changes
 */
export const updatePriorityBasedOnDueDate = (workOrder: WorkOrder): WorkOrder => {
  const calculatedPriority = calculateWorkOrderPriority(workOrder);
  
  return {
    ...workOrder,
    priority: calculatedPriority
  };
};
