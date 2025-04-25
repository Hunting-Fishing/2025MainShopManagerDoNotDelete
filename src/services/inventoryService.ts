
import { supabase } from '@/lib/supabase';
import { InventoryItem, InventoryItemExtended } from '@/types/inventory';

export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');

  if (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }

  // Convert snake_case to camelCase
  return data.map(item => ({
    ...item,
    reorderPoint: item.reorder_point,
    unitPrice: item.unit_price
  })) as InventoryItemExtended[];
}

export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching inventory item with ID ${id}:`, error);
    return null;
  }

  return {
    ...data,
    reorderPoint: data.reorder_point,
    unitPrice: data.unit_price
  } as InventoryItemExtended;
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<boolean> {
  // Convert camelCase back to snake_case for database
  const dbUpdates: any = { ...updates };
  if (updates.reorderPoint !== undefined) {
    dbUpdates.reorder_point = updates.reorderPoint;
    delete dbUpdates.reorderPoint;
  }
  if (updates.unitPrice !== undefined) {
    dbUpdates.unit_price = updates.unitPrice;
    delete dbUpdates.unitPrice;
  }

  const { error } = await supabase
    .from('inventory_items')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    console.error(`Error updating inventory item with ID ${id}:`, error);
    return false;
  }

  return true;
}

export async function createInventoryItem(item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended | null> {
  // Convert camelCase to snake_case for database
  const dbItem: any = { ...item };
  if (item.reorderPoint !== undefined) {
    dbItem.reorder_point = item.reorderPoint;
    delete dbItem.reorderPoint;
  }
  if (item.unitPrice !== undefined) {
    dbItem.unit_price = item.unitPrice;
    delete dbItem.unitPrice;
  }

  const { data, error } = await supabase
    .from('inventory_items')
    .insert([dbItem])
    .select();

  if (error) {
    console.error('Error creating inventory item:', error);
    return null;
  }

  return {
    ...data[0],
    reorderPoint: data[0].reorder_point,
    unitPrice: data[0].unit_price
  } as InventoryItemExtended;
}

export async function deleteInventoryItem(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting inventory item with ID ${id}:`, error);
    return false;
  }

  return true;
}
