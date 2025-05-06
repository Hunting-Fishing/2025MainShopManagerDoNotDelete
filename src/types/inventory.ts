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
  
  // New fields to match the provided requirements
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
  barcode?: string;
  reorderQuantity?: number;
  categoryId?: string;
  locationId?: string;
  supplierId?: string;
  
  // Adding missing properties from error messages
  subcategory?: string;
  vehicleCompatibility?: string;
  warrantyPeriod?: string;
  notes?: string;
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

// New types for the enhanced inventory system
export interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  description?: string;
  parent_id?: string;
  created_at: string;
  updated_at: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  website?: string;
  preferred_shipping_method?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface InventoryAdjustment {
  id: string;
  item_id: string;
  quantity_change: number;
  reason: string;
  user_id: string;
  created_at: string;
  notes?: string;
}

export interface InventoryValuation {
  total_cost: number;
  total_retail: number;
  item_count: number;
  last_updated: string;
}

export type InventoryItemStatus = 
  | "In Stock" 
  | "Low Stock" 
  | "Out of Stock" 
  | "Discontinued"
  | "On Order";

export interface InventoryTransaction {
  id: string;
  item_id: string;
  quantity: number;
  transaction_type: "purchase" | "sale" | "adjustment" | "transfer" | "return" | "write-off";
  reference_id?: string;
  reference_type?: string;
  created_at: string;
  user_id: string;
  notes?: string;
}
