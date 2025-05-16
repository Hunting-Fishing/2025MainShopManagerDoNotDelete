
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
}
