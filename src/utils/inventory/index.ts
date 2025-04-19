
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';

/**
 * Get all inventory items with extended data
 */
export const getAllInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');

    if (error) throw error;

    // Map the data to InventoryItemExtended format
    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku || '',
      category: item.category || '',
      supplier: item.supplier || '',
      quantity: item.quantity || 0,
      reorderPoint: item.reorder_point || 0,
      unitPrice: item.unit_price || 0,
      location: item.location || '',
      status: item.quantity <= 0 ? 'Out of Stock' : 
             item.quantity <= item.reorder_point ? 'Low Stock' : 'In Stock'
    }));
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

/**
 * Fetch low stock inventory items
 */
export const getLowStockItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .lt('quantity', 'reorder_point')
      .gt('quantity', 0)
      .order('quantity');

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku || '',
      category: item.category || '',
      supplier: item.supplier || '',
      quantity: item.quantity || 0,
      reorderPoint: item.reorder_point || 0,
      unitPrice: item.unit_price || 0,
      location: item.location || '',
      status: 'Low Stock'
    }));
  } catch (error) {
    console.error('Error fetching low stock items:', error);
    throw error;
  }
};

/**
 * Fetch out of stock inventory items
 */
export const getOutOfStockItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('quantity', 0)
      .order('name');

    if (error) throw error;

    return data.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku || '',
      category: item.category || '',
      supplier: item.supplier || '',
      quantity: item.quantity || 0,
      reorderPoint: item.reorder_point || 0,
      unitPrice: item.unit_price || 0,
      location: item.location || '',
      status: 'Out of Stock'
    }));
  } catch (error) {
    console.error('Error fetching out of stock items:', error);
    throw error;
  }
};

/**
 * Get auto reorder settings
 */
export const getAutoReorderSettings = async () => {
  try {
    const { data, error } = await supabase
      .from('inventory_settings')
      .select('auto_reorder_enabled')
      .single();

    if (error && error.code !== 'PGRST116') throw error;

    return {
      enabled: data?.auto_reorder_enabled || false
    };
  } catch (error) {
    console.error('Error fetching auto reorder settings:', error);
    return { enabled: false };
  }
};

/**
 * Update the inventory quantity for an item
 */
export const updateInventoryQuantity = async (itemId: string, quantityChange: number): Promise<boolean> => {
  try {
    const { error } = await supabase.rpc('update_inventory_quantity', {
      item_id: itemId,
      quantity_change: quantityChange
    });

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    return false;
  }
};

/**
 * Consume inventory items for a work order
 */
export const consumeInventoryForWorkOrder = async (
  workOrderId: string, 
  items: {id: string, quantity: number}[]
): Promise<boolean> => {
  try {
    for (const item of items) {
      // Reduce inventory quantity
      const { error: updateError } = await supabase.rpc('update_inventory_quantity', {
        item_id: item.id,
        quantity_change: -item.quantity
      });
      
      if (updateError) throw updateError;
      
      // Record inventory transaction
      const { error: transactionError } = await supabase
        .from('inventory_transactions')
        .insert({
          inventory_item_id: item.id,
          quantity: item.quantity,
          transaction_type: 'consumption',
          reference_type: 'work_order',
          reference_id: workOrderId,
          notes: 'Consumed for work order'
        });
        
      if (transactionError) throw transactionError;
    }
    
    return true;
  } catch (error) {
    console.error('Error consuming inventory for work order:', error);
    return false;
  }
};
