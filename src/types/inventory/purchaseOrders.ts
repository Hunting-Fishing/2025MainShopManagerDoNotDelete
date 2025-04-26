
// Inventory purchase order types
export interface PurchaseOrder {
  id: string;
  vendor_id?: string;
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  total_amount?: number;
  status: string;
  notes?: string;
  created_by?: string;
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  quantity_received?: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
}
