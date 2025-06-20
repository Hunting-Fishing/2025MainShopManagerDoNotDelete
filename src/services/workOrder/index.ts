// Main work order service exports - single source of truth

// Query operations
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersByStatus,
  getUniqueTechnicians,
  getWorkOrderTimeEntries
} from './workOrderQueryService';

// Mutation operations (when the file exists)
export { 
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder 
} from './workOrderMutationService';

// Job lines operations
export { 
  getWorkOrderJobLines,
  createWorkOrderJobLine,
  updateWorkOrderJobLine,
  upsertWorkOrderJobLine,
  deleteWorkOrderJobLine
} from './jobLinesService';

// Parts operations - updated exports
export { 
  getWorkOrderParts,
  createWorkOrderPart,
  updateWorkOrderPart,
  deleteWorkOrderPart,
  getJobLineParts
} from './workOrderPartsService';

// Time tracking operations
export { 
  getWorkOrderTimeEntries as getTimeEntries,
  addTimeEntryToWorkOrder,
  updateTimeEntry,
  deleteTimeEntry
} from './workOrderTimeTrackingService';

// Activity operations
export { 
  recordWorkOrderActivity,
  getWorkOrderActivities,
  flagWorkOrderActivity
} from './workOrderActivityService';
