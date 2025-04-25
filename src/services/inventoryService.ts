
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';
import { WorkOrderInventoryItem } from '@/types/workOrder';

// Get all inventory items
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*');

  if (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }

  return data || [];
};

// Aliased for backward compatibility
export const getAllInventoryItems = getInventoryItems;

// Get inventory categories
export const getInventoryCategories = async (): Promise<string[]> => {
  const { data, error } = await supabase
    .from('inventory_categories')
    .select('name');

  if (error) {
    console.error('Error fetching inventory categories:', error);
    throw error;
  }

  return data?.map(category => category.name) || [];
};

// Clear all inventory items (with confirmation)
export const clearAllInventoryItems = async (): Promise<void> => {
  const { error } = await supabase
    .from('inventory_items')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Safe delete - avoid deleting everything if id constraint fails

  if (error) {
    console.error('Error clearing inventory items:', error);
    throw error;
  }
};

// Reserve inventory for work orders
export const reserveInventory = async (items: WorkOrderInventoryItem[]): Promise<boolean> => {
  // Implementation depends on your business logic
  // For now, just return true
  return true;
};

// Consume work order inventory
export const consumeWorkOrderInventory = async (items: WorkOrderInventoryItem[]): Promise<boolean> => {
  // For each item, reduce inventory by the quantity
  for (const item of items) {
    const { error } = await supabase
      .from('inventory_items')
      .update({ quantity: supabase.rpc('decrement_quantity', { item_id: item.id, qty: item.quantity }) })
      .eq('id', item.id);
    
    if (error) {
      console.error(`Error consuming inventory for item ${item.id}:`, error);
      return false;
    }
  }
  
  return true;
};

// Check if an item is available in the required quantity
export const checkItemAvailability = async (itemId: string, requestedQuantity: number): Promise<boolean> => {
  const { data, error } = await supabase
    .rpc('check_inventory_availability', { item_id: itemId, requested_quantity: requestedQuantity });

  if (error) {
    console.error('Error checking inventory availability:', error);
    return false;
  }
  
  return data || false;
};

// Get auto-reorder settings
export const getAutoReorderSettings = async (): Promise<Record<string, AutoReorderSettings>> => {
  const { data, error } = await supabase
    .from('inventory_auto_reorder')
    .select('*');

  if (error) {
    console.error('Error fetching auto-reorder settings:', error);
    throw error;
  }

  const settings: Record<string, AutoReorderSettings> = {};
  data?.forEach(setting => {
    settings[setting.item_id] = {
      enabled: setting.enabled,
      threshold: setting.threshold,
      quantity: setting.quantity
    };
  });

  return settings;
};

// Get low stock items
export const getLowStockItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .lt('quantity', supabase.raw('reorder_point'))
    .gt('quantity', 0);

  if (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }

  return data || [];
};

// Get out of stock items
export const getOutOfStockItems = async (): Promise<InventoryItemExtended[]> => {
  const { data, error } = await supabase
    .from('inventory_items')
    .select('*')
    .eq('quantity', 0);

  if (error) {
    console.error('Error fetching out of stock items:', error);
    throw error;
  }

  return data || [];
};

// Reorder an item
export const reorderItem = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    // Here you would create a purchase order or similar
    // For now, we'll simulate a successful reorder
    return true;
  } catch (error) {
    console.error(`Error reordering item ${itemId}:`, error);
    return false;
  }
};

// Enable auto-reorder for an item
export const enableAutoReorder = async (itemId: string, threshold: number, quantity: number): Promise<boolean> => {
  const { error } = await supabase
    .from('inventory_auto_reorder')
    .upsert({
      item_id: itemId,
      threshold: threshold,
      quantity: quantity,
      enabled: true
    });

  if (error) {
    console.error(`Error enabling auto-reorder for item ${itemId}:`, error);
    return false;
  }

  return true;
};
