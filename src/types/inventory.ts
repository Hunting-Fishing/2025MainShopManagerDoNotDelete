
// Add or update missing type definitions for inventory components
export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export interface InventoryItemExtended {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  reorder_point: number;
  unit_price: number;
  category: string;
  supplier: string;
  location?: string;
  status: string;
  shop_id?: string;
  created_at: string;
  updated_at: string;
  description?: string;
  
  // Additional fields needed by the components
  partNumber?: string;
  barcode?: string;
  subcategory?: string;
  manufacturer?: string;
  vehicleCompatibility?: string;
  onHold?: number;
  onOrder?: number;
  minimumOrder?: number;
  maximumOrder?: number;
  cost?: number;
  marginMarkup?: number;
  retailPrice?: number;
  wholesalePrice?: number;
  specialTax?: number;
  coreCharge?: number;
  environmentalFee?: number;
  freightFee?: number;
  otherFee?: number;
  otherFeeDescription?: string;
  totalQtySold?: number;
  dateBought?: string;
  dateLast?: string;
  serialNumbers?: string[]; 
  itemCondition?: string;
  warrantyPeriod?: string;
  notes?: string;
}
