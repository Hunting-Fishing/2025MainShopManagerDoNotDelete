
export interface PurchaseOrder {
  id: string;
  vendor_id: string;
  status: 'draft' | 'submitted' | 'partially_received' | 'received' | 'cancelled';
  order_date: string;
  expected_delivery_date?: string;
  received_date?: string;
  total_amount?: number;
  created_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
  items?: PurchaseOrderItem[];
  vendor?: {
    name: string;
    contact_name?: string;
  };
}

export interface PurchaseOrderItem {
  id: string;
  purchase_order_id: string;
  inventory_item_id: string;
  quantity: number;
  quantity_received: number;
  unit_price: number;
  total_price: number;
  created_at: string;
  updated_at: string;
  item_name?: string;
  item_sku?: string;
}

export interface CreatePurchaseOrderDto {
  vendor_id: string;
  expected_delivery_date?: string;
  notes?: string;
  items: Array<{
    inventory_item_id: string;
    quantity: number;
    unit_price: number;
  }>;
}

export interface UpdatePurchaseOrderDto {
  status?: 'draft' | 'submitted' | 'partially_received' | 'received' | 'cancelled';
  expected_delivery_date?: string;
  received_date?: string;
  notes?: string;
}
