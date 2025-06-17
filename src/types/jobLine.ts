
export interface WorkOrderJobLine {
  id: string;
  work_order_id: string;
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
  created_at?: string;
  updated_at?: string;
  parts?: any[]; // For associated parts
}

export interface JobLineFormValues {
  name: string;
  category?: string;
  subcategory?: string;
  description?: string;
  estimated_hours?: number;
  labor_rate?: number;
  labor_rate_type?: 'standard' | 'overtime' | 'premium' | 'flat_rate';
  total_amount?: number;
  status?: 'pending' | 'in-progress' | 'completed' | 'on-hold';
  display_order?: number;
  notes?: string;
}

// Type aliases for better type safety
export type JobLineStatus = 'pending' | 'in-progress' | 'completed' | 'on-hold';
export type LaborRateType = 'standard' | 'overtime' | 'premium' | 'flat_rate';
export type PartStatus = 'pending' | 'ordered' | 'received' | 'installed' | 'returned';

// Job Line Status constants
export const JOB_LINE_STATUSES = ['pending', 'in-progress', 'completed', 'on-hold'] as const;

// Work Order Part Status constants
export const WORK_ORDER_PART_STATUSES = ['pending', 'ordered', 'received', 'installed', 'returned'] as const;

// Labor Rate Type constants
export const LABOR_RATE_TYPES = ['standard', 'overtime', 'premium', 'flat_rate'] as const;

// Job Line Status mapping for UI display
export const jobLineStatusMap: Record<JobLineStatus, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-red-100 text-red-800' }
};

// Part Status mapping for UI display
export const partStatusMap: Record<PartStatus, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'ordered': { label: 'Ordered', classes: 'bg-blue-100 text-blue-800' },
  'received': { label: 'Received', classes: 'bg-purple-100 text-purple-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'returned': { label: 'Returned', classes: 'bg-red-100 text-red-800' }
};

// Type guard functions
export function isValidJobLineStatus(status: string): status is JobLineStatus {
  return JOB_LINE_STATUSES.includes(status as any);
}

export function isValidLaborRateType(type: string): type is LaborRateType {
  return LABOR_RATE_TYPES.includes(type as any);
}

export function isValidPartStatus(status: string): status is PartStatus {
  return WORK_ORDER_PART_STATUSES.includes(status as any);
}
