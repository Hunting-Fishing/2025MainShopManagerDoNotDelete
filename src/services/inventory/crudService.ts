
import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { formatInventoryItem } from "./utils";

/**
 * Get all inventory items
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');

  if (error) {
    console.error("Error fetching inventory items:", error);
    throw new Error(`Failed to fetch inventory items: ${error.message}`);
  }

  return (data || []).map(formatInventoryItem);
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    throw new Error(`Failed to fetch inventory item: ${error.message}`);
  }

  return data ? formatInventoryItem(data) : null;
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> => {
  // Ensure we're using snake_case for database fields
  const itemData = {
    name: item.name,
    sku: item.sku,
    description: item.description,
    category: item.category,
    quantity: item.quantity || 0,
    unit_price: item.unit_price || 0,
    reorder_point: item.reorder_point || 10,
    supplier: item.supplier,
    location: item.location,
    shop_id: item.shop_id
  };

  const { data, error } = await supabase
    .from('inventory_items')
    .insert(itemData)
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw new Error(`Failed to create inventory item: ${error.message}`);
  }

  return formatInventoryItem(data);
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  // Convert camelCase to snake_case for the database
  const updateData: Record<string, any> = {};
  
  // Handle specific field conversions
  if (updates.unit_price !== undefined) {
    updateData.unit_price = updates.unit_price;
  }
  
  // Add all other fields directly
  Object.keys(updates).forEach(key => {
    if (key !== 'unit_price' && key !== 'reorder_point') {
      updateData[key] = (updates as any)[key];
    }
  });
  
  // Handle reorder_point specifically
  if (updates.reorder_point !== undefined) {
    updateData.reorder_point = updates.reorder_point;
  }
  
  // Add updated_at timestamp
  updateData.updated_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('inventory_items')
    .update(updateData)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw new Error(`Failed to update inventory item: ${error.message}`);
  }

  return formatInventoryItem(data);
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw new Error(`Failed to delete inventory item: ${error.message}`);
  }
};
