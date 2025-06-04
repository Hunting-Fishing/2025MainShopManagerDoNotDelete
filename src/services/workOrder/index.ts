
export * from './workOrderQueryService';
export * from './workOrderMutationService';

// Re-export commonly used functions for backward compatibility
export { 
  getAllWorkOrders, 
  getWorkOrderById,
  getWorkOrdersByCustomerId,
  getWorkOrdersForCalendar,
  getUniqueTechnicians
} from './workOrderQueryService';

export { 
  createWorkOrder, 
  updateWorkOrder, 
  updateWorkOrderStatus,
  deleteWorkOrder 
} from './workOrderMutationService';
