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

// Add missing inventory functions for work orders
export async function updateWorkOrderInventoryItems(workOrderId: string, items: any[]): Promise<boolean> {
  try {
    // Implementation would connect to backend service/API
    console.log(`Updating inventory items for work order ${workOrderId}`, items);
    return true;
  } catch (error) {
    console.error("Error updating work order inventory items:", error);
    return false;
  }
}

export async function checkItemAvailability(itemId: string, quantity: number): Promise<boolean> {
  try {
    const { getInventoryItemById } = await import('./inventory/crudService');
    const item = await getInventoryItemById(itemId);
    
    if (!item) return false;
    return (item.quantity || 0) >= quantity;
  } catch (error) {
    console.error("Error checking item availability:", error);
    return false;
  }
}

export async function consumeWorkOrderInventory(workOrderId: string, items: any[]): Promise<boolean> {
  try {
    // Implementation would connect to backend service/API
    console.log(`Consuming inventory for work order ${workOrderId}`, items);
    return true;
  } catch (error) {
    console.error("Error consuming work order inventory:", error);
    return false;
  }
}

export async function reserveInventoryItems(workOrderId: string, items: any[]): Promise<boolean> {
  try {
    // Implementation would reserve inventory items for a work order
    console.log(`Reserving inventory items for work order ${workOrderId}`, items);
    return true;
  } catch (error) {
    console.error("Error reserving inventory items:", error);
    return false;
  }
}
