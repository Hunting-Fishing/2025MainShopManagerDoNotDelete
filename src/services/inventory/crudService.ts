
import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';

// Get all inventory items
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('getInventoryItems: Starting fetch...');
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('getInventoryItems: Supabase error:', error);
      throw error;
    }

    console.log('getInventoryItems: Raw data from Supabase:', data);

    const formattedItems = data?.map(item => ({
      id: item.id,
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 0,
      unit_price: item.unit_price || 0,
      price: item.unit_price || 0, // Legacy field
      supplier: item.supplier || '',
      location: item.location || '',
      status: item.status || 'active',
      created_at: item.created_at,
      updated_at: item.updated_at,
      
      // Extended fields with defaults for missing database properties
      partNumber: '',
      barcode: '',
      subcategory: '',
      manufacturer: '',
      vehicleCompatibility: '',
      onHold: 0,
      onOrder: 0,
      marginMarkup: 0,
      warrantyPeriod: '',
      dateBought: '',
      dateLast: '',
      notes: ''
    })) || [];

    console.log('getInventoryItems: Formatted items:', formattedItems);
    return formattedItems;
  } catch (error) {
    console.error("getInventoryItems: Error fetching inventory items:", error);
    throw error;
  }
};

// Get inventory item by ID
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) throw new Error('Inventory item not found');

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      price: data.unit_price || 0, // Legacy field
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Extended fields with defaults for missing database properties
      partNumber: '',
      barcode: '',
      subcategory: '',
      manufacturer: '',
      vehicleCompatibility: '',
      onHold: 0,
      onOrder: 0,
      marginMarkup: 0,
      warrantyPeriod: '',
      dateBought: '',
      dateLast: '',
      notes: ''
    };
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
};

// Create new inventory item
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert([{
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description,
        quantity: item.quantity,
        reorder_point: item.reorder_point,
        unit_price: item.unit_price,
        supplier: item.supplier,
        location: item.location,
        status: item.status
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      price: data.unit_price || 0, // Legacy field
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Extended fields with defaults for missing database properties
      partNumber: '',
      barcode: '',
      subcategory: '',
      manufacturer: '',
      vehicleCompatibility: '',
      onHold: 0,
      onOrder: 0,
      marginMarkup: 0,
      warrantyPeriod: '',
      dateBought: '',
      dateLast: '',
      notes: ''
    };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }
};

// Update inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({
        name: updates.name,
        sku: updates.sku,
        category: updates.category,
        description: updates.description,
        quantity: updates.quantity,
        reorder_point: updates.reorder_point,
        unit_price: updates.unit_price,
        supplier: updates.supplier,
        location: updates.location,
        status: updates.status
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      price: data.unit_price || 0, // Legacy field
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      
      // Extended fields with defaults for missing database properties
      partNumber: '',
      barcode: '',
      subcategory: '',
      manufacturer: '',
      vehicleCompatibility: '',
      onHold: 0,
      onOrder: 0,
      marginMarkup: 0,
      warrantyPeriod: '',
      dateBought: '',
      dateLast: '',
      notes: ''
    };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

// Update inventory quantity only
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    throw error;
  }
};

// Delete inventory item
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

// Clear all inventory items
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .gte('id', '0'); // Use a condition that matches all items

    if (error) throw error;
  } catch (error) {
    console.error("Error clearing all inventory items:", error);
    throw error;
  }
};
