
// Re-export everything from each service file
export * from './workOrderQueryService';
export * from './workOrderMutationService';
export * from './workOrderActivityService';
export * from './workOrderInventoryService';
export * from './workOrderTimeTrackingService';

// Export the main functions for backward compatibility
export { getAllWorkOrders, getWorkOrderById } from './workOrderQueryService';
export { createWorkOrder, updateWorkOrder, deleteWorkOrder } from './workOrderMutationService';
export { recordWorkOrderActivity, getWorkOrderActivities } from './workOrderActivityService';
export { getWorkOrderInventoryItems, addInventoryItemToWorkOrder } from './workOrderInventoryService';
export { getWorkOrderTimeEntries, addTimeEntryToWorkOrder } from './workOrderTimeTrackingService';

// Export types
export type { WorkOrder, WorkOrderInventoryItem, TimeEntry } from '@/types/workOrder';
