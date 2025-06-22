import { supabase } from '@/lib/supabase';
import { InventoryItemExtended } from '@/types/inventory';

export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*');

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    return data.map(item => ({
      id: item.id,
      name: item.name || '',
      sku: item.sku || '',
      category: item.category || '',
      description: item.description || '',
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 0,
      unit_price: item.unit_price || 0,
      supplier: item.supplier || '',
      location: item.location || '',
      status: item.status || 'active',
      created_at: item.created_at,
      updated_at: item.updated_at,
      partNumber: item.part_number || '',
      barcode: item.barcode || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      vehicleCompatibility: item.vehicle_compatibility || '',
      onHold: item.on_hold || 0,
      onOrder: item.on_order || 0,
      marginMarkup: item.margin_markup || 0,
      weight: item.weight || 0,
      dimensions: item.dimensions || '',
      warrantyPeriod: item.warranty_period || '',
      dateBought: item.date_bought || '',
      dateLast: item.date_last || '',
      notes: item.notes || ''
    }));
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }
};

export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error("Error fetching inventory item by ID:", error);
      return null;
    }

    if (!data) {
      console.log(`Inventory item with ID ${id} not found.`);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number || '',
      barcode: data.barcode || '',
      subcategory: data.subcategory || '',
      manufacturer: data.manufacturer || '',
      vehicleCompatibility: data.vehicle_compatibility || '',
      onHold: data.on_hold || 0,
      onOrder: data.on_order || 0,
      marginMarkup: data.margin_markup || 0,
      weight: data.weight || 0,
      dimensions: data.dimensions || '',
      warrantyPeriod: data.warranty_period || '',
      dateBought: data.date_bought || '',
      dateLast: data.date_last || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    return null;
  }
};

export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id'>): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert([
        {
          name: item.name,
          sku: item.sku,
          category: item.category,
          description: item.description,
          quantity: item.quantity,
          reorder_point: item.reorder_point,
          unit_price: item.unit_price,
          supplier: item.supplier,
          location: item.location,
          status: item.status,
          part_number: item.partNumber,
          barcode: item.barcode,
          subcategory: item.subcategory,
          manufacturer: item.manufacturer,
          vehicle_compatibility: item.vehicleCompatibility,
          on_hold: item.onHold,
          on_order: item.onOrder,
          margin_markup: item.marginMarkup,
          weight: item.weight,
          dimensions: item.dimensions,
          warranty_period: item.warrantyPeriod,
          date_bought: item.dateBought,
          date_last: item.dateLast,
          notes: item.notes
        }
      ])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }

    if (!data) {
      console.log("Failed to create inventory item.");
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number || '',
      barcode: data.barcode || '',
      subcategory: data.subcategory || '',
      manufacturer: data.manufacturer || '',
      vehicleCompatibility: data.vehicle_compatibility || '',
      onHold: data.on_hold || 0,
      onOrder: data.on_order || 0,
      marginMarkup: data.margin_markup || 0,
      weight: data.weight || 0,
      dimensions: data.dimensions || '',
      warrantyPeriod: data.warranty_period || '',
      dateBought: data.date_bought || '',
      dateLast: data.date_last || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error("Error creating inventory item:", error);
    return null;
  }
};

export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
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
        updated_at: new Date().toISOString(),
        part_number: updates.partNumber,
        barcode: updates.barcode,
        subcategory: updates.subcategory,
        manufacturer: updates.manufacturer,
        vehicle_compatibility: updates.vehicleCompatibility,
        on_hold: updates.onHold,
        on_order: updates.onOrder,
        margin_markup: updates.marginMarkup,
        weight: updates.weight,
        dimensions: updates.dimensions,
        warranty_period: updates.warrantyPeriod,
        date_bought: updates.dateBought,
        date_last: updates.dateLast,
        notes: updates.notes
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }

    if (!data) {
      console.log(`Inventory item with ID ${id} not found for update.`);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number || '',
      barcode: data.barcode || '',
      subcategory: data.subcategory || '',
      manufacturer: data.manufacturer || '',
      vehicleCompatibility: data.vehicle_compatibility || '',
      onHold: data.on_hold || 0,
      onOrder: data.on_order || 0,
      marginMarkup: data.margin_markup || 0,
      weight: data.weight || 0,
      dimensions: data.dimensions || '',
      warrantyPeriod: data.warranty_period || '',
      dateBought: data.dateBought || '',
      dateLast: data.dateLast || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error("Error updating inventory item:", error);
    return null;
  }
};

export const updateInventoryQuantity = async (id: string, quantityChange: number): Promise<InventoryItemExtended | null> => {
  try {
    // Get the current quantity
    const { data: currentItem, error: selectError } = await supabase
      .from('inventory_items')
      .select('quantity')
      .eq('id', id)
      .single();

    if (selectError) {
      console.error("Error fetching current quantity:", selectError);
      throw selectError;
    }

    if (!currentItem) {
      console.log(`Inventory item with ID ${id} not found.`);
      return null;
    }

    const newQuantity = (currentItem.quantity || 0) + quantityChange;

    // Update the quantity
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity: newQuantity })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory quantity:", error);
      throw error;
    }

    if (!data) {
      console.log(`Inventory item with ID ${id} not found for quantity update.`);
      return null;
    }

    return {
      id: data.id,
      name: data.name || '',
      sku: data.sku || '',
      category: data.category || '',
      description: data.description || '',
      quantity: data.quantity || 0,
      reorder_point: data.reorder_point || 0,
      unit_price: data.unit_price || 0,
      supplier: data.supplier || '',
      location: data.location || '',
      status: data.status || 'active',
      created_at: data.created_at,
      updated_at: data.updated_at,
      partNumber: data.part_number || '',
      barcode: data.barcode || '',
      subcategory: data.subcategory || '',
      manufacturer: data.manufacturer || '',
      vehicleCompatibility: data.vehicle_compatibility || '',
      onHold: data.on_hold || 0,
      onOrder: data.on_order || 0,
      marginMarkup: data.margin_markup || 0,
      weight: data.weight || 0,
      dimensions: data.dimensions || '',
      warrantyPeriod: data.warranty_period || '',
      dateBought: data.dateBought || '',
      dateLast: data.dateLast || '',
      notes: data.notes || ''
    };
  } catch (error) {
    console.error("Error updating inventory quantity:", error);
    return null;
  }
};

export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }

    return true;
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    return false;
  }
};

export const clearAllInventoryItems = async () => {
  try {
    // First get all inventory items to check if there are any
    const { data: items, error: fetchError } = await supabase
      .from('inventory_items')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    if (!items || items.length === 0) {
      // No items to delete
      return true;
    }
      
    // Delete all inventory items
    const { error: deleteError } = await supabase
      .from('inventory_items')
      .delete()
      .gte('id', '0'); // Use a condition that matches all items
    
    if (deleteError) throw deleteError;
    
    return true;
  } catch (error) {
    console.error("Error clearing inventory:", error);
    throw error;
  }
};
