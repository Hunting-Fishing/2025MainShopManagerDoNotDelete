
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
