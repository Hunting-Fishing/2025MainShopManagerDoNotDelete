
export interface WorkOrderPart {
  id: string;
  workOrderId: string;
  jobLineId?: string;
  inventoryItemId?: string;
  partName: string;
  partNumber?: string;
  supplierName?: string;
  supplierCost: number;
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
}

export interface WorkOrderPartFormValues {
  partName: string;
  partNumber?: string;
  supplierName?: string;
  supplierCost: number;
  markupPercentage: number;
  retailPrice: number;
  customerPrice: number;
  quantity: number;
  partType: 'inventory' | 'non-inventory';
  invoiceNumber?: string;
  poLine?: string;
  notes?: string;
  inventoryItemId?: string;
}

export const PART_TYPES = [
  'inventory',
  'non-inventory'
] as const;

export type PartType = typeof PART_TYPES[number];
