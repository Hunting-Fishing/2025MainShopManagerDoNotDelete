
import { WorkOrder } from '@/types/workOrder';

// Utility function to safely get customer name from work order
export const getWorkOrderCustomer = (workOrder: WorkOrder): string => {
  return workOrder.customer || workOrder.customer_id || 'Unknown Customer';
};

// Utility function to safely get technician name from work order
export const getWorkOrderTechnician = (workOrder: WorkOrder): string => {
  return workOrder.technician || workOrder.technician_id || 'Unassigned';
};

// Utility function to safely get work order date
export const getWorkOrderDate = (workOrder: WorkOrder): string => {
  return workOrder.date || workOrder.created_at || '';
};

// Utility function to safely get work order due date
export const getWorkOrderDueDate = (workOrder: WorkOrder): string => {
  return workOrder.dueDate || workOrder.due_date || '';
};

// Utility function to safely get work order priority
export const getWorkOrderPriority = (workOrder: WorkOrder): string => {
  return workOrder.priority || 'medium';
};

// Utility function to safely get work order location
export const getWorkOrderLocation = (workOrder: WorkOrder): string => {
  return workOrder.location || '';
};

// Utility function to safely get work order notes
export const getWorkOrderNotes = (workOrder: WorkOrder): string => {
  return workOrder.notes || '';
};

// Utility function to safely get total billable time
export const getWorkOrderTotalBillableTime = (workOrder: WorkOrder): number => {
  return workOrder.total_billable_time || 0;
};

// Utility function to safely get vehicle information
export const getWorkOrderVehicleInfo = (workOrder: WorkOrder): string => {
  const make = workOrder.vehicle_make || '';
  const model = workOrder.vehicle_model || '';
  return make && model ? `${make} ${model}` : '';
};
