
// Export new consolidated services
export * from './core/workOrderCoreService';
export * from './core/workOrderJobLinesService';
export * from './core/workOrderPartsService';
export * from './core/workOrderTimeService';

// Import the services for use in legacy functions
import { workOrderCoreService } from './core/workOrderCoreService';
import { workOrderJobLinesService } from './core/workOrderJobLinesService';
import { workOrderPartsService } from './core/workOrderPartsService';
import { workOrderTimeService } from './core/workOrderTimeService';

// Backward compatibility exports
export { workOrderCoreService as workOrderService } from './core/workOrderCoreService';
export { workOrderJobLinesService as jobLinesService } from './core/workOrderJobLinesService';
export { workOrderPartsService as partsService } from './core/workOrderPartsService';
export { workOrderTimeService as timeService } from './core/workOrderTimeService';

// Legacy function exports for backward compatibility
export const getAllWorkOrders = () => workOrderCoreService.getAll();
export const getWorkOrderById = (id: string) => workOrderCoreService.getById(id);
export const createWorkOrder = (data: any) => workOrderCoreService.create(data);
export const updateWorkOrder = (id: string, data: any) => workOrderCoreService.update(id, data);
export const deleteWorkOrder = (id: string) => workOrderCoreService.delete(id);

// Add missing status update function
export const updateWorkOrderStatus = (id: string, status: string) => workOrderCoreService.update(id, { status });

// Add missing query functions
export const getWorkOrdersByCustomerId = async (customerId: string) => {
  const allWorkOrders = await workOrderCoreService.getAll();
  return allWorkOrders.filter(wo => wo.customer_id === customerId);
};

export const getUniqueTechnicians = async () => {
  const allWorkOrders = await workOrderCoreService.getAll();
  const technicians = allWorkOrders
    .map(wo => wo.technician || 'Unassigned')
    .filter((tech, index, array) => array.indexOf(tech) === index);
  return technicians;
};

export const getWorkOrderJobLines = (workOrderId: string) => workOrderJobLinesService.getByWorkOrderId(workOrderId);
export const createWorkOrderJobLine = (data: any) => workOrderJobLinesService.create(data);
export const updateWorkOrderJobLine = (id: string, data: any) => workOrderJobLinesService.update(id, data);
export const deleteWorkOrderJobLine = (id: string) => workOrderJobLinesService.delete(id);

export const getWorkOrderParts = (workOrderId: string) => workOrderPartsService.getByWorkOrderId(workOrderId);
export const getJobLineParts = (jobLineId: string) => workOrderPartsService.getByJobLineId(jobLineId);
export const createWorkOrderPart = (data: any) => workOrderPartsService.create(data);
export const updateWorkOrderPart = (id: string, data: any) => workOrderPartsService.update(id, data);
export const deleteWorkOrderPart = (id: string) => workOrderPartsService.delete(id);

export const getWorkOrderTimeEntries = (workOrderId: string) => workOrderTimeService.getByWorkOrderId(workOrderId);
export const addTimeEntryToWorkOrder = (data: any) => workOrderTimeService.create(data);
export const updateTimeEntry = (id: string, data: any) => workOrderTimeService.update(id, data);
export const deleteTimeEntry = (id: string) => workOrderTimeService.delete(id);
