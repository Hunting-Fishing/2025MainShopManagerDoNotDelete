
import { WorkOrder } from "@/types/workOrder";

/**
 * Utility functions for work order data access
 */

export const getWorkOrderCustomer = (workOrder: WorkOrder): string => {
  return workOrder.customer || '';
};

export const getWorkOrderTechnician = (workOrder: WorkOrder): string => {
  return workOrder.technician || '';
};

export const getWorkOrderDate = (workOrder: WorkOrder): string => {
  return workOrder.date || workOrder.created_at || '';
};

export const getWorkOrderDueDate = (workOrder: WorkOrder): string => {
  return workOrder.dueDate || workOrder.due_date || workOrder.end_time || '';
};

export const getWorkOrderPriority = (workOrder: WorkOrder): string => {
  return workOrder.priority || 'medium';
};

export const getWorkOrderLocation = (workOrder: WorkOrder): string => {
  return workOrder.location || '';
};

export const getWorkOrderTotalBillableTime = (workOrder: WorkOrder): number => {
  return workOrder.total_billable_time || 0;
};

export const getWorkOrderStatus = (workOrder: WorkOrder): string => {
  return workOrder.status;
};

export const getWorkOrderDescription = (workOrder: WorkOrder): string => {
  return workOrder.description || '';
};
