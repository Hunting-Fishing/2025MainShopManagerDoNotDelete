
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { formatInventoryItem, formatInventoryForApi } from './utils';

// Get all inventory items
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');
  
  if (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
  
  return data.map(formatInventoryItem);
};

// Get a single inventory item by ID
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    return null;
  }
  
  return formatInventoryItem(data);
};

// Create a new inventory item
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> => {
  const formattedItem = formatInventoryForApi(item);

  const { data, error } = await supabase
    .from('inventory_items')
    .insert([{
      ...formattedItem,
      // Ensure specific required fields
      name: item.name,
      sku: item.sku || `SKU-${Date.now()}`,
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 10,
      unit_price: item.unit_price || item.price || 0,
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
  
  return formatInventoryItem(data);
};

// Update an existing inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  const formattedUpdates = formatInventoryForApi(updates);
  
  const { data, error } = await supabase
    .from('inventory_items')
    .update(formattedUpdates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }
  
  return formatInventoryItem(data);
};

// Helper function to update just the quantity
export const updateInventoryQuantity = async (id: string, newQuantity: number): Promise<InventoryItemExtended> => {
  return updateInventoryItem(id, { quantity: newQuantity });
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
  
  return true;
};
