/**
 * Work order status mappings and constants
 */

export type WorkOrderStatus = 'pending' | 'in-progress' | 'completed' | 'cancelled' | 'on-hold';

export const statusMap: Record<WorkOrderStatus, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'on-hold': 'On Hold'
};

export const priorityMap: Record<string, string> = {
  'low': 'Low',
  'medium': 'Medium',
  'high': 'High'
};

/**
 * Determine priority based on work order data
 */
export const determinePriority = (workOrder: any): string => {
  // Add logic to determine priority based on work order characteristics
  return workOrder.priority || 'medium';
};
