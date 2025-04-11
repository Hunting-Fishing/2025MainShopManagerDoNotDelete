
export interface InventoryItem {
  id: string;
  name: string;
  sku?: string; // Made optional to match InvoiceItem
  category?: string; // Made optional to match InvoiceItem
  price: number;
  description?: string;
  quantity?: number;
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
