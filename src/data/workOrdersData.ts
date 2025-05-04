
/**
 * COMPATIBILITY FILE for @/data/workOrdersData
 * 
 * This file exists only to provide backward compatibility with components
 * that still import from @/data/workOrdersData
 */

// Re-export types from the proper location
export type { 
  WorkOrder, 
  WorkOrderStatusType, 
  WorkOrderPriorityType, 
  WorkOrderTemplate, 
  TimeEntry 
} from "@/types/workOrder";

// Re-export all utility functions from proper locations
export { 
  formatDate, 
  formatTime, 
  formatTimeInHoursAndMinutes 
} from "@/utils/dateUtils";

export { 
  statusMap, 
  priorityMap,
  normalizeWorkOrder
} from "@/utils/workOrders";

// Export empty mock data for backward compatibility
export const workOrders = [];
export const workOrderTemplates = [];
