
import { WorkOrderPart } from './workOrderPart';

export interface WorkOrderJobLine {
  id: string;
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: string;
  total_amount?: number;
  status?: string;
  notes?: string;
  display_order?: number;
  created_at: string;
  updated_at: string;
  parts?: WorkOrderPart[];
  
  // CamelCase aliases for backward compatibility
  workOrderId?: string; // Alias for work_order_id
  estimatedHours?: number; // Alias for estimated_hours
  laborRate?: number; // Alias for labor_rate
  totalAmount?: number; // Alias for total_amount
}

export interface JobLineFormValues {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: string;
  status?: string;
  notes?: string;
}

export const JOB_LINE_STATUSES = [
  'pending',
  'in-progress',
  'completed',
  'on-hold',
  'cancelled'
] as const;

export type JobLineStatus = typeof JOB_LINE_STATUSES[number];

// Status mapping for UI display
export const jobLineStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-100 text-orange-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' }
};
