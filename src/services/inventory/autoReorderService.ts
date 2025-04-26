
import { supabase } from "@/lib/supabase";
import { ReorderSettings, AutoReorderSettings } from "@/types/inventory";

export const enableAutoReorder = async (
  itemId: string,
  settings: AutoReorderSettings
): Promise<void> => {
  const { error } = await supabase
    .from('inventory_auto_reorder')
    .upsert({
      item_id: itemId,
      enabled: settings.enabled,
      threshold: settings.threshold,
      quantity: settings.quantity
    });

  if (error) {
    throw new Error(`Error enabling auto-reorder: ${error.message}`);
  }
};

export const disableAutoReorder = async (itemId: string): Promise<void> => {
  const { error } = await supabase
    .from('inventory_auto_reorder')
    .update({ enabled: false })
    .eq('item_id', itemId);

  if (error) {
    throw new Error(`Error disabling auto-reorder: ${error.message}`);
  }
};

export const getAutoReorderSettings = async (itemId: string): Promise<AutoReorderSettings | null> => {
  const { data, error } = await supabase
    .from('inventory_auto_reorder')
    .select('*')
    .eq('item_id', itemId)
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is "Row not found" error
    throw new Error(`Error fetching auto-reorder settings: ${error.message}`);
  }

  if (!data) {
    return null;
  }

  return {
    enabled: data.enabled,
    threshold: data.threshold,
    quantity: data.quantity
  };
};

export const getReorderSettings = async (): Promise<ReorderSettings[]> => {
  const { data, error } = await supabase
    .from('inventory_auto_reorder')
    .select(`
      item_id,
      enabled,
      threshold,
      quantity,
      inventory_items(name, sku, status, quantity)
    `);

  if (error) {
    throw new Error(`Error fetching reorder settings: ${error.message}`);
  }

  return data.map(item => ({
    itemId: item.item_id,
    threshold: item.threshold,
    quantity: item.quantity,
    enabled: item.enabled
  }));
};
