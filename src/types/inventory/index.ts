
// Re-export all inventory types from the main inventory.ts file 
export type {
  InventoryItem,
  InventoryItemExtended,
  AutoReorderSettings,
  ReorderSettings,
  InventoryTransaction,
  InventoryLocation,
  InventoryCategory,
  InventorySupplier,
  InventoryAdjustment,
  InventoryValuation,
  InventoryItemStatus
} from '../inventory';

// Add any inventory/specific types here
export interface PurchaseOrder {
  id: string;
  order_number: string;
  supplier_id: string;
  order_date: string;
  expected_delivery_date?: string;
  status: string;
  total: number;
  items: PurchaseOrderItem[];
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  unit_cost: number;
  total_cost: number;
}
