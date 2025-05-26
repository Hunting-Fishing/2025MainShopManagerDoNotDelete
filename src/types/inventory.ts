
export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category?: string;
  supplier?: string;
  location?: string;
  status?: string;
  description?: string;
  quantity?: number;
  reorder_point?: number;
  unit_price?: number;
  created_at?: string;
  updated_at?: string;
}

export interface InventoryItemExtended extends InventoryItem {
  quantity: number;
  reorder_point: number;
  unit_price: number;
  created_at: string;
  updated_at: string;
}

// Auto reorder settings interfaces
export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

export interface ReorderSettings {
  [itemId: string]: AutoReorderSettings;
}
