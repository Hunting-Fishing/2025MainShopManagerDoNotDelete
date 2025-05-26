
// Centralized work order utilities - single source of truth
export * from './generators';
export * from './mappers';
export * from './activity';
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
  WorkOrderStatus,
  priorityMap,
  determinePriority
} from './constants';

// Re-export service functions for backward compatibility
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersByStatus,
  getUniqueTechnicians
} from '../../services/workOrder/workOrderQueryService';

export { 
  createWorkOrder, 
  updateWorkOrder, 
  deleteWorkOrder,
  updateWorkOrderStatus
} from '../../services/workOrder/workOrderMutationService';

export { 
  recordWorkOrderActivity, 
  getWorkOrderActivities 
} from '../../services/workOrder/workOrderActivityService';

export { 
  getWorkOrderInventoryItems, 
  addInventoryItemToWorkOrder 
} from '../../services/workOrder/workOrderInventoryService';

export { 
  getWorkOrderTimeEntries, 
  addTimeEntryToWorkOrder 
} from '../../services/workOrder/workOrderTimeTrackingService';

// Note: CRUD operations are now centralized in src/services/workOrder/
