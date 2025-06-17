
// Unified service that re-exports all work order functionality
export * from './core/workOrderCoreService';
export * from './core/workOrderJobLinesService';
export * from './core/workOrderPartsService';
export * from './core/workOrderTimeService';

// Legacy exports for backward compatibility
export {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  deleteWorkOrder,
  updateWorkOrderStatus,
  getWorkOrdersByCustomerId,
  getUniqueTechnicians,
  getWorkOrderJobLines,
  createWorkOrderJobLine,
  updateWorkOrderJobLine,
  deleteWorkOrderJobLine,
  getWorkOrderParts,
  getJobLineParts,
  createWorkOrderPart,
  updateWorkOrderPart,
  deleteWorkOrderPart,
  getWorkOrderTimeEntries,
  addTimeEntryToWorkOrder,
  updateTimeEntry,
  deleteTimeEntry
} from './index';
