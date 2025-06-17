
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
  display_order?: number;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  
  // Related parts (populated when needed)
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

export interface WorkOrderPart {
  id: string;
  work_order_id: string;
  job_line_id?: string;
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  status?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

// Job Line Statuses
export const JOB_LINE_STATUSES = [
  'pending',
  'in-progress', 
  'completed',
  'on-hold',
  'cancelled',
  'waiting-parts',
  'quality-check',
  'customer-approval'
] as const;

export type JobLineStatus = typeof JOB_LINE_STATUSES[number];

// Work Order Part Statuses  
export const WORK_ORDER_PART_STATUSES = [
  'pending',
  'ordered',
  'received', 
  'installed',
  'returned',
  'backordered',
  'defective'
] as const;

export type WorkOrderPartStatus = typeof WORK_ORDER_PART_STATUSES[number];

// Status mapping for UI display
export const jobLineStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-100 text-orange-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'waiting-parts': { label: 'Waiting Parts', classes: 'bg-purple-100 text-purple-800' },
  'quality-check': { label: 'Quality Check', classes: 'bg-indigo-100 text-indigo-800' },
  'customer-approval': { label: 'Customer Approval', classes: 'bg-pink-100 text-pink-800' }
};

export const partStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'ordered': { label: 'Ordered', classes: 'bg-blue-100 text-blue-800' },
  'received': { label: 'Received', classes: 'bg-purple-100 text-purple-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'returned': { label: 'Returned', classes: 'bg-red-100 text-red-800' },
  'backordered': { label: 'Backordered', classes: 'bg-orange-100 text-orange-800' },
  'defective': { label: 'Defective', classes: 'bg-red-200 text-red-900' }
};
