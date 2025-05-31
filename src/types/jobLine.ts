
// Job Line Types for Work Orders
export interface WorkOrderJobLine {
  id: string;
  workOrderId?: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimatedHours?: number;
  laborRate?: number;
  totalAmount?: number;
  status: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface JobLineFormValues {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimatedHours?: number;
  laborRate?: number;
}

// Job line status options
export const JOB_LINE_STATUSES = [
  'pending',
  'in-progress', 
  'completed',
  'on-hold'
] as const;

export type JobLineStatus = typeof JOB_LINE_STATUSES[number];

// Status mapping for UI display
export const jobLineStatusMap: Record<JobLineStatus, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-gray-100 text-gray-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-yellow-100 text-yellow-800' }
};
