
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
  'on-hold',
  'completed',
  'cancelled',
  'body-shop',
  'mobile-service',
  'needs-road-test',
  'parts-requested',
  'parts-ordered',
  'parts-arrived',
  'customer-to-return',
  'rebooked',
  'foreman-signoff-waiting',
  'foreman-signoff-complete',
  'sublet',
  'waiting-customer-auth',
  'po-requested',
  'tech-support',
  'warranty',
  'internal-ro'
] as const;

export type JobLineStatus = typeof JOB_LINE_STATUSES[number];

// Status mapping for UI display
export const jobLineStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-100 text-orange-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'body-shop': { label: 'Body Shop', classes: 'bg-purple-100 text-purple-800' },
  'mobile-service': { label: 'Mobile Service', classes: 'bg-indigo-100 text-indigo-800' },
  'needs-road-test': { label: 'Needs Road Test', classes: 'bg-cyan-100 text-cyan-800' },
  'parts-requested': { label: 'Parts Requested', classes: 'bg-amber-100 text-amber-800' },
  'parts-ordered': { label: 'Parts Ordered', classes: 'bg-orange-100 text-orange-800' },
  'parts-arrived': { label: 'Parts Arrived', classes: 'bg-lime-100 text-lime-800' },
  'customer-to-return': { label: 'Customer to Return', classes: 'bg-pink-100 text-pink-800' },
  'rebooked': { label: 'Rebooked', classes: 'bg-violet-100 text-violet-800' },
  'foreman-signoff-waiting': { label: 'Foreman Sign-off Waiting', classes: 'bg-yellow-100 text-yellow-800' },
  'foreman-signoff-complete': { label: 'Foreman Sign-off Complete', classes: 'bg-emerald-100 text-emerald-800' },
  'sublet': { label: 'Sublet', classes: 'bg-teal-100 text-teal-800' },
  'waiting-customer-auth': { label: 'Waiting Customer Auth', classes: 'bg-red-100 text-red-800' },
  'po-requested': { label: 'PO Requested', classes: 'bg-slate-100 text-slate-800' },
  'tech-support': { label: 'Tech Support', classes: 'bg-blue-100 text-blue-800' },
  'warranty': { label: 'Warranty', classes: 'bg-green-100 text-green-800' },
  'internal-ro': { label: 'Internal RO', classes: 'bg-gray-100 text-gray-800' }
};

// Updated part statuses to match the work order statuses
export const WORK_ORDER_PART_STATUSES = [
  'pending',
  'in-progress',
  'on-hold',
  'completed',
  'cancelled',
  'parts-requested',
  'parts-ordered',
  'parts-arrived',
  'installed',
  'returned',
  'backordered',
  'defective'
] as const;

// Part status mapping for UI display
export const partStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-100 text-orange-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'parts-requested': { label: 'Parts Requested', classes: 'bg-amber-100 text-amber-800' },
  'parts-ordered': { label: 'Parts Ordered', classes: 'bg-blue-100 text-blue-800' },
  'parts-arrived': { label: 'Parts Arrived', classes: 'bg-lime-100 text-lime-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'returned': { label: 'Returned', classes: 'bg-red-100 text-red-800' },
  'backordered': { label: 'Backordered', classes: 'bg-orange-100 text-orange-800' },
  'defective': { label: 'Defective', classes: 'bg-red-200 text-red-900' }
};
