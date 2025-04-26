
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
  reorderPoint?: number;
  reorderQuantity?: number;
  location?: string;
  lastOrdered?: string;
  lastReceived?: string;
  autoReorder?: boolean;
  unitPrice?: number; // For backward compatibility
}

export interface InventoryItemExtended {
  id: string;
  name: string;
  sku: string;
  category: string;
  supplier: string;
  quantity: number;
  min_stock_level: number;
  unit_price: number;
  location: string;
  status: string;
  description?: string;
  reorder_quantity?: number;
  last_ordered?: string;
  last_received?: string;
  auto_reorder?: boolean;
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

// For backward compatibility
export interface Inventory {
  id: string;
  name: string;
  sku: string;
  description?: string;
  quantity: number;
  price: number;
  category: string;
  supplier: string;
  status: string;
  minStockLevel: number;
  reorderQuantity: number;
  location: string;
  lastOrdered?: string;
  lastReceived?: string;
  autoReorder?: boolean;
}
