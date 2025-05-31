
// Centralized work order utilities - single source of truth
export * from './mappers';
export * from './formatters';
export * from './constants';

// Import date/time formatting functions from the correct utilities
export { 
  formatDate, 
  formatTime, 
  formatTimeInHoursAndMinutes
} from '../dateUtils';

export { 
  formatDate as formatDateFromTimeTracking, 
  formatTime as formatTimeFromTimeTracking, 
  formatTimeInHoursAndMinutes as formatTimeInHoursAndMinutesFromTimeTracking
} from '../../components/work-orders/time-tracking/utils/formatTime';

// Re-export specific functions from formatters
export { 
  normalizeWorkOrder,
  formatWorkOrderForDb
} from './formatters';

// Re-export from constants if they exist
export {
  statusMap,
  priorityMap,
  determinePriority
} from './constants';

// Re-export the WorkOrderStatus type for backward compatibility
export type { WorkOrderStatus } from './constants';

// Note: calculateTotalTime and calculateBillableTime functions need to be implemented
// For now, providing placeholder implementations
export const calculateTotalTime = (timeEntries: any[]) => {
  return timeEntries.reduce((total, entry) => {
    if (entry.end_time && entry.start_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }
    return total;
  }, 0);
};

export const calculateBillableTime = (timeEntries: any[]) => {
  return timeEntries.reduce((total, entry) => {
    if (entry.is_billable && entry.end_time && entry.start_time) {
      const start = new Date(entry.start_time);
      const end = new Date(entry.end_time);
      return total + (end.getTime() - start.getTime()) / (1000 * 60); // minutes
    }
    return total;
  }, 0);
};

// Note: Core CRUD operations are now centralized in src/services/workOrder/
// Import them directly from there for better organization:
// import { getAllWorkOrders, createWorkOrder, etc. } from '@/services/workOrder';
