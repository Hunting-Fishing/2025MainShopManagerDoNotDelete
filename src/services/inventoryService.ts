
import { supabase } from "@/lib/supabase";
import { InventoryItem } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";

/**
 * Get all inventory items
 */
export const getInventoryItems = async (): Promise<InventoryItem[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
    
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting inventory items:', error);
    throw error;
  }
};

/**
 * Get a single inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItem | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error getting inventory item by ID:', error);
    throw error;
  }
};

/**
 * Update inventory item quantity
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItem> => {
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
    
    return data;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
};

/**
 * Reserve inventory items for a work order
 */
export const reserveInventoryItems = async (items: WorkOrderInventoryItem[]): Promise<void> => {
  try {
    // Get current inventory levels for the items
    const itemIds = items.map(item => item.id);
    const { data: currentInventory, error } = await supabase
      .from('inventory_items')
      .select('id, quantity')
      .in('id', itemIds);
    
    if (error) {
      throw error;
    }
    
    // Update each item's quantity
    for (const item of items) {
      const currentItem = currentInventory?.find(i => i.id === item.id);
      if (currentItem) {
        const newQuantity = Math.max(0, Number(currentItem.quantity) - Number(item.quantity));
        await updateInventoryQuantity(item.id, newQuantity);
      }
    }
  } catch (error) {
    console.error('Error reserving inventory items:', error);
    throw error;
  }
};

/**
 * Update work order inventory items
 */
export const updateWorkOrderInventoryItems = async (workOrderId: string, items: WorkOrderInventoryItem[]): Promise<void> => {
  try {
    // First, delete existing work order inventory items
    const { error: deleteError } = await supabase
      .from('work_order_inventory')
      .delete()
      .eq('work_order_id', workOrderId);
    
    if (deleteError) {
      throw deleteError;
    }
    
    // Then insert the updated items
    if (items.length > 0) {
      const workOrderItems = items.map(item => ({
        work_order_id: workOrderId,
        inventory_item_id: item.id,
        quantity: item.quantity,
        unit_price: item.unitPrice,
        total: item.quantity * item.unitPrice
      }));
      
      const { error: insertError } = await supabase
        .from('work_order_inventory')
        .insert(workOrderItems);
      
      if (insertError) {
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error updating work order inventory items:', error);
    throw error;
  }
};

/**
 * Clear all inventory items (ADMIN ONLY - USE WITH CAUTION)
 */
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .gt('id', '0'); // This is just a trick to delete all rows
    
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error clearing all inventory items:', error);
    throw error;
  }
};

/**
 * Check if an item is available in the requested quantity
 */
export const checkItemAvailability = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', itemId)
      .single();
    
    if (error) {
      throw error;
    }
    
    return data.quantity >= quantity;
  } catch (error) {
    console.error('Error checking item availability:', error);
    throw error;
  }
};

/**
 * Consume inventory items from a work order (mark as used)
 */
export const consumeWorkOrderInventory = async (workOrderId: string): Promise<boolean> => {
  try {
    // First get the work order inventory items
    const { data: workOrderItems, error: fetchError } = await supabase
      .from('work_order_inventory')
      .select('inventory_item_id, quantity')
      .eq('work_order_id', workOrderId);
    
    if (fetchError) {
      throw fetchError;
    }
    
    // No items to consume
    if (!workOrderItems || workOrderItems.length === 0) {
      return true;
    }
    
    // Update inventory quantities
    for (const item of workOrderItems) {
      const { data: inventoryItem, error: itemError } = await supabase
        .from('inventory_items')
        .select('quantity')
        .eq('id', item.inventory_item_id)
        .single();
      
      if (itemError) {
        throw itemError;
      }
      
      // Calculate new quantity and update
      const newQuantity = Math.max(0, inventoryItem.quantity - item.quantity);
      
      const { error: updateError } = await supabase
        .from('inventory_items')
        .update({ quantity: newQuantity })
        .eq('id', item.inventory_item_id);
      
      if (updateError) {
        throw updateError;
      }
    }
    
    // Mark the work order inventory as consumed
    const { error: markError } = await supabase
      .from('work_orders')
      .update({ inventory_consumed: true })
      .eq('id', workOrderId);
    
    if (markError) {
      throw markError;
    }
    
    return true;
  } catch (error) {
    console.error('Error consuming work order inventory:', error);
    return false;
  }
};
