
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching real inventory items from database...');
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log('No real inventory items found in database');
      return [];
    }

    console.log(`Fetched ${data.length} real inventory items from database`);
    return data.map(formatInventoryItem);
  } catch (error) {
    console.error("Error in getInventoryItems:", error);
    throw error;
  }
};

/**
 * Create a new inventory item in database
 */
export const createInventoryItem = async (item: Omit<InventoryItemExtended, "id" | "created_at" | "updated_at">): Promise<InventoryItemExtended> => {
  try {
    console.log('Creating real inventory item in database:', item.name);
    
    const inventoryData = {
      name: item.name,
      sku: item.sku,
      description: item.description,
      part_number: item.partNumber,
      barcode: item.barcode,
      category: item.category,
      subcategory: item.subcategory,
      manufacturer: item.manufacturer,
      vehicle_compatibility: item.vehicleCompatibility,
      location: item.location,
      status: item.status || 'active',
      supplier: item.supplier,
      quantity: item.quantity || 0,
      measurement_unit: item.measurementUnit,
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
      dimensions: item.dimensions,
      color: item.color,
      material: item.material,
      model_year: item.modelYear,
      oem_part_number: item.oemPartNumber,
      universal_part: item.universalPart || false,
      warranty_period: item.warrantyPeriod,
      date_bought: item.dateBought,
      date_last: item.dateLast,
      notes: item.notes
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([inventoryData])
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }

    console.log('Successfully created real inventory item in database:', data.id);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in createInventoryItem:", error);
    throw error;
  }
};

/**
 * Update an existing inventory item in database
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    console.log('Updating real inventory item in database:', id);
    
    const inventoryData = {
      ...(updates.name && { name: updates.name }),
      ...(updates.sku && { sku: updates.sku }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.partNumber !== undefined && { part_number: updates.partNumber }),
      ...(updates.barcode !== undefined && { barcode: updates.barcode }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.subcategory !== undefined && { subcategory: updates.subcategory }),
      ...(updates.manufacturer !== undefined && { manufacturer: updates.manufacturer }),
      ...(updates.vehicleCompatibility !== undefined && { vehicle_compatibility: updates.vehicleCompatibility }),
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.supplier !== undefined && { supplier: updates.supplier }),
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.measurementUnit !== undefined && { measurement_unit: updates.measurementUnit }),
      ...(updates.onHold !== undefined && { on_hold: updates.onHold }),
      ...(updates.onOrder !== undefined && { on_order: updates.onOrder }),
      ...(updates.reorder_point !== undefined && { reorder_point: updates.reorder_point }),
      ...(updates.minStockLevel !== undefined && { min_stock_level: updates.minStockLevel }),
      ...(updates.maxStockLevel !== undefined && { max_stock_level: updates.maxStockLevel }),
      ...(updates.unit_price !== undefined && { unit_price: updates.unit_price }),
      ...(updates.sell_price_per_unit !== undefined && { sell_price_per_unit: updates.sell_price_per_unit }),
      ...(updates.cost_per_unit !== undefined && { cost_per_unit: updates.cost_per_unit }),
      ...(updates.marginMarkup !== undefined && { margin_markup: updates.marginMarkup }),
      ...(updates.taxRate !== undefined && { tax_rate: updates.taxRate }),
      ...(updates.taxExempt !== undefined && { tax_exempt: updates.taxExempt }),
      ...(updates.environmentalFee !== undefined && { environmental_fee: updates.environmentalFee }),
      ...(updates.coreCharge !== undefined && { core_charge: updates.coreCharge }),
      ...(updates.hazmatFee !== undefined && { hazmat_fee: updates.hazmatFee }),
      ...(updates.weight !== undefined && { weight: updates.weight }),
      ...(updates.dimensions !== undefined && { dimensions: updates.dimensions }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.material !== undefined && { material: updates.material }),
      ...(updates.modelYear !== undefined && { model_year: updates.modelYear }),
      ...(updates.oemPartNumber !== undefined && { oem_part_number: updates.oemPartNumber }),
      ...(updates.universalPart !== undefined && { universal_part: updates.universalPart }),
      ...(updates.warrantyPeriod !== undefined && { warranty_period: updates.warrantyPeriod }),
      ...(updates.dateBought !== undefined && { date_bought: updates.dateBought }),
      ...(updates.dateLast !== undefined && { date_last: updates.dateLast }),
      ...(updates.notes !== undefined && { notes: updates.notes })
    };

    const { data, error } = await supabase
      .from('inventory')
      .update(inventoryData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error("Error updating inventory item:", error);
      throw error;
    }

    console.log('Successfully updated real inventory item in database:', id);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
    throw error;
  }
};

/**
 * Get inventory item by ID from database
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    console.log('Fetching real inventory item by ID from database:', id);
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        console.log('Real inventory item not found in database:', id);
        return null;
      }
      console.error("Error fetching inventory item by ID:", error);
      throw error;
    }

    console.log('Successfully fetched real inventory item from database:', id);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in getInventoryItemById:", error);
    throw error;
  }
};

/**
 * Delete an inventory item from database
 */
export const deleteInventoryItem = async (id: string): Promise<void> => {
  try {
    console.log('Deleting real inventory item from database:', id);
    const { error } = await supabase
      .from('inventory')
      .delete()
      .eq('id', id);

    if (error) {
      console.error("Error deleting inventory item:", error);
      throw error;
    }

    console.log('Successfully deleted real inventory item from database:', id);
  } catch (error) {
    console.error("Error in deleteInventoryItem:", error);
    throw error;
  }
};

/**
 * Update inventory quantity in database
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<void> => {
  try {
    console.log('Updating real inventory quantity in database:', id, quantity);
    const { error } = await supabase
      .from('inventory')
      .update({ quantity })
      .eq('id', id);

    if (error) {
      console.error("Error updating inventory quantity:", error);
      throw error;
    }

    console.log('Successfully updated real inventory quantity in database:', id);
  } catch (error) {
    console.error("Error in updateInventoryQuantity:", error);
    throw error;
  }
};

/**
 * Clear all inventory items from database
 */
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    console.log('Clearing all real inventory items from database...');
    const { error } = await supabase
      .from('inventory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items

    if (error) {
      console.error("Error clearing inventory items:", error);
      throw error;
    }

    console.log('Successfully cleared all real inventory items from database');
  } catch (error) {
    console.error("Error in clearAllInventoryItems:", error);
    throw error;
  }
};
