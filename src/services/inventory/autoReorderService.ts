
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { AutoReorderSettings, ReorderSettings } from "@/types/inventory";
import { updateInventoryQuantity } from "./crudService";

// Enable or disable auto-reorder for an item
export const enableAutoReorder = async (
  itemId: string,
  threshold: number,
  quantity: number,
  enabled = true
): Promise<boolean> => {
  try {
    const { data, error } = await supabase
      .from('inventory_auto_reorder')
      .upsert({
        item_id: itemId,
        threshold,
        quantity,
        enabled
      });

    if (error) {
      throw error;
    }

    // Also update the item's reorder point
    await supabase
      .from('inventory_items')
      .update({ min_stock_level: threshold })
      .eq('id', itemId);

    return true;
  } catch (error) {
    console.error('Error setting auto-reorder:', error);
    return false;
  }
};

// Get auto-reorder settings for an item
export const getAutoReorderSettings = async (itemId: string): Promise<AutoReorderSettings | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_auto_reorder')
      .select('*')
      .eq('item_id', itemId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No settings found
        return { enabled: false, threshold: 5, quantity: 10 };
      }
      throw error;
    }

    return {
      enabled: data.enabled,
      threshold: data.threshold,
      quantity: data.quantity
    };
  } catch (error) {
    console.error('Error getting auto-reorder settings:', error);
    return null;
  }
};

// Reorder an item (manually)
export const reorderItem = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    // Create a purchase order entry (in a real app)
    // For now, we'll just update the inventory quantity
    const currentItem = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();
    
    if (currentItem.error) throw currentItem.error;
    
    const newQuantity = currentItem.data.quantity + quantity;
    
    await updateInventoryQuantity(itemId, newQuantity);
    
    // Record a transaction for this reorder
    await supabase.from('inventory_transactions').insert({
      inventory_item_id: itemId,
      quantity: quantity,
      transaction_type: 'reorder',
      notes: 'Manual reorder'
    });
    
    return true;
  } catch (error) {
    console.error('Error reordering item:', error);
    return false;
  }
};
