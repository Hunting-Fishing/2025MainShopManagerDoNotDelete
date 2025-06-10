
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log("Fetching real inventory data from database...");
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    console.log(`Fetched ${data?.length || 0} inventory items from database`);
    
    if (!data || data.length === 0) {
      console.log("No real inventory items found in database");
      return [];
    }

    const formattedItems = data.map(formatInventoryItem);
    console.log(`Fetched ${formattedItems.length} real inventory items from database`);
    
    return formattedItems;
  } catch (error) {
    console.error("Error in getInventoryItems:", error);
    throw error;
  }
};

/**
 * Create a new inventory item in the database
 */
export const createInventoryItem = async (
  item: Omit<InventoryItemExtended, "id" | "created_at" | "updated_at">
): Promise<InventoryItemExtended> => {
  try {
    // Map only the core fields that exist in the database
    const dbItem = {
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      category: item.category || '',
      supplier: item.supplier || '',
      location: item.location || '',
      status: item.status || 'active',
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 0,
      unit_price: item.unit_price || 0,
      // Add only the fields that actually exist in the InventoryItemExtended interface
      part_number: item.partNumber || '',
      barcode: item.barcode || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      vehicle_compatibility: item.vehicleCompatibility || '',
      notes: item.notes || ''
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([dbItem])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in createInventoryItem:", error);
    throw error;
  }
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItemExtended>
): Promise<InventoryItemExtended> => {
  try {
    // Map only the core fields that exist in the database
    const dbUpdates: any = {};
    
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.reorder_point !== undefined) dbUpdates.reorder_point = updates.reorder_point;
    if (updates.unit_price !== undefined) dbUpdates.unit_price = updates.unit_price;
    if (updates.partNumber !== undefined) dbUpdates.part_number = updates.partNumber;
    if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
    if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
    if (updates.vehicleCompatibility !== undefined) dbUpdates.vehicle_compatibility = updates.vehicleCompatibility;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

    dbUpdates.updated_at = new Date().toISOString();

    const { data, error } = await supabase
      .from('inventory')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
    throw error;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }
  } catch (error) {
    console.error("Error in deleteInventoryItem:", error);
    throw error;
  }
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error("Error fetching inventory item by ID:", error);
      throw error;
    }

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in getInventoryItemById:", error);
    throw error;
  }
};

/**
 * Update inventory quantity
 */
export const updateInventoryQuantity = async (
  id: string,
  quantity: number
): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory quantity:", error);
      throw error;
    }

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryQuantity:", error);
    throw error;
  }
};

/**
 * Clear all inventory items (for development/testing)
 */
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .gte('id', '0'); // This will match all records

    if (error) {
      console.error("Error clearing all inventory items:", error);
      throw error;
    }

    console.log("All inventory items cleared from database");
  } catch (error) {
    console.error("Error in clearAllInventoryItems:", error);
    throw error;
  }
};
