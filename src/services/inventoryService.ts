
import { supabase } from "@/lib/supabase";
import { Inventory, InventoryItem, InventoryItemExtended } from "@/types/inventory";
import { mapDbItemToInventoryItem, formatInventoryItem } from "./inventory/utils";

// Get all inventory items
export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) throw error;

    return data.map(mapDbItemToInventoryItem);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }
}

// Check if an item is available in sufficient quantity
export async function checkItemAvailability(itemId: string, quantity: number): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    return data.quantity >= quantity;
  } catch (error) {
    console.error(`Error checking inventory availability for item ${itemId}:`, error);
    return false;
  }
}

// Reserve items for a work order (decrease available quantity)
export async function reserveInventoryItems(workOrderId: string, items: {id: string, quantity: number}[]): Promise<boolean> {
  try {
    for (const item of items) {
      // Check availability first
      const isAvailable = await checkItemAvailability(item.id, item.quantity);
      
      if (!isAvailable) {
        console.error(`Item ${item.id} not available in sufficient quantity`);
        return false;
      }
      
      // Decrease quantity
      const { error } = await supabase.rpc('reserve_inventory_item', {
        item_id: item.id,
        qty: item.quantity
      });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error reserving inventory items:", error);
    return false;
  }
}

// Consume items for a work order (finalize the usage)
export async function consumeWorkOrderInventory(workOrderId: string, items: {id: string, quantity: number}[]): Promise<boolean> {
  try {
    // Create adjustment records
    for (const item of items) {
      const { error } = await supabase
        .from('inventory_adjustments')
        .insert({
          work_order_id: workOrderId,
          inventory_item_id: item.id,
          quantity: -item.quantity, // negative for consumption
          adjustment_type: 'work_order'
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error("Error consuming work order inventory:", error);
    return false;
  }
}

// Update work order inventory items
export async function updateWorkOrderInventoryItems(workOrderId: string, items: any[]): Promise<boolean> {
  try {
    // First, delete existing items
    const { error: deleteError } = await supabase
      .from('work_order_inventory_items')
      .delete()
      .eq('work_order_id', workOrderId);
    
    if (deleteError) throw deleteError;
    
    // Then insert new items
    if (items.length > 0) {
      const formattedItems = items.map(item => ({
        work_order_id: workOrderId,
        name: item.name,
        sku: item.sku || '',
        category: item.category || '',
        quantity: item.quantity,
        unit_price: item.price || item.unitPrice || 0
      }));
      
      const { error: insertError } = await supabase
        .from('work_order_inventory_items')
        .insert(formattedItems);
      
      if (insertError) throw insertError;
    }
    
    return true;
  } catch (error) {
    console.error("Error updating work order inventory items:", error);
    return false;
  }
}
