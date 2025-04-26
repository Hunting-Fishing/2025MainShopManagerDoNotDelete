
// Re-export all inventory services from subdirectories
export * from './inventory/crudService';
export * from './inventory/filterService';
export * from './inventory/utils';
export * from './inventory/autoReorderService';

// Alias export for inventory service for backwards compatibility
export { getAllInventoryItems as getInventoryItems } from './inventory/crudService';

// Add missing reorder functions
export async function reorderItem(itemId: string, quantity: number): Promise<boolean> {
  try {
    const { getInventoryItemById, updateInventoryQuantity } = await import('./inventory/crudService');
    
    // First, get the current item to get its existing quantity
    const currentItem = await getInventoryItemById(itemId);
    
    if (!currentItem) {
      throw new Error("Item not found");
    }
    
    // Calculate new quantity (adding to existing)
    const newQuantity = (currentItem.quantity || 0) + quantity;
    
    // Update the item with new quantity
    await updateInventoryQuantity(itemId, newQuantity);
    
    return true;
  } catch (error) {
    console.error("Error reordering item:", error);
    return false;
  }
}

export async function enableAutoReorder(itemId: string, threshold: number, quantity: number): Promise<boolean> {
  try {
    const { supabase } = await import('@/lib/supabase');
    
    const { error } = await supabase
      .from('inventory_auto_reorder')
      .upsert({
        item_id: itemId,
        threshold,
        quantity,
        enabled: true,
        updated_at: new Date().toISOString()
      });
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error enabling auto-reorder:", error);
    return false;
  }
}
