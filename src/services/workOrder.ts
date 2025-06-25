
// Main work order service exports - no circular imports
export { WorkOrderService as default } from './workOrder/WorkOrderService';
export { WorkOrderService } from './workOrder/WorkOrderService';
export { WorkOrderRepository } from './workOrder/WorkOrderRepository';

// Create singleton instances for legacy function exports
import { WorkOrderService } from './workOrder/WorkOrderService';
const workOrderService = new WorkOrderService();

// Legacy function exports for backward compatibility
export const getAllWorkOrders = () => workOrderService.getAllWorkOrders();
export const getWorkOrderById = (id: string) => workOrderService.getWorkOrderById(id);
export const createWorkOrder = (data: any) => workOrderService.createWorkOrder(data);
export const updateWorkOrder = (id: string, data: any) => workOrderService.updateWorkOrder(id, data);
export const updateWorkOrderStatus = (id: string, status: string) => workOrderService.updateWorkOrderStatus(id, status);
export const deleteWorkOrder = (id: string) => workOrderService.deleteWorkOrder(id);

// Missing functions that components are trying to import
export const getWorkOrdersByCustomerId = (customerId: string) => workOrderService.getWorkOrdersByCustomer(customerId);

// Placeholder functions for parts (to be implemented later)
export const updateWorkOrderPart = async (partId: string, data: any) => {
  console.warn('updateWorkOrderPart not implemented yet');
  return null;
};

export const deleteWorkOrderPart = async (partId: string) => {
  console.warn('deleteWorkOrderPart not implemented yet');
};

// Placeholder function for technicians
export const getUniqueTechnicians = async (): Promise<string[]> => {
  try {
    const workOrders = await workOrderService.getAllWorkOrders();
    const technicians = [...new Set(workOrders
      .map(wo => wo.technician)
      .filter(Boolean)
    )] as string[];
    return technicians;
  } catch (error) {
    console.error('Error fetching unique technicians:', error);
    return [];
  }
};
