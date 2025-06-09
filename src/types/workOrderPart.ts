
export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  jobLineId?: string;
  inventoryItemId?: string;
  partName: string;
  partNumber?: string;
  supplierName?: string;
  supplierCost: number;
  supplierSuggestedRetailPrice?: number;
  markupPercentage: number;
  retailPrice: number;
  customerPrice: number;
  quantity: number;
  partType: 'inventory' | 'non-inventory';
  invoiceNumber?: string;
  poLine?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  // Enhanced fields
  category?: string;
  isTaxable: boolean;
  coreChargeAmount: number;
  coreChargeApplied: boolean;
  warrantyDuration?: string;
  warrantyExpiryDate?: string;
  installDate?: string;
  installedBy?: string;
  status: PartStatus;
  isStockItem: boolean;
  dateAdded: string;
  attachments: string[];
  notesInternal?: string;
}

export interface WorkOrderPartFormValues {
  partName: string;
  partNumber?: string;
  supplierName?: string;
  supplierCost: number;
  supplierSuggestedRetailPrice?: number;
  markupPercentage: number;
  retailPrice: number;
  customerPrice: number;
  quantity: number;
  partType: 'inventory' | 'non-inventory';
  invoiceNumber?: string;
  poLine?: string;
  notes?: string;
  inventoryItemId?: string;
  // Enhanced fields
  category?: string;
  isTaxable: boolean;
  coreChargeAmount: number;
  coreChargeApplied: boolean;
  warrantyDuration?: string;
  installDate?: string;
  installedBy?: string;
  status: PartStatus;
  isStockItem: boolean;
  notesInternal?: string;
}

export const PART_TYPES = [
  'inventory',
  'non-inventory'
] as const;

export type PartType = typeof PART_TYPES[number];

// Part status options
export const PART_STATUSES = [
  'ordered',
  'received',
  'installed',
  'backordered',
  'defective',
  'returned'
] as const;

export type PartStatus = typeof PART_STATUSES[number];

// Part status mapping for UI display
export const partStatusMap: Record<PartStatus, { label: string; classes: string }> = {
  'ordered': { label: 'Ordered', classes: 'bg-yellow-100 text-yellow-800' },
  'received': { label: 'Received', classes: 'bg-blue-100 text-blue-800' },
  'installed': { label: 'Installed', classes: 'bg-green-100 text-green-800' },
  'backordered': { label: 'Backordered', classes: 'bg-orange-100 text-orange-800' },
  'defective': { label: 'Defective', classes: 'bg-red-100 text-red-800' },
  'returned': { label: 'Returned', classes: 'bg-gray-100 text-gray-800' }
};

// Part categories
export const PART_CATEGORIES = [
  'Brakes',
  'Engine',
  'Electrical',
  'Suspension',
  'Fluids',
  'Filters',
  'Belts & Hoses',
  'Exhaust',
  'Cooling',
  'Transmission',
  'Fuel System',
  'HVAC',
  'Body & Trim',
  'Tires & Wheels',
  'Lighting',
  'Other'
] as const;

export type PartCategory = typeof PART_CATEGORIES[number];

// Warranty durations
export const WARRANTY_DURATIONS = [
  'No Warranty',
  '30 Days',
  '90 Days',
  '6 Months',
  '1 Year',
  '2 Years',
  '3 Years',
  'Lifetime'
] as const;

export type WarrantyDuration = typeof WARRANTY_DURATIONS[number];

// Part category interface
export interface PartCategoryOption {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
}

// Warranty term interface
export interface WarrantyTerm {
  id: string;
  duration: string;
  days: number;
  description?: string;
  isActive: boolean;
}
