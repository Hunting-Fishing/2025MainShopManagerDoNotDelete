
export interface InventoryLocation {
  id: string;
  name: string;
  type: 'warehouse' | 'section' | 'shelf' | 'bin';
  parent_id?: string;
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  parentLocation?: InventoryLocation;
  children?: InventoryLocation[];
}

export interface CreateInventoryLocationDto {
  name: string;
  type: 'warehouse' | 'section' | 'shelf' | 'bin';
  parent_id?: string;
  description?: string;
  is_active?: boolean;
}
