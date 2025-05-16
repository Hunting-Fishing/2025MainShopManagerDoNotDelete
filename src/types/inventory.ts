
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  description?: string;
  price: number;
  unit_price?: number; // alias for price for db compatibility
  category?: string;
  supplier?: string;
  status?: string;
  quantity?: number;
  reorder_point?: number;
}

export interface InventoryItemExtended extends InventoryItem {
  quantity: number;
  reorder_point: number;
  unit_price: number;
  created_at?: string;
  updated_at?: string;
  location?: string;
  status: string;
  supplier: string;
  // Additional fields that are referenced in the code
  partNumber?: string;
  barcode?: string;
  subcategory?: string;
  manufacturer?: string;
  vehicleCompatibility?: string;
  onHold?: number;
  onOrder?: number;
  cost?: number;
  marginMarkup?: number;
  warrantyPeriod?: string;
  dateBought?: string;
  dateLast?: string;
  notes?: string;
}

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export interface ReorderSettings {
  [itemId: string]: AutoReorderSettings;
}

export interface InventoryCategory {
  id: string;
  name: string;
  count?: number;
}

export interface InventorySupplier {
  id: string;
  name: string;
  count?: number;
}

export interface InventoryLocation {
  id: string;
  name: string;
  count?: number;
}

export interface InventoryStatus {
  value: string;
  label: string;
  count?: number;
}

export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_date: string;
  reference_id?: string;
  transaction_type: string;
  reference_type?: string;
  notes?: string;
  performed_by?: string;
}

export interface InventoryAdjustment {
  inventory_item_id: string;
  quantity: number;
  adjustment_type: string;
  notes?: string;
}

export interface InventoryValuation {
  total_value: number;
  average_cost: number;
  item_count: number;
  last_updated: string;
}

export interface InventoryItemStatus {
  id: string;
  name: string;
  color: string;
  count?: number;
}
