
// Export everything from the unified service
export * from './workOrderUnifiedService';

// Keep backward compatibility with existing imports
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder,
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
  deleteTimeEntry,
  getUniqueTechnicians
} from './workOrderUnifiedService';
