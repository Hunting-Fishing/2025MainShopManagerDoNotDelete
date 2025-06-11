
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
  
  // Additional properties for parts tracking components
  partName?: string; // Alias for name
  partNumber?: string; // Alias for part_number
  supplierName?: string;
  supplierCost?: number;
  customerPrice?: number; // Alias for unit_price
  category?: string;
  warrantyDuration?: string;
  warrantyExpiryDate?: string;
  binLocation?: string;
  installDate?: string;
  dateAdded?: string; // Alias for created_at
  partType?: string;
  installedBy?: string;
  markupPercentage?: number;
  inventoryItemId?: string;
  coreChargeApplied?: boolean;
  coreChargeAmount?: number;
  isTaxable?: boolean;
  
  // CamelCase aliases for backward compatibility
  workOrderId?: string; // Alias for work_order_id
  jobLineId?: string; // Alias for job_line_id
}

export interface WorkOrderPartFormValues {
  part_number: string;
  name: string;
  description?: string;
  quantity: number;
  unit_price: number;
  job_line_id?: string;
  notes?: string;
  status?: string;
  
  // Additional form fields
  partName?: string;
  partNumber?: string;
  supplierName?: string;
  supplierCost?: number;
  customerPrice?: number;
  category?: string;
  partType?: string;
  markupPercentage?: number;
  isTaxable?: boolean;
}

export const WORK_ORDER_PART_STATUSES = [
  'pending',
  'ordered',
  'received',
  'installed',
  'returned',
  'backordered',
  'defective'
] as const;

// Export alias for backward compatibility
export const PART_STATUSES = WORK_ORDER_PART_STATUSES;

export type WorkOrderPartStatus = typeof WORK_ORDER_PART_STATUSES[number];

// Part types
export const PART_TYPES = [
  'OEM',
  'Aftermarket',
  'Rebuilt',
  'Used',
  'Core',
  'Special Order'
] as const;

export type PartType = typeof PART_TYPES[number];

// Status mapping for UI display
export const partStatusMap: Record<string, { label: string; classes: string }> = {
  'pending': { label: 'Pending', classes: 'bg-yellow-100 text-yellow-800' },
  'ordered': { label: 'Ordered', classes: 'bg-blue-100 text-blue-800' },
  'received': { label: 'Received', classes: 'bg-purple-100 text-purple-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'returned': { label: 'Returned', classes: 'bg-red-100 text-red-800' },
  'backordered': { label: 'Backordered', classes: 'bg-orange-100 text-orange-800' },
  'defective': { label: 'Defective', classes: 'bg-red-200 text-red-900' }
};

// Part categories
export const PART_CATEGORIES = [
  'Engine',
  'Transmission',
  'Brakes',
  'Suspension',
  'Electrical',
  'Body',
  'Interior',
  'Exhaust',
  'Cooling',
  'Fuel System',
  'Steering',
  'Tires & Wheels',
  'Filters',
  'Fluids',
  'Tools',
  'Other'
] as const;

export type PartCategory = typeof PART_CATEGORIES[number];
