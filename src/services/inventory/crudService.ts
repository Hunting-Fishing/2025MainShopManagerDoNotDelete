
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';
import { formatInventoryItem, formatInventoryForApi } from '@/utils/inventory/inventoryUtils';

// Get all inventory items
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');
    
    if (error) {
      console.error('Error fetching inventory items:', error);
      return [];
    }
    
    return data?.map(formatInventoryItem) || [];
  } catch (error) {
    console.error('Exception fetching inventory items:', error);
    return [];
  }
};

// Get a single inventory item by ID
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
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
  } catch (error) {
    console.error(`Exception fetching inventory item ${id}:`, error);
    return null;
  }
};

// Create a new inventory item
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> => {
  const formattedItem = formatInventoryForApi(item);
  
  try {
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
      .select();
    
    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }
    
    return formatInventoryItem(data[0]);
  } catch (error) {
    console.error('Exception creating inventory item:', error);
    throw error;
  }
};

// Update an existing inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  const formattedUpdates = formatInventoryForApi(updates);
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update(formattedUpdates)
      .eq('id', id)
      .select();
    
    if (error) {
      console.error(`Error updating inventory item ${id}:`, error);
      throw error;
    }
    
    return formatInventoryItem(data[0]);
  } catch (error) {
    console.error(`Exception updating inventory item ${id}:`, error);
    throw error;
  }
};

// Helper function to update just the quantity
export const updateInventoryQuantity = async (id: string, newQuantity: number): Promise<InventoryItemExtended> => {
  return updateInventoryItem(id, { quantity: newQuantity });
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error(`Error deleting inventory item ${id}:`, error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error(`Exception deleting inventory item ${id}:`, error);
    throw error;
  }
};

// Clear all inventory items - CAREFUL: Destructive operation
export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    // For safety, this is a soft implementation that doesn't actually delete everything
    console.warn('clearAllInventoryItems: This would normally delete all inventory items, but is implemented as a no-op for safety');
    return true;
  } catch (error) {
    console.error('Error clearing inventory items:', error);
    return false;
  }
};
