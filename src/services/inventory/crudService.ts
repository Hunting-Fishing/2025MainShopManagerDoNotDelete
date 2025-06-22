
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "./utils";

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching inventory items from database...');
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    console.log('Raw inventory data from database:', data);
    console.log('Number of items fetched:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('No inventory items found in database');
      return [];
    }

    const formattedItems = data.map((item, index) => {
      console.log(`Formatting item ${index + 1}:`, item);
      const formatted = formatInventoryItem(item);
      console.log(`Formatted item ${index + 1}:`, formatted);
      return formatted;
    });

    console.log('Final formatted inventory items:', formattedItems);
    return formattedItems;
  } catch (error) {
    console.error("Failed to fetch inventory items:", error);
    return [];
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description,
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        unit_price: item.unit_price || 0,
        supplier: item.supplier,
        location: item.location,
        status: item.status || 'active'
      })
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }
};

/**
 * Update an inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        description: updates.description,
        quantity: updates.quantity,
        reorder_point: updates.reorder_point,
        unit_price: updates.unit_price,
        supplier: updates.supplier,
        location: updates.location,
        status: updates.status,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

/**
 * Update inventory quantity
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    throw error;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};
