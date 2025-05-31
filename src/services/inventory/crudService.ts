
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from the database - NO SAMPLE DATA
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching real inventory items from Supabase...');
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} real items from database`);
    
    // Only return real data from database, no fallback to sample data
    if (!data || data.length === 0) {
      console.log('No real inventory items found in database');
      return [];
    }
    
    return data.map(item => formatInventoryItem(item));
  } catch (error) {
    console.error('Error fetching real inventory items:', error);
    return []; // Return empty array instead of sample data
  }
};

/**
 * Get inventory item by ID - NO SAMPLE DATA
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        location: item.location,
        status: item.status,
        description: item.description,
        quantity: item.quantity,
        reorder_point: item.reorder_point,
        unit_price: item.unit_price
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return null;
  }
};

/**
 * Update an inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        supplier: updates.supplier,
        location: updates.location,
        status: updates.status,
        description: updates.description,
        quantity: updates.quantity,
        reorder_point: updates.reorder_point,
        unit_price: updates.unit_price
      })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
};

/**
 * Update inventory item quantity only
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    return null;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};
