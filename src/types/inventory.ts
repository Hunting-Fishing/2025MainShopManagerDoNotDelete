
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

// Export a simplified InventoryItem interface for use in invoices and other components
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  category?: string;
  supplier?: string;
  status?: string;
  quantity?: number;
}

// Additional interfaces for inventory system
export interface ReorderSettings {
  id: string;
  item_id: string;
  threshold: number;
  reorder_quantity: number;
  auto_reorder: boolean;
}

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_type: string;
  transaction_date: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type?: string;
  description?: string;
  parent_id?: string;
}

export interface InventoryCategory {
  id: string;
  name: string;
}

export interface InventorySupplier {
  id: string;
  name: string;
}

export interface InventoryAdjustment {
  id: string;
  inventory_item_id: string;
  quantity: number;
  adjustment_type: string;
  notes?: string;
  performed_by?: string;
}

export interface InventoryValuation {
  total_cost: number;
  total_items: number;
  valuation_date: string;
}

export type InventoryItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued';
