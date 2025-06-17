
export * from './workOrderQueryService';
export * from './workOrderMutationService';

// Re-export commonly used functions for backward compatibility
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersByStatus,
  getUniqueTechnicians,
  getWorkOrderTimeEntries
} from './workOrderQueryService';

export { 
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder 
} from './workOrderMutationService';
