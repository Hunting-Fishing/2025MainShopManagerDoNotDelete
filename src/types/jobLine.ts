
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
