
import { supabase } from '@/integrations/supabase/client';
import { InventoryItemExtended } from '@/types/inventory';
import { formatInventoryItem } from '@/utils/inventory/inventoryUtils';

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log("Fetching inventory items from database...");
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} inventory items`);
    
    if (!data || data.length === 0) {
      return [];
    }

    return data.map(formatInventoryItem);
  } catch (error) {
    console.error("Error in getInventoryItems:", error);
    throw error;
  }
};

/**
 * Get inventory item by ID
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    if (!data) return null;

    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error fetching inventory item by ID:", error);
    throw error;
  }
};

/**
 * Create a new inventory item
 */
export const createInventoryItem = async (
  item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItemExtended> => {
  try {
    console.log("Creating inventory item:", item);

    const dbItem = {
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      part_number: item.partNumber || '',
      barcode: item.barcode || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      vehicle_compatibility: item.vehicleCompatibility || '',
      location: item.location || '',
      status: item.status || 'active',
      supplier: item.supplier || '',
      quantity: item.quantity || 0,
      measurement_unit: item.measurementUnit || '',
      on_hold: item.onHold || 0,
      on_order: item.onOrder || 0,
      reorder_point: item.reorder_point || 0,
      min_stock_level: item.minStockLevel || 0,
      max_stock_level: item.maxStockLevel || 0,
      unit_price: item.unit_price || 0,
      sell_price_per_unit: item.sell_price_per_unit || 0,
      cost_per_unit: item.cost_per_unit || 0,
      margin_markup: item.marginMarkup || 0,
      tax_rate: item.taxRate || 0,
      tax_exempt: item.taxExempt || false,
      environmental_fee: item.environmentalFee || 0,
      core_charge: item.coreCharge || 0,
      hazmat_fee: item.hazmatFee || 0,
      weight: item.weight || 0,
      dimensions: item.dimensions || '',
      color: item.color || '',
      material: item.material || '',
      model_year: item.modelYear || '',
      oem_part_number: item.oemPartNumber || '',
      universal_part: item.universalPart || false,
      warranty_period: item.warrantyPeriod || '',
      date_bought: item.dateBought || '',
      date_last: item.dateLast || '',
      notes: item.notes || ''
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([dbItem])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }

    console.log("Created inventory item:", data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in createInventoryItem:", error);
    throw error;
  }
};

/**
 * Update an existing inventory item
 */
export const updateInventoryItem = async (
  id: string,
  updates: Partial<InventoryItemExtended>
): Promise<InventoryItemExtended> => {
  try {
    console.log("Updating inventory item:", { id, updates });

    const dbUpdates = {
      name: updates.name,
      sku: updates.sku,
      description: updates.description,
      part_number: updates.partNumber,
      barcode: updates.barcode,
      category: updates.category,
      subcategory: updates.subcategory,
      manufacturer: updates.manufacturer,
      vehicle_compatibility: updates.vehicleCompatibility,
      location: updates.location,
      status: updates.status,
      supplier: updates.supplier,
      quantity: updates.quantity,
      measurement_unit: updates.measurementUnit,
      on_hold: updates.onHold,
      on_order: updates.onOrder,
      reorder_point: updates.reorder_point,
      min_stock_level: updates.minStockLevel,
      max_stock_level: updates.maxStockLevel,
      unit_price: updates.unit_price,
      sell_price_per_unit: updates.sell_price_per_unit,
      cost_per_unit: updates.cost_per_unit,
      margin_markup: updates.marginMarkup,
      tax_rate: updates.taxRate,
      tax_exempt: updates.taxExempt,
      environmental_fee: updates.environmentalFee,
      core_charge: updates.coreCharge,
      hazmat_fee: updates.hazmatFee,
      weight: updates.weight,
      dimensions: updates.dimensions,
      color: updates.color,
      material: updates.material,
      model_year: updates.modelYear,
      oem_part_number: updates.oemPartNumber,
      universal_part: updates.universalPart,
      warranty_period: updates.warrantyPeriod,
      date_bought: updates.dateBought,
      date_last: updates.dateLast,
      notes: updates.notes
    };

    // Remove undefined values
    const cleanUpdates = Object.fromEntries(
      Object.entries(dbUpdates).filter(([_, value]) => value !== undefined)
    );

    const { data, error } = await supabase
      .from('inventory')
      .update(cleanUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }

    console.log("Updated inventory item:", data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
    throw error;
  }
};

/**
 * Update inventory item quantity
 */
export const updateInventoryQuantity = async (
  id: string,
  quantity: number
): Promise<InventoryItemExtended> => {
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
    console.error("Error updating inventory quantity:", error);
    throw error;
  }
};

/**
 * Delete an inventory item
 */
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

/**
 * Clear all inventory items
 */
export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    // First get all inventory items to check if there are any
    const { data: items, error: fetchError } = await supabase
      .from('inventory')
      .select('id');
      
    if (fetchError) throw fetchError;
    
    if (!items || items.length === 0) {
      // No items to delete
      return true;
    }
      
    // Delete all inventory items
    const { error: deleteError } = await supabase
      .from('inventory')
      .delete()
      .gte('id', '0'); // Use a condition that matches all items
    
    if (deleteError) throw deleteError;
    
    return true;
  } catch (error) {
    console.error("Error clearing inventory:", error);
    throw error;
  }
};
