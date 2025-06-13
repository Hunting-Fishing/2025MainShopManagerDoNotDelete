
// Re-export functions from the correct service files for backward compatibility
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersByStatus,
  getUniqueTechnicians,
  getWorkOrderTimeEntries as getWorkOrderTimeEntriesQuery
} from './workOrderQueryService';

export { 
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder 
} from './workOrderMutationService';

// Re-export job lines functions
export { 
  getWorkOrderJobLines,
  createWorkOrderJobLine,
  updateWorkOrderJobLine,
  upsertWorkOrderJobLine,
  deleteWorkOrderJobLine
} from './jobLinesService';

// Re-export parts functions
export { 
  getWorkOrderParts,
  createWorkOrderPart,
  updateWorkOrderPart,
  deleteWorkOrderPart,
  getJobLineParts
} from './workOrderPartsService';

// Re-export time tracking functions
export { 
  getWorkOrderTimeEntries,
  addTimeEntryToWorkOrder,
  updateTimeEntry,
  deleteTimeEntry
} from './workOrderTimeTrackingService';

// Re-export activity functions
export { 
  recordWorkOrderActivity,
  getWorkOrderActivities,
  flagWorkOrderActivity
} from './workOrderActivityService';
