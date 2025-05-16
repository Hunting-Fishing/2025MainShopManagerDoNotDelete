
import { WorkOrder, WorkOrderPriorityType } from '@/types/workOrder';
import { format } from 'date-fns';

/**
 * Normalizes a work order object to ensure consistent property access
 * This handles both camelCase and snake_case properties
 */
export const normalizeWorkOrder = (workOrder: any): WorkOrder => {
  if (!workOrder) return {} as WorkOrder;
  
  const normalized = { ...workOrder };
  
  // Ensure date and created_at/createdAt
  if (!normalized.date && normalized.created_at) {
    normalized.date = normalized.created_at;
  }
  if (!normalized.date && normalized.createdAt) {
    normalized.date = normalized.createdAt;
  }
  if (!normalized.createdAt && normalized.created_at) {
    normalized.createdAt = normalized.created_at;
  }
  if (!normalized.created_at && normalized.createdAt) {
    normalized.created_at = normalized.createdAt;
  }
  
  // Handle technician and technician_id
  if (!normalized.technician && normalized.technician_id) {
    normalized.technician = normalized.technician_id;
  }
  if (!normalized.technician_id && normalized.technician) {
    normalized.technician_id = normalized.technician;
  }
  
  // Handle location
  if (!normalized.location) {
    normalized.location = "";
  }
  
  // Handle notes
  if (!normalized.notes) {
    normalized.notes = "";
  }
  
  // Handle dueDate and due_date
  if (!normalized.dueDate && normalized.due_date) {
    normalized.dueDate = normalized.due_date;
  }
  if (!normalized.due_date && normalized.dueDate) {
    normalized.due_date = normalized.dueDate;
  }
  
  // Handle vehicle info
  if (normalized.vehicle_make && !normalized.vehicleMake) {
    normalized.vehicleMake = normalized.vehicle_make;
  }
  if (normalized.vehicleMake && !normalized.vehicle_make) {
    normalized.vehicle_make = normalized.vehicleMake;
  }
  
  if (normalized.vehicle_model && !normalized.vehicleModel) {
    normalized.vehicleModel = normalized.vehicle_model;
  }
  if (normalized.vehicleModel && !normalized.vehicle_model) {
    normalized.vehicle_model = normalized.vehicleModel;
  }
  
  // Ensure timeEntries exists
  if (!normalized.timeEntries) {
    normalized.timeEntries = [];
  }
  
  // Ensure inventoryItems exists
  if (!normalized.inventoryItems) {
    normalized.inventoryItems = [];
  }
  
  // Ensure totalBillableTime exists
  if (!normalized.totalBillableTime) {
    normalized.totalBillableTime = 0;
  }
  
  return normalized as WorkOrder;
};

// Add the missing priority map
export const priorityMap: Record<WorkOrderPriorityType, { label: string; color: string }> = {
  'high': { label: 'High', color: 'bg-red-100 text-red-800 border border-red-300' },
  'medium': { label: 'Medium', color: 'bg-amber-100 text-amber-800 border border-amber-300' },
  'low': { label: 'Low', color: 'bg-blue-100 text-blue-800 border border-blue-300' },
};

// Add the missing formatDate function
export const formatDate = (dateString?: string | null): string => {
  if (!dateString) return 'N/A';
  try {
    return format(new Date(dateString), 'MMM dd, yyyy');
  } catch (error) {
    return 'Invalid Date';
  }
};
