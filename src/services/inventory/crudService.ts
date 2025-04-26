
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { mapDbItemToInventoryItem, mapInventoryItemToDbFormat } from "./utils";

// Get all inventory items
export const getAllInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    return (data || []).map(mapDbItemToInventoryItem);
  } catch (error) {
    console.error('Error getting all inventory items:', error);
    throw error;
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
      throw error;
    }

    return data ? mapDbItemToInventoryItem(data) : null;
  } catch (error) {
    console.error(`Error getting inventory item by ID ${id}:`, error);
    throw error;
  }
};

// Create a new inventory item
export const createInventoryItem = async (item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> => {
  try {
    const dbItem = mapInventoryItemToDbFormat(item);
    
    const { data, error } = await supabase
      .from('inventory_items')
      .insert(dbItem)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

// Update an inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const dbUpdates = mapInventoryItemToDbFormat(updates);
    
    const { data, error } = await supabase
      .from('inventory_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }
  } catch (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
};

// Update inventory quantity
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    console.error(`Error updating inventory quantity for item ${id}:`, error);
    throw error;
  }
};

// Clear all inventory items (for admin purposes)
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .gt('id', '0'); // This is a way to delete all rows
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error clearing all inventory items:', error);
    throw error;
  }
};
