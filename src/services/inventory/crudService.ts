
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended } from '@/types/inventory';

export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return data?.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      reorder_point: item.reorder_point,
      unit_price: item.unit_price,
      price: item.unit_price || 0, // Legacy field - same as unit_price
      supplier: item.supplier,
      location: item.location,
      status: item.status,
      created_at: item.created_at,
      updated_at: item.updated_at,
      partNumber: item.part_number,
      barcode: item.barcode,
      subcategory: item.subcategory,
      manufacturer: item.manufacturer,
      vehicleCompatibility: item.vehicle_compatibility,
      onHold: item.on_hold,
      onOrder: item.on_order,
      marginMarkup: item.margin_markup,
      warrantyPeriod: item.warranty_period,
      dateBought: item.date_bought,
      dateLast: item.date_last,
      notes: item.notes
    })) || [];
  } catch (error) {
    console.error('Error fetching inventory items:', error);
    throw error;
  }
};

export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) throw error;
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      reorder_point: data.reorder_point,
      unit_price: data.unit_price,
      price: data.unit_price || 0, // Legacy field - same as unit_price
      supplier: data.supplier,
      location: data.location,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number,
      barcode: data.barcode,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      vehicleCompatibility: data.vehicle_compatibility,
      onHold: data.on_hold,
      onOrder: data.on_order,
      marginMarkup: data.margin_markup,
      warrantyPeriod: data.warranty_period,
      dateBought: data.date_bought,
      dateLast: data.date_last,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    throw error;
  }
};

export const createInventoryItem = async (item: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([{
        name: item.name,
        sku: item.sku,
        category: item.category,
        description: item.description,
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        unit_price: item.unit_price || 0,
        supplier: item.supplier,
        location: item.location,
        status: item.status || 'active',
        part_number: item.partNumber,
        barcode: item.barcode,
        subcategory: item.subcategory,
        manufacturer: item.manufacturer,
        vehicle_compatibility: item.vehicleCompatibility,
        on_hold: item.onHold,
        on_order: item.onOrder,
        margin_markup: item.marginMarkup,
        warranty_period: item.warrantyPeriod,
        date_bought: item.dateBought,
        date_last: item.dateLast,
        notes: item.notes
      }])
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      reorder_point: data.reorder_point,
      unit_price: data.unit_price,
      price: data.unit_price || 0, // Legacy field - same as unit_price
      supplier: data.supplier,
      location: data.location,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number,
      barcode: data.barcode,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      vehicleCompatibility: data.vehicle_compatibility,
      onHold: data.on_hold,
      onOrder: data.on_order,
      marginMarkup: data.margin_markup,
      warrantyPeriod: data.warranty_period,
      dateBought: data.date_bought,
      dateLast: data.date_last,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error creating inventory item:', error);
    throw error;
  }
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
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
        status: updates.status,
        part_number: updates.partNumber,
        barcode: updates.barcode,
        subcategory: updates.subcategory,
        manufacturer: updates.manufacturer,
        vehicle_compatibility: updates.vehicleCompatibility,
        on_hold: updates.onHold,
        on_order: updates.onOrder,
        margin_markup: updates.marginMarkup,
        warranty_period: updates.warrantyPeriod,
        date_bought: updates.dateBought,
        date_last: updates.dateLast,
        notes: updates.notes,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      reorder_point: data.reorder_point,
      unit_price: data.unit_price,
      price: data.unit_price || 0, // Legacy field - same as unit_price
      supplier: data.supplier,
      location: data.location,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number,
      barcode: data.barcode,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      vehicleCompatibility: data.vehicle_compatibility,
      onHold: data.on_hold,
      onOrder: data.on_order,
      marginMarkup: data.margin_markup,
      warrantyPeriod: data.warranty_period,
      dateBought: data.date_bought,
      dateLast: data.date_last,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error updating inventory item:', error);
    throw error;
  }
};

export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ 
        quantity,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    return {
      id: data.id,
      name: data.name,
      sku: data.sku,
      category: data.category,
      description: data.description,
      quantity: data.quantity,
      reorder_point: data.reorder_point,
      unit_price: data.unit_price,
      price: data.unit_price || 0, // Legacy field - same as unit_price
      supplier: data.supplier,
      location: data.location,
      status: data.status,
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number,
      barcode: data.barcode,
      subcategory: data.subcategory,
      manufacturer: data.manufacturer,
      vehicleCompatibility: data.vehicle_compatibility,
      onHold: data.on_hold,
      onOrder: data.on_order,
      marginMarkup: data.margin_markup,
      warrantyPeriod: data.warranty_period,
      dateBought: data.date_bought,
      dateLast: data.date_last,
      notes: data.notes
    };
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    throw error;
  }
};

export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    throw error;
  }
};

export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .gte('created_at', '1970-01-01T00:00:00.000Z'); // Delete all items

    if (error) throw error;
  } catch (error) {
    console.error('Error clearing all inventory items:', error);
    throw error;
  }
};
