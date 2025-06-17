
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
  
  // Additional properties for enhanced functionality
  category?: string;
  partName?: string;
  partNumber?: string;
  customerPrice?: number;
  supplierCost?: number;
  retailPrice?: number;
  markupPercentage?: number;
  isTaxable?: boolean;
  coreChargeAmount?: number;
  coreChargeApplied?: boolean;
  warrantyDuration?: string;
  warrantyExpiryDate?: string;
  installDate?: string;
  installedBy?: string;
  invoiceNumber?: string;
  poLine?: string;
  isStockItem?: boolean;
  supplierName?: string;
  supplierOrderRef?: string;
  notesInternal?: string;
  inventoryItemId?: string;
  partType?: string;
  estimatedArrivalDate?: string;
  itemStatus?: string;
}

// Job Line Statuses - Comprehensive workflow
export const JOB_LINE_STATUSES = [
  'pending',
  'scheduled',
  'in-progress', 
  'waiting-parts',
  'waiting-approval',
  'customer-approval',
  'on-hold',
  'quality-check',
  'road-test',
  'completed',
  'cancelled',
  'warranty',
  'comeback',
  'sublet',
  'parts-returned'
] as const;

export type JobLineStatus = typeof JOB_LINE_STATUSES[number];

// Work Order Part Statuses - Comprehensive workflow
export const WORK_ORDER_PART_STATUSES = [
  'pending',
  'quote-requested',
  'quote-received',
  'approved',
  'ordered',
  'backordered',
  'received', 
  'quality-checked',
  'installed',
  'warranty-claim',
  'returned',
  'defective',
  'core-exchange',
  'special-order',
  'discontinued',
  'declined'
] as const;

export type WorkOrderPartStatus = typeof WORK_ORDER_PART_STATUSES[number];

// Status mapping for UI display - Job Lines
export const jobLineStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'scheduled': { label: 'Scheduled', classes: 'bg-blue-50 text-blue-700' },
  'in-progress': { label: 'In Progress', classes: 'bg-blue-100 text-blue-800' },
  'waiting-parts': { label: 'Waiting Parts', classes: 'bg-purple-100 text-purple-800' },
  'waiting-approval': { label: 'Waiting Approval', classes: 'bg-orange-100 text-orange-800' },
  'customer-approval': { label: 'Customer Approval', classes: 'bg-pink-100 text-pink-800' },
  'on-hold': { label: 'On Hold', classes: 'bg-orange-200 text-orange-900' },
  'quality-check': { label: 'Quality Check', classes: 'bg-indigo-100 text-indigo-800' },
  'road-test': { label: 'Road Test', classes: 'bg-cyan-100 text-cyan-800' },
  'completed': { label: 'Completed', classes: 'bg-green-100 text-green-800' },
  'cancelled': { label: 'Cancelled', classes: 'bg-red-100 text-red-800' },
  'warranty': { label: 'Warranty Work', classes: 'bg-violet-100 text-violet-800' },
  'comeback': { label: 'Comeback', classes: 'bg-amber-100 text-amber-800' },
  'sublet': { label: 'Sublet', classes: 'bg-teal-100 text-teal-800' },
  'parts-returned': { label: 'Parts Returned', classes: 'bg-slate-100 text-slate-800' }
};

// Status mapping for UI display - Parts
export const partStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'quote-requested': { label: 'Quote Requested', classes: 'bg-indigo-100 text-indigo-800' },
  'quote-received': { label: 'Quote Received', classes: 'bg-cyan-100 text-cyan-800' },
  'approved': { label: 'Approved', classes: 'bg-emerald-100 text-emerald-800' },
  'ordered': { label: 'Ordered', classes: 'bg-blue-100 text-blue-800' },
  'backordered': { label: 'Backordered', classes: 'bg-orange-100 text-orange-800' },
  'received': { label: 'Received', classes: 'bg-purple-100 text-purple-800' },
  'quality-checked': { label: 'Quality Checked', classes: 'bg-teal-100 text-teal-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'warranty-claim': { label: 'Warranty Claim', classes: 'bg-pink-100 text-pink-800' },
  'returned': { label: 'Returned', classes: 'bg-red-100 text-red-800' },
  'defective': { label: 'Defective', classes: 'bg-red-200 text-red-900' },
  'core-exchange': { label: 'Core Exchange', classes: 'bg-amber-100 text-amber-800' },
  'special-order': { label: 'Special Order', classes: 'bg-violet-100 text-violet-800' },
  'discontinued': { label: 'Discontinued', classes: 'bg-slate-100 text-slate-800' },
  'declined': { label: 'Declined', classes: 'bg-gray-100 text-gray-800' }
};
