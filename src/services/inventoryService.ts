
import { supabase } from "@/lib/supabase";
import { InventoryItem, InventoryItemExtended } from "@/types/inventory";

// Get all inventory items
export const getAllInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) {
      throw error;
    }

    // Convert data to InventoryItem interface
    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      description: item.description || "",
      price: Number(item.unit_price),
      category: item.category,
      supplier: item.supplier,
      status: item.status,
      quantity: Number(item.quantity),
      reorderPoint: item.reorder_point || item.min_stock_level
    }));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    return [];
  }
};

// For backward compatibility
export const getInventoryItems = getAllInventoryItems;

// Add a new inventory item
export const addInventoryItem = async (item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        quantity: item.quantity,
        min_stock_level: item.min_stock_level || item.reorderPoint,
        unit_price: item.unit_price || item.unitPrice,
        location: item.location,
        status: item.status,
        description: item.description
      }])
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      reorderPoint: data.min_stock_level,
      unitPrice: data.unit_price
    };
  } catch (error) {
    console.error('Error adding inventory item:', error);
    return null;
  }
};

// Update an existing inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
  try {
    // Prepare updates with correct field names
    const dbUpdates: any = { ...updates };
    
    // Map from camelCase to snake_case fields
    if (updates.unitPrice !== undefined) dbUpdates.unit_price = updates.unitPrice;
    if (updates.reorderPoint !== undefined) dbUpdates.min_stock_level = updates.reorderPoint;
    
    // Remove mapped fields to prevent duplicate updates
    delete dbUpdates.unitPrice;
    delete dbUpdates.reorderPoint;

    const { data, error } = await supabase
      .from('inventory_items')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw error;
    }

    return {
      ...data,
      reorderPoint: data.min_stock_level,
      unitPrice: data.unit_price
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
};

// Delete an inventory item
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};

// Clear all inventory items
export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    // This should be used with caution - typically you'd have safeguards
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .not('id', 'eq', 'dummy'); // This will delete all records

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error clearing inventory items:', error);
    return false;
  }
};

// Reorder functionality
export const reorderItem = async (
  itemId: string, 
  quantity: number
): Promise<boolean> => {
  try {
    // First get the current item details
    const { data: item, error: getError } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', itemId)
      .single();
    
    if (getError) throw getError;
    
    // Update the quantity
    const newQuantity = (item.quantity || 0) + quantity;
    const { error: updateError } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', itemId);
    
    if (updateError) throw updateError;
    
    // Log the reorder transaction
    await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        quantity,
        transaction_type: 'reorder'
      });

    return true;
  } catch (error) {
    console.error('Error reordering inventory item:', error);
    return false;
  }
};

// Auto-reorder settings
export const enableAutoReorder = async (
  itemId: string,
  threshold: number,
  reorderQuantity: number
): Promise<boolean> => {
  try {
    // Update auto-reorder settings
    const { error } = await supabase
      .from('inventory_auto_reorder')
      .upsert({
        item_id: itemId,
        enabled: true,
        threshold,
        quantity: reorderQuantity
      });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error setting auto-reorder:', error);
    return false;
  }
};
