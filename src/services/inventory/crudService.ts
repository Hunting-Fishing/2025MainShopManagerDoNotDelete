import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended } from '@/types/inventory';
import { formatInventoryForApi, formatInventoryItem } from '@/utils/inventory/inventoryUtils';

export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  try {
    console.log('Fetching inventory items from database...');
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching inventory items:', error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} inventory items`);
    return data?.map(formatInventoryItem) || [];
  } catch (error) {
    console.error('Error in getInventoryItems:', error);
    throw error;
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  try {
    console.log('Fetching inventory item by ID:', id);
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Item not found
      }
      console.error('Error fetching inventory item:', error);
      throw error;
    }

    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error in getInventoryItemById:', error);
    throw error;
  }
}

export async function createInventoryItem(item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> {
  try {
    console.log('Creating inventory item:', item);
    
    const apiData = formatInventoryForApi(item);
    
    const { data, error } = await supabase
      .from('inventory')
      .insert([apiData])
      .select()
      .single();

    if (error) {
      console.error('Error creating inventory item:', error);
      throw error;
    }

    console.log('Successfully created inventory item:', data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error in createInventoryItem:', error);
    throw error;
  }
}

export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  try {
    console.log('Updating inventory item:', id, updates);
    
    const apiData = formatInventoryForApi(updates);
    
    const { data, error } = await supabase
      .from('inventory')
      .update(apiData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating inventory item:', error);
      throw error;
    }

    console.log('Successfully updated inventory item:', data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error in updateInventoryItem:', error);
    throw error;
  }
}

export async function updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItemExtended> {
  return updateInventoryItem(id, { quantity });
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    console.log('Deleting inventory item:', id);
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting inventory item:', error);
      throw error;
    }

    console.log('Successfully deleted inventory item:', id);
  } catch (error) {
    console.error('Error in deleteInventoryItem:', error);
    throw error;
  }
}

export async function clearAllInventoryItems(): Promise<void> {
  try {
    console.log('Clearing all inventory items from database...');
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records (using a condition that's always true)

    if (error) {
      console.error('Error clearing all inventory items:', error);
      throw error;
    }

    console.log('Successfully cleared all inventory items');
  } catch (error) {
    console.error('Error in clearAllInventoryItems:', error);
    throw error;
  }
}
