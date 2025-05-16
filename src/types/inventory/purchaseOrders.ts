
import { InventoryItemExtended } from '../inventory';

export interface PurchaseOrderItem {
  id?: string;
  item: InventoryItemExtended;
  quantity: number;
  unit_price: number;
  total_price: number;
  quantity_received?: number;
}

export interface PurchaseOrder {
  id?: string;
  vendor_id: string;
  vendor_name: string;
  order_date: string;
  expected_delivery_date?: string;
  status: 'draft' | 'ordered' | 'partial' | 'received' | 'cancelled';
  items: PurchaseOrderItem[];
  total_amount: number;
  notes?: string;
  created_by?: string;
  created_at?: string;
  updated_at?: string;
}
