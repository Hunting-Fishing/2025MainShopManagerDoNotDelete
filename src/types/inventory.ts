
// Basic inventory item interface
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  quantity: number;
  unit_price: number;
  category: string;
  supplier: string;
  location?: string;
  status: string;
  description?: string;
  
  // Additional fields that match what the components are expecting
  partNumber?: string;
  barcode?: string;
  subcategory?: string;
  manufacturer?: string;
  vehicleCompatibility?: string;
  onHold?: number;
  onOrder?: number;
  reorder_point?: number;
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
}

// Extended inventory item with additional fields
export interface InventoryItemExtended extends InventoryItem {
  reorder_point: number;
  created_at: string;
  updated_at: string;
  shop_id?: string;
}

// Auto reorder settings
export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

// For backward compatibility
export type ReorderSettings = AutoReorderSettings;

// Legacy types needed by the namespace in inventory/index.ts
export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_type: string;
  transaction_date: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  performed_by?: string;
}

export interface InventoryLocation {
  id: string;
  name: string;
  type?: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
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
}

export interface InventoryValuation {
  total_value: number;
  average_cost: number;
  items_count: number;
}

export type InventoryItemStatus = 'In Stock' | 'Low Stock' | 'Out of Stock' | 'Discontinued' | 'On Order';
