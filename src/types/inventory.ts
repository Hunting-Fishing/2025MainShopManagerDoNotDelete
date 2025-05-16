
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
