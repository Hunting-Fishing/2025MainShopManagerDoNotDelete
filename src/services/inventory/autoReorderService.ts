
import { supabase } from '@/lib/supabase';

export interface AutoReorderSettings {
  enabled: boolean;
  threshold: number;
  quantity: number;
}

/**
 * Get auto-reorder settings for all items or a specific item
 */
export const getAutoReorderSettings = async (itemId?: string): Promise<Record<string, AutoReorderSettings>> => {
  try {
    const query = supabase
      .from('inventory_reorder_settings')
      .select('*');
    
    if (itemId) {
      query.eq('inventory_item_id', itemId);
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    const settings: Record<string, AutoReorderSettings> = {};
    
    data.forEach(item => {
      settings[item.inventory_item_id] = {
        enabled: item.enabled,
        threshold: item.threshold,
        quantity: item.quantity
      };
    });
    
    return settings;
  } catch (error) {
    console.error('Error fetching auto-reorder settings:', error);
    return {};
  }
};

/**
 * Enable auto-reorder for a specific inventory item
 */
export const enableAutoReorder = async (
  itemId: string, 
  threshold: number, 
  quantity: number
): Promise<boolean> => {
  try {
    const { data: existing, error: checkError } = await supabase
      .from('inventory_reorder_settings')
      .select('*')
      .eq('inventory_item_id', itemId)
      .single();
    
    if (checkError && checkError.code !== 'PGRST116') throw checkError;
    
    if (existing) {
      // Update existing settings
      const { error } = await supabase
        .from('inventory_reorder_settings')
        .update({
          enabled: true,
          threshold,
          quantity
        })
        .eq('inventory_item_id', itemId);
      
      if (error) throw error;
    } else {
      // Insert new settings
      const { error } = await supabase
        .from('inventory_reorder_settings')
        .insert({
          inventory_item_id: itemId,
          enabled: true,
          threshold,
          quantity
        });
      
      if (error) throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error enabling auto-reorder:', error);
    return false;
  }
};

/**
 * Disable auto-reorder for a specific inventory item
 */
export const disableAutoReorder = async (itemId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_reorder_settings')
      .update({ enabled: false })
      .eq('inventory_item_id', itemId);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error disabling auto-reorder:', error);
    return false;
  }
};

/**
 * Manually reorder an inventory item
 */
export const reorderItem = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    // In a real application, this would create a purchase order
    // For now, we'll just log it and return success
    console.log(`Manual reorder placed for item ${itemId}: ${quantity} units`);
    
    // You could record this in a reorder history table if available
    const { error } = await supabase
      .from('inventory_transactions')
      .insert({
        inventory_item_id: itemId,
        transaction_type: 'reorder',
        quantity,
        notes: 'Manual reorder'
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error placing manual reorder:', error);
    return false;
  }
};
