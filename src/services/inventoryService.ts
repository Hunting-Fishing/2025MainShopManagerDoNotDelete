import { supabase } from "@/lib/supabase";
import { InventoryItem, InventoryItemExtended } from "@/types/inventory";
import { getInventoryStatus } from "@/services/inventory/utils";

export const getAllInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .order('name');

  if (error) {
    throw new Error(`Error fetching inventory items: ${error.message}`);
  }

  // Map raw data to InventoryItemExtended type and ensure aliases
  const items: InventoryItemExtended[] = data.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    supplier: item.supplier,
    quantity: item.quantity,
    min_stock_level: item.min_stock_level || item.reorder_point || 5,
    unit_price: item.unit_price || item.unitPrice || 0,
    location: item.location || "",
    status: item.status || getInventoryStatus(item.quantity, item.min_stock_level || item.reorder_point || 5),
    description: item.description || "",
    // Support for legacy fields
    reorderPoint: item.min_stock_level || item.reorder_point || 5, // Alias for min_stock_level
    unitPrice: item.unit_price || item.unitPrice || 0, // Alias for unit_price
    updated_at: item.updated_at
  }));

  return items;
};

export const getInventoryItems = async (filters = {}): Promise<InventoryItemExtended[]> => {
  return getAllInventoryItems();
};

export const getInventoryItem = async (id: string): Promise<InventoryItemExtended | null> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    throw new Error(`Error fetching inventory item: ${error.message}`);
  }

  if (!data) return null;

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    supplier: data.supplier,
    quantity: data.quantity,
    min_stock_level: data.min_stock_level || data.reorder_point || 5,
    unit_price: data.unit_price || data.unitPrice || 0,
    location: data.location || "",
    status: data.status || getInventoryStatus(data.quantity, data.min_stock_level || data.reorder_point || 5),
    description: data.description || "",
    // Support for legacy fields
    reorderPoint: data.min_stock_level || data.reorder_point || 5, // Alias for min_stock_level
    unitPrice: data.unit_price || data.unitPrice || 0, // Alias for unit_price
    updated_at: data.updated_at
  };
};

export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<string> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .insert({
      name: item.name,
      sku: item.sku,
      category: item.category,
      supplier: item.supplier,
      quantity: item.quantity,
      min_stock_level: item.min_stock_level,
      unit_price: item.unit_price,
      location: item.location,
      status: item.status,
      description: item.description
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Error creating inventory item: ${error.message}`);
  }

  return data.id;
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<void> => {
  // Convert from our client type back to the database schema
  const dbUpdates = {
    name: updates.name,
    sku: updates.sku,
    category: updates.category,
    supplier: updates.supplier,
    quantity: updates.quantity,
    min_stock_level: updates.min_stock_level || updates.reorderPoint,
    unit_price: updates.unit_price || updates.unitPrice,
    location: updates.location,
    status: updates.status,
    description: updates.description
  };

  // Remove undefined values
  Object.keys(dbUpdates).forEach(key => {
    if (dbUpdates[key as keyof typeof dbUpdates] === undefined) {
      delete dbUpdates[key as keyof typeof dbUpdates];
    }
  });

  const { error } = await supabase
    .from('inventory_items')
    .update(dbUpdates)
    .eq('id', id);

  if (error) {
    throw new Error(`Error updating inventory item: ${error.message}`);
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Error deleting inventory item: ${error.message}`);
  }
};

export const updateWorkOrderInventoryItems = async (
  workOrderId: string, 
  items: Array<{inventoryId: string; quantity: number}>
): Promise<void> => {
  // This would update inventory based on work order usage
  // Implementation depends on your database schema and business logic
  for (const item of items) {
    const { error } = await supabase.rpc('update_inventory_for_work_order', {
      p_work_order_id: workOrderId,
      p_inventory_id: item.inventoryId,
      p_quantity: item.quantity
    });
    
    if (error) {
      throw new Error(`Error updating inventory for work order: ${error.message}`);
    }
  }
};

export const clearAllInventoryItems = async (): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .neq('id', 'dummy'); // This will delete all records

  if (error) {
    throw new Error(`Error clearing inventory: ${error.message}`);
  }
};

export const reorderItem = async (
  itemId: string, 
  quantity: number
): Promise<boolean> => {
  try {
    // Implementation depends on your business logic
    // This could create a purchase order or just record the reorder
    const { error } = await supabase.rpc('record_inventory_reorder', {
      p_item_id: itemId,
      p_quantity: quantity
    });
    
    if (error) {
      throw new Error(`Error reordering inventory item: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in reorderItem:", error);
    return false;
  }
};

export const enableAutoReorder = async (
  itemId: string, 
  threshold: number, 
  quantity: number
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_auto_reorder')
      .upsert({
        item_id: itemId,
        enabled: true,
        threshold,
        quantity
      });

    if (error) {
      throw new Error(`Error enabling auto-reorder: ${error.message}`);
    }
    
    return true;
  } catch (error) {
    console.error("Error in enableAutoReorder:", error);
    return false;
  }
};
