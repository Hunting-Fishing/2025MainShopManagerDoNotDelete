
export * from './workOrderQueryService';
export * from './workOrderMutationService';

// Re-export commonly used functions for backward compatibility
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersByStatus 
} from './workOrderQueryService';

export { 
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder 
} from './workOrderMutationService';
