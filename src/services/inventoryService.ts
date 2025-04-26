
// Re-export all the inventory services from their respective files

// From crudService.ts
export {
  getAllInventoryItems,
  getInventoryItemById,
  createInventoryItem,
  updateInventoryItem,
  deleteInventoryItem,
  updateInventoryQuantity,
  clearAllInventoryItems
} from './inventory/crudService';

// From autoReorderService.ts
export {
  enableAutoReorder,
  reorderItem,
  getAutoReorderSettings
} from './inventory/autoReorderService';

// From utils.ts
export {
  mapDbItemToInventoryItem,
  mapDbToInventoryItem,
  determineInventoryStatus,
  getInventoryStatus,
  formatInventoryItem,
  mapInventoryItemToDbFormat
} from './inventory/utils';

// Added alias for component compatibility
export const getInventoryItems = getAllInventoryItems;

// Add functions for work order inventory
export const checkItemAvailability = async (itemId: string, quantity: number): Promise<boolean> => {
  try {
    const { getAllInventoryItems } = await import('./inventory/crudService');
    const items = await getAllInventoryItems();
    const item = items.find(i => i.id === itemId);
    
    if (!item) return false;
    return item.quantity >= quantity;
  } catch (error) {
    console.error("Error checking item availability:", error);
    return false;
  }
};

export const reserveInventoryItems = async (
  workOrderId: string, 
  items: {id: string, quantity: number}[]
): Promise<boolean> => {
  try {
    const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
      .from('inventory_transactions')
      .insert(
        items.map(item => ({
          inventory_item_id: item.id,
          quantity: -item.quantity, // Negative for reservation
          transaction_type: 'reserve',
          reference_id: workOrderId,
          reference_type: 'work_order',
          notes: `Reserved for Work Order ${workOrderId}`
        }))
      );
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error reserving inventory items:", error);
    return false;
  }
};

export const consumeWorkOrderInventory = async (
  workOrderId: string, 
  items: {id: string, quantity: number}[]
): Promise<boolean> => {
  try {
    const { data, error } = await import('@/lib/supabase').then(m => m.supabase)
      .from('inventory_transactions')
      .insert(
        items.map(item => ({
          inventory_item_id: item.id,
          quantity: -item.quantity, // Negative for consumption
          transaction_type: 'consume',
          reference_id: workOrderId,
          reference_type: 'work_order',
          notes: `Consumed by Work Order ${workOrderId}`
        }))
      );
      
    if (error) throw error;
    return true;
  } catch (error) {
    console.error("Error consuming inventory items:", error);
    return false;
  }
};
