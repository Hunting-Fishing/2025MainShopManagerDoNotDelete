
export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'write-off';
  quantity: number;
  transaction_date: string;
  reference_type?: string;
  reference_id?: string;
  performed_by?: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryTransactionDto {
  inventory_item_id: string;
  transaction_type: 'purchase' | 'sale' | 'adjustment' | 'transfer' | 'return' | 'write-off';
  quantity: number;
  reference_type?: string;
  reference_id?: string;
  performed_by?: string;
  notes?: string;
}
