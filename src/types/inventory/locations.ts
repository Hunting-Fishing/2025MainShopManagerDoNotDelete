
// Inventory location types
export interface InventoryLocation {
  id: string;
  name: string;
  type?: string;
  description?: string;
  parent_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
