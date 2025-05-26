
// Centralized work order utilities - single source of truth
export * from './mappers';
export * from './formatters';
export * from './constants';

// Re-export specific functions to maintain backward compatibility
export { 
  formatDate, 
  formatTime, 
  formatTimeInHoursAndMinutes, 
  normalizeWorkOrder,
  calculateTotalTime,
  calculateBillableTime
} from './formatters';

export {
  statusMap,
  priorityMap,
  determinePriority
} from './constants';

// Re-export the WorkOrderStatus type for backward compatibility
export type { WorkOrderStatus } from './constants';

// Note: Core CRUD operations are now centralized in src/services/workOrder/
// Import them directly from there for better organization:
// import { getAllWorkOrders, createWorkOrder, etc. } from '@/services/workOrder';
