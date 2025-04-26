
export interface InventoryTransaction {
  id: string;
  inventory_item_id: string;
  quantity: number;
  transaction_type: 'addition' | 'reduction' | 'adjustment' | 'sale' | 'purchase' | 'write-off';
  transaction_date: string;
  reference_id?: string;
  reference_type?: string;
  notes?: string;
  performed_by?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryTransactionDto {
  inventory_item_id: string;
  quantity: number;
  transaction_type: 'addition' | 'reduction' | 'adjustment' | 'sale' | 'purchase' | 'write-off';
  reference_id?: string;
  reference_type?: string;
  notes?: string;
}

export interface InventoryAdjustment {
  id: string;
  work_order_id: string;
  inventory_item_id: string;
  quantity: number;
  adjustment_type: 'reserve' | 'consume' | 'return';
  adjusted_by: string;
  notes?: string;
  created_at: string;
  updated_at: string;
}

export interface CreateInventoryAdjustmentDto {
  work_order_id: string;
  inventory_item_id: string;
  quantity: number;
  adjustment_type: 'reserve' | 'consume' | 'return';
  notes?: string;
}
