
// Inventory transaction types
export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_date: string;
  transaction_type: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  performed_by?: string;
  created_at: string;
  updated_at: string;
}
