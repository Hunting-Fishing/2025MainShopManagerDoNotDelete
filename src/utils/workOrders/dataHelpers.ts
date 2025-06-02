
import { WorkOrder } from '@/types/workOrder';

/**
 * Utility functions for consistent work order data display
 */

/**
 * Get formatted customer name with fallback
 */
export const getCustomerName = (workOrder: WorkOrder): string => {
  // Try multiple sources for customer name
  if (workOrder.customer_name) {
    return workOrder.customer_name;
  }
  
  if (workOrder.customer) {
    return workOrder.customer;
  }
  
  // If we have customer_id but no name, show a loading state
  if (workOrder.customer_id) {
    return 'Loading customer...';
  }
  
  return 'Unknown Customer';
};

/**
 * Get formatted vehicle info with fallback
 */
export const getVehicleInfo = (workOrder: WorkOrder): string => {
  // Try to build vehicle info from individual fields
  const year = workOrder.vehicle_year || workOrder.vehicle?.year;
  const make = workOrder.vehicle_make || workOrder.vehicle?.make;
  const model = workOrder.vehicle_model || workOrder.vehicle?.model;
  
  if (year && make && model) {
    return `${year} ${make} ${model}`;
  }
  
  // Try to get partial info
  if (make && model) {
    return `${make} ${model}`;
  }
  
  if (make) {
    return make;
  }
  
  // If we have vehicle_id but no info, show loading state
  if (workOrder.vehicle_id) {
    return 'Loading vehicle...';
  }
  
  return 'No vehicle info';
};

/**
 * Get formatted technician name with fallback
 */
export const getTechnicianName = (workOrder: WorkOrder): string => {
  if (workOrder.technician) {
    return workOrder.technician;
  }
  
  // If we have technician_id but no name, show loading state
  if (workOrder.technician_id) {
    return 'Loading technician...';
  }
  
  return 'Unassigned';
};

/**
 * Get formatted work order date
 */
export const getWorkOrderDate = (workOrder: WorkOrder): string => {
  const date = workOrder.date || workOrder.created_at;
  if (!date) return 'N/A';
  
  try {
    return new Date(date).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get formatted work order due date
 */
export const getWorkOrderDueDate = (workOrder: WorkOrder): string => {
  const dueDate = workOrder.dueDate || workOrder.due_date || workOrder.end_time;
  if (!dueDate) return 'N/A';
  
  try {
    return new Date(dueDate).toLocaleDateString();
  } catch {
    return 'Invalid Date';
  }
};

/**
 * Get work order status badge variant
 */
export const getStatusBadgeVariant = (status: string) => {
  switch (status?.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'in-progress':
    case 'in progress':
      return 'warning';
    case 'pending':
      return 'outline';
    case 'cancelled':
      return 'destructive';
    default:
      return 'secondary';
  }
};

/**
 * Get priority badge variant
 */
export const getPriorityBadgeVariant = (priority: string) => {
  switch (priority?.toLowerCase()) {
    case 'high':
    case 'urgent':
      return 'destructive';
    case 'medium':
      return 'warning';
    case 'low':
      return 'outline';
    default:
      return 'secondary';
  }
};

/**
 * Validate work order data completeness
 */
export const validateWorkOrderData = (workOrder: WorkOrder): {
  isValid: boolean;
  missingFields: string[];
  warnings: string[];
} => {
  const missingFields: string[] = [];
  const warnings: string[] = [];
  
  // Check required fields
  if (!workOrder.id) missingFields.push('id');
  if (!workOrder.status) missingFields.push('status');
  if (!workOrder.description) warnings.push('description');
  
  // Check customer data
  if (workOrder.customer_id && !workOrder.customer_name && !workOrder.customer) {
    warnings.push('customer data not enriched');
  }
  
  // Check vehicle data
  if (workOrder.vehicle_id && !workOrder.vehicle_make && !workOrder.vehicle?.make) {
    warnings.push('vehicle data not enriched');
  }
  
  // Check technician data
  if (workOrder.technician_id && !workOrder.technician) {
    warnings.push('technician data not enriched');
  }
  
  return {
    isValid: missingFields.length === 0,
    missingFields,
    warnings
  };
};
