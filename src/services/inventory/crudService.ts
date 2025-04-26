import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (itemId: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', itemId)
      .single();

    if (error) throw error;
    
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      sku: data.sku || '',
      category: data.category || '',
      supplier: data.supplier || '',
      quantity: data.quantity || 0,
      reorderPoint: data.reorder_point || 0,
      unitPrice: data.unit_price || 0,
      location: data.location || '',
      status: data.quantity <= 0 ? 'Out of Stock' : 
             data.quantity <= data.reorder_point ? 'Low Stock' : 'In Stock',
      description: data.description || ''
    };
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};

/**
 * Get all inventory items
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
 * Create a new inventory item
 */
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<string | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([
        { 
          name: item.name,
          sku: item.sku,
          category: item.category,
          supplier: item.supplier,
          quantity: item.quantity,
          reorder_point: item.reorderPoint,
          unit_price: item.unitPrice,
          location: item.location,
          status: item.status,
          description: item.description
        }
      ])
      .select('id')
      .single();

    if (error) throw error;
    return data.id;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return null;
  }
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (id: string, item: Partial<InventoryItemExtended>): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .update({
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        quantity: item.quantity,
        reorder_point: item.reorderPoint,
        unit_price: item.unitPrice,
        location: item.location,
        status: item.status,
        description: item.description
      })
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return false;
  }
};

/**
 * Delete an inventory item
 */
export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};

/**
 * Clear all inventory items (primarily for demo/testing)
 */
export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .neq('id', ''); // Delete all rows
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error clearing inventory items:', error);
    return false;
  }
};
