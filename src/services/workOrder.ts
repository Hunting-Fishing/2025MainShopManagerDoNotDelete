// Re-export everything from the new service architecture
export * from './workOrder';
export { WorkOrderService as default } from './workOrder/WorkOrderService';

// Keep backward compatibility
import { 
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder
} from './workOrder';

export {
  getAllWorkOrders,
  getWorkOrderById,
  createWorkOrder,
  updateWorkOrder,
  updateWorkOrderStatus,
  deleteWorkOrder
};
