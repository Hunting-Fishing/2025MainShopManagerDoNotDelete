
export interface InventoryItem {
  id: string;
  name: string;
  sku?: string;
  category?: string;
  price: number;
  description?: string;
  quantity?: number;
  supplier?: string;
  status?: string;
}

export interface InventoryItemExtended {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  reorderPoint: number;
  unitPrice: number;
  location: string;
  status: string;
  description?: string;
  coreCharge?: number;
  environmentalFee?: number;
  freightFee?: number;
  otherFee?: number;
  otherFeeDescription?: string;
}

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export interface ReorderSettings {
  itemId: string;
  threshold: number;
  quantity: number;
  enabled: boolean;
}
