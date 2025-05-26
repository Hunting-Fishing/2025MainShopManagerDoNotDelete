
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

export const priorityMap: Record<string, { label: string; classes: string }> = {
  'low': {
    label: 'Low',
    classes: 'bg-blue-100 text-blue-800 border-blue-200'
  },
  'medium': {
    label: 'Medium',
    classes: 'bg-yellow-100 text-yellow-800 border-yellow-200'
  },
  'high': {
    label: 'High',
    classes: 'bg-red-100 text-red-800 border-red-200'
  }
};

/**
 * Determine priority based on work order data
 */
export const determinePriority = (workOrder: any): string => {
  // Add logic to determine priority based on work order characteristics
  return workOrder.priority || 'medium';
};
