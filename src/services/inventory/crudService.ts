
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended } from '@/types/inventory';

// Format database item to application format
const formatInventoryItem = (item: any): InventoryItemExtended => ({
  id: item.id,
  name: item.name || '',
  sku: item.sku || '',
  description: item.description || '',
  price: item.unit_price || 0, // Legacy field for backward compatibility
  unit_price: item.unit_price || 0,
  category: item.category || '',
  supplier: item.supplier || '',
  status: item.status || 'active',
  quantity: item.quantity || 0,
  reorder_point: item.reorder_point || 0,
  location: item.location || '',
  created_at: item.created_at,
  updated_at: item.updated_at,
  
  // Set default values for extended fields that may not exist in DB
  partNumber: '',
  barcode: '',
  subcategory: '',
  manufacturer: '',
  vehicleCompatibility: '',
  measurementUnit: '',
  onHold: 0,
  onOrder: 0,
  minStockLevel: item.reorder_point || 0,
  maxStockLevel: 0,
  sellPricePerUnit: item.unit_price || 0,
  sell_price_per_unit: item.unit_price || 0,
  costPerUnit: item.unit_price || 0,
  cost_per_unit: item.unit_price || 0,
  marginMarkup: 0,
  taxRate: 0,
  taxExempt: false,
  environmentalFee: 0,
  coreCharge: 0,
  hazmatFee: 0,
  weight: 0,
  dimensions: '',
  color: '',
  material: '',
  modelYear: '',
  oemPartNumber: '',
  universalPart: false,
  warrantyPeriod: '',
  dateBought: '',
  dateLast: '',
  notes: '',
  cost: item.unit_price || 0
});

export async function getInventoryItems(): Promise<InventoryItemExtended[]> {
  try {
    console.log('crudService: Fetching inventory items from Supabase...');
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name', { ascending: true });

    if (error) {
      console.error('crudService: Error fetching inventory items:', error);
      throw error;
    }

    console.log('crudService: Raw data from Supabase:', data);
    const formattedItems = (data || []).map(formatInventoryItem);
    console.log('crudService: Formatted items:', formattedItems);
    
    return formattedItems;
  } catch (error) {
    console.error('crudService: Failed to fetch inventory items:', error);
    throw error;
  }
}

export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      throw error;
    }

    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error fetching inventory item by ID:', error);
    throw error;
  }
}

export async function createInventoryItem(item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .insert({
        name: item.name,
        sku: item.sku,
        description: item.description,
        category: item.category,
        supplier: item.supplier,
        location: item.location,
        status: item.status || 'active',
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        unit_price: item.unit_price || 0
      })
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
}

export async function updateInventoryItem(
  id: string, 
  updates: Partial<InventoryItemExtended>
): Promise<InventoryItemExtended> {
  try {
    const updateData: any = {};
    
    // Only include fields that exist in the database
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.sku !== undefined) updateData.sku = updates.sku;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.reorder_point !== undefined) updateData.reorder_point = updates.reorder_point;
    if (updates.unit_price !== undefined) updateData.unit_price = updates.unit_price;

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
}

export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
}

export async function updateInventoryQuantity(id: string, quantity: number): Promise<InventoryItemExtended> {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return formatInventoryItem(data);
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
}

export async function clearAllInventoryItems(): Promise<void> {
  try {
    const { error } = await supabase
      .from('inventory')
      .delete()
      .gte('created_at', '1970-01-01'); // Delete all records

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing all inventory items:', error);
    throw error;
  }
}
