
import { WorkOrderStatusType, WorkOrderPriorityType } from "@/types/workOrder";

// Format date for display
export const formatDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

// Status definitions with labels and style classes
export const statusMap: Record<WorkOrderStatusType, string> = {
  'pending': 'Pending',
  'in-progress': 'In Progress',
  'completed': 'Completed',
  'cancelled': 'Cancelled',
  'on-hold': 'On Hold'
};

// Priority definitions with labels and style classes
export const priorityMap: Record<WorkOrderPriorityType, {label: string, classes: string}> = {
  'low': {
    label: 'Low',
    classes: 'bg-blue-100 text-blue-700 border border-blue-300'
  },
  'medium': {
    label: 'Medium',
    classes: 'bg-amber-100 text-amber-700 border border-amber-300'
  },
  'high': {
    label: 'High',
    classes: 'bg-red-100 text-red-700 border border-red-300'
  }
};

// Calculate time spent on a work order
export const calculateTotalTime = (timeEntries: any[]): number => {
  if (!timeEntries || timeEntries.length === 0) return 0;
  return timeEntries.reduce((total, entry) => {
    return total + (entry.duration || 0);
  }, 0);
};

// Format duration in hours and minutes
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  
  if (hours === 0) {
    return `${mins}m`;
  }
  
  return mins === 0 ? `${hours}h` : `${hours}h ${mins}m`;
};

// Add the normalize function needed by some components
export const normalizeWorkOrder = (workOrder: any): any => {
  return {
    ...workOrder,
    customer: workOrder.customer_name || workOrder.customer || 
      (workOrder.customers ? 
        `${workOrder.customers.first_name || ''} ${workOrder.customers.last_name || ''}`.trim() : 
        'N/A'),
    technician: workOrder.technician_name || workOrder.technician || 
      (workOrder.profiles ? 
        `${workOrder.profiles.first_name || ''} ${workOrder.profiles.last_name || ''}`.trim() : 
        'Unassigned')
  };
};
