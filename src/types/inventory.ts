
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
  
  // New fields to match the provided UI
  partNumber?: string;
  manufacturer?: string;
  cost?: number;
  marginMarkup?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  specialTax?: number;
  onOrder?: number;
  onHold?: number;
  minimumOrder?: number;
  maximumOrder?: number;
  totalQtySold?: number;
  dateBought?: string;
  dateLast?: string;
  serialNumbers?: string;
  itemCondition?: string; // New, Used, Rebuilt, OEM
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
