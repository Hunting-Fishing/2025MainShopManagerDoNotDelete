
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended } from '@/types/inventory';
import { normalizeInventoryItem } from './utils';

export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  console.log('getInventoryItems: Starting database query...');
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('getInventoryItems: Database error:', error);
      throw error;
    }

    console.log('getInventoryItems: Raw database response:', data);
    console.log('getInventoryItems: Number of items fetched:', data?.length || 0);

    if (!data || data.length === 0) {
      console.log('getInventoryItems: No items found in database');
      return [];
    }

    // Transform and normalize each item
    const normalizedItems = data.map((item, index) => {
      console.log(`getInventoryItems: Processing item ${index + 1}:`, item);
      const normalized = normalizeInventoryItem(item);
      console.log(`getInventoryItems: Normalized item ${index + 1}:`, normalized);
      return normalized;
    });

    console.log('getInventoryItems: Final normalized items:', normalizedItems);
    console.log('getInventoryItems: Returning', normalizedItems.length, 'items');

    return normalizedItems;
  } catch (error) {
    console.error('getInventoryItems: Error in getInventoryItems:', error);
    throw error;
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  console.log('getInventoryItemById: Fetching item with ID:', id);
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) {
      console.error('getInventoryItemById: Database error:', error);
      throw error;
    }

    if (!data) {
      console.log('getInventoryItemById: No item found with ID:', id);
      return null;
    }

    console.log('getInventoryItemById: Raw item data:', data);
    const normalized = normalizeInventoryItem(data);
    console.log('getInventoryItemById: Normalized item:', normalized);
    
    return normalized;
  } catch (error) {
    console.error('getInventoryItemById: Error:', error);
    throw error;
  }
}

export async function createInventoryItem(item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> {
  console.log('createInventoryItem: Creating item:', item);
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: item.name,
        sku: item.sku,
        category: item.category,
        supplier: item.supplier,
        location: item.location,
        status: item.status,
        description: item.description,
        quantity: Number(item.quantity) || 0,
        reorder_point: Number(item.reorder_point) || 0,
        unit_price: Number(item.unit_price) || 0
      }])
      .select()
      .single();

    if (error) {
      console.error('createInventoryItem: Database error:', error);
      throw error;
    }

    console.log('createInventoryItem: Created item:', data);
    const normalized = normalizeInventoryItem(data);
    console.log('createInventoryItem: Normalized created item:', normalized);
    
    return normalized;
  } catch (error) {
    console.error('createInventoryItem: Error:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  console.log('updateInventoryItem: Updating item', id, 'with:', updates);
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        supplier: updates.supplier,
        location: updates.location,
        status: updates.status,
        description: updates.description,
        quantity: updates.quantity !== undefined ? Number(updates.quantity) : undefined,
        reorder_point: updates.reorder_point !== undefined ? Number(updates.reorder_point) : undefined,
        unit_price: updates.unit_price !== undefined ? Number(updates.unit_price) : undefined
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateInventoryItem: Database error:', error);
      throw error;
    }

    console.log('updateInventoryItem: Updated item:', data);
    const normalized = normalizeInventoryItem(data);
    console.log('updateInventoryItem: Normalized updated item:', normalized);
    
    return normalized;
  } catch (error) {
    console.error('updateInventoryItem: Error:', error);
    throw error;
  }
}

export async function updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItemExtended> {
  console.log('updateInventoryQuantity: Updating quantity for item', id, 'to:', quantity);
  
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity: Number(quantity) })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('updateInventoryQuantity: Database error:', error);
      throw error;
    }

    console.log('updateInventoryQuantity: Updated item:', data);
    const normalized = normalizeInventoryItem(data);
    console.log('updateInventoryQuantity: Normalized updated item:', normalized);
    
    return normalized;
  } catch (error) {
    console.error('updateInventoryQuantity: Error:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  console.log('deleteInventoryItem: Deleting item with ID:', id);
  
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('deleteInventoryItem: Database error:', error);
      throw error;
    }

    console.log('deleteInventoryItem: Successfully deleted item:', id);
  } catch (error) {
    console.error('deleteInventoryItem: Error:', error);
    throw error;
  }
}

export async function clearAllInventoryItems(): Promise<void> {
  console.log('clearAllInventoryItems: Clearing all inventory items...');
  
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all rows

    if (error) {
      console.error('clearAllInventoryItems: Database error:', error);
      throw error;
    }

    console.log('clearAllInventoryItems: Successfully cleared all inventory items');
  } catch (error) {
    console.error('clearAllInventoryItems: Error:', error);
    throw error;
  }
}
