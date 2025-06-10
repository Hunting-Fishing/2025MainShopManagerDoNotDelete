
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    console.log(`Fetched ${data?.length || 0} inventory items from database`);
    return data ? data.map(formatInventoryItem) : [];
  } catch (error) {
    console.error("Error fetching inventory items:", error);
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
  item: Omit<InventoryItemExtended, "id" | "created_at" | "updated_at">
): Promise<InventoryItemExtended> => {
  try {
    const inventoryData = {
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      supplier: item.supplier || '',
      location: item.location || '',
      status: item.status || 'active',
      quantity: item.quantity || 0,
      unit_price: item.unit_price || 0,
      reorder_point: item.reorder_point || 0,
      
      // Additional fields
      part_number: item.partNumber || '',
      barcode: item.barcode || '',
      manufacturer: item.manufacturer || '',
      vehicle_compatibility: item.vehicleCompatibility || '',
      
      // Inventory Management
      measurement_unit: item.measurementUnit || '',
      on_hold: item.onHold || 0,
      on_order: item.onOrder || 0,
      min_stock_level: item.minStockLevel || 0,
      max_stock_level: item.maxStockLevel || 0,
      
      // Pricing
      sell_price_per_unit: item.sell_price_per_unit || 0,
      cost_per_unit: item.cost_per_unit || 0,
      margin_markup: item.marginMarkup || 0,
      
      // Taxes & Fees
      tax_rate: item.taxRate || 0,
      tax_exempt: item.taxExempt || false,
      environmental_fee: item.environmentalFee || 0,
      core_charge: item.coreCharge || 0,
      hazmat_fee: item.hazmatFee || 0,
      
      // Product Details
      weight: item.weight || 0,
      color: item.color || '',
      material: item.material || '',
      model_year: item.modelYear || '',
      oem_part_number: item.oemPartNumber || '',
      universal_part: item.universalPart || false,
      warranty_period: item.warrantyPeriod || '',
      
      // Additional Info
      date_bought: item.dateBought || '',
      date_last: item.dateLast || '',
      notes: item.notes || ''
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([inventoryData])
      .select('*')
      .single();

    if (error) throw error;

    console.log('Successfully created inventory item:', data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error creating inventory item:", error);
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
    const updateData: any = {};
    
    // Map frontend fields to database fields
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.sku !== undefined) updateData.sku = updates.sku;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.unit_price !== undefined) updateData.unit_price = updates.unit_price;
    if (updates.reorder_point !== undefined) updateData.reorder_point = updates.reorder_point;
    
    // Additional fields
    if (updates.partNumber !== undefined) updateData.part_number = updates.partNumber;
    if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
    if (updates.manufacturer !== undefined) updateData.manufacturer = updates.manufacturer;
    if (updates.vehicleCompatibility !== undefined) updateData.vehicle_compatibility = updates.vehicleCompatibility;
    
    // Inventory Management
    if (updates.measurementUnit !== undefined) updateData.measurement_unit = updates.measurementUnit;
    if (updates.onHold !== undefined) updateData.on_hold = updates.onHold;
    if (updates.onOrder !== undefined) updateData.on_order = updates.onOrder;
    if (updates.minStockLevel !== undefined) updateData.min_stock_level = updates.minStockLevel;
    if (updates.maxStockLevel !== undefined) updateData.max_stock_level = updates.maxStockLevel;
    
    // Pricing
    if (updates.sell_price_per_unit !== undefined) updateData.sell_price_per_unit = updates.sell_price_per_unit;
    if (updates.cost_per_unit !== undefined) updateData.cost_per_unit = updates.cost_per_unit;
    if (updates.marginMarkup !== undefined) updateData.margin_markup = updates.marginMarkup;
    
    // Taxes & Fees
    if (updates.taxRate !== undefined) updateData.tax_rate = updates.taxRate;
    if (updates.taxExempt !== undefined) updateData.tax_exempt = updates.taxExempt;
    if (updates.environmentalFee !== undefined) updateData.environmental_fee = updates.environmentalFee;
    if (updates.coreCharge !== undefined) updateData.core_charge = updates.coreCharge;
    if (updates.hazmatFee !== undefined) updateData.hazmat_fee = updates.hazmatFee;
    
    // Product Details
    if (updates.weight !== undefined) updateData.weight = updates.weight;
    if (updates.color !== undefined) updateData.color = updates.color;
    if (updates.material !== undefined) updateData.material = updates.material;
    if (updates.modelYear !== undefined) updateData.model_year = updates.modelYear;
    if (updates.oemPartNumber !== undefined) updateData.oem_part_number = updates.oemPartNumber;
    if (updates.universalPart !== undefined) updateData.universal_part = updates.universalPart;
    if (updates.warrantyPeriod !== undefined) updateData.warranty_period = updates.warrantyPeriod;
    
    // Additional Info
    if (updates.dateBought !== undefined) updateData.date_bought = updates.dateBought;
    if (updates.dateLast !== undefined) updateData.date_last = updates.dateLast;
    if (updates.notes !== undefined) updateData.notes = updates.notes;

    const { data, error } = await supabase
      .from('inventory')
      .update(updateData)
      .eq('id', id)
      .select('*')
      .single();

    if (error) throw error;

    console.log('Successfully updated inventory item:', data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error updating inventory item:", error);
    throw error;
  }
};

/**
 * Update inventory quantity
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
      .select('*')
      .single();

    if (error) throw error;

    console.log('Successfully updated inventory quantity:', data);
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

    console.log('Successfully deleted inventory item with id:', id);
  } catch (error) {
    console.error("Error deleting inventory item:", error);
    throw error;
  }
};

/**
 * Clear all inventory items from the database
 */
export const clearAllInventoryItems = async (): Promise<void> => {
  try {
    console.log('Clearing all inventory items from database...');
    
    const { error } = await supabase
      .from('inventory')
      .delete()
      .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all items
    
    if (error) throw error;
    
    console.log('Successfully cleared all inventory items from database');
  } catch (error) {
    console.error("Error clearing inventory items:", error);
    throw error;
  }
};
