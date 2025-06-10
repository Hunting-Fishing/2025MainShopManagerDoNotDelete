
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    return data?.map(formatInventoryItem) || [];
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
  item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>
): Promise<InventoryItemExtended> => {
  try {
    // Map form fields to database columns
    const dbItem = {
      name: item.name,
      sku: item.sku,
      description: item.description,
      unit_price: item.unit_price || 0,
      category: item.category,
      subcategory: item.subcategory,
      supplier: item.supplier,
      status: item.status,
      quantity: item.quantity || 0,
      reorder_point: item.reorder_point || 0,
      location: item.location,
      
      // Basic Info fields
      part_number: item.partNumber,
      barcode: item.barcode,
      manufacturer: item.manufacturer,
      vehicle_compatibility: item.vehicleCompatibility,
      
      // Inventory Management
      measurement_unit: item.measurementUnit,
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
      dimensions: item.dimensions,
      color: item.color,
      material: item.material,
      model_year: item.modelYear,
      oem_part_number: item.oemPartNumber,
      universal_part: item.universalPart || false,
      warranty_period: item.warrantyPeriod,
      
      // Additional Info
      date_bought: item.dateBought,
      date_last: item.dateLast,
      notes: item.notes
    };

    const { data, error } = await supabase
      .from('inventory')
      .insert([dbItem])
      .select()
      .single();

    if (error) throw error;

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
    // Map form fields to database columns, ensuring category, subcategory, and status are properly mapped
    const dbUpdates = {
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.sku !== undefined && { sku: updates.sku }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.unit_price !== undefined && { unit_price: updates.unit_price }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.subcategory !== undefined && { subcategory: updates.subcategory }),
      ...(updates.supplier !== undefined && { supplier: updates.supplier }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.reorder_point !== undefined && { reorder_point: updates.reorder_point }),
      ...(updates.location !== undefined && { location: updates.location }),
      
      // Basic Info fields
      ...(updates.partNumber !== undefined && { part_number: updates.partNumber }),
      ...(updates.barcode !== undefined && { barcode: updates.barcode }),
      ...(updates.manufacturer !== undefined && { manufacturer: updates.manufacturer }),
      ...(updates.vehicleCompatibility !== undefined && { vehicle_compatibility: updates.vehicleCompatibility }),
      
      // Inventory Management
      ...(updates.measurementUnit !== undefined && { measurement_unit: updates.measurementUnit }),
      ...(updates.onHold !== undefined && { on_hold: updates.onHold }),
      ...(updates.onOrder !== undefined && { on_order: updates.onOrder }),
      ...(updates.minStockLevel !== undefined && { min_stock_level: updates.minStockLevel }),
      ...(updates.maxStockLevel !== undefined && { max_stock_level: updates.maxStockLevel }),
      
      // Pricing
      ...(updates.sell_price_per_unit !== undefined && { sell_price_per_unit: updates.sell_price_per_unit }),
      ...(updates.cost_per_unit !== undefined && { cost_per_unit: updates.cost_per_unit }),
      ...(updates.marginMarkup !== undefined && { margin_markup: updates.marginMarkup }),
      
      // Taxes & Fees
      ...(updates.taxRate !== undefined && { tax_rate: updates.taxRate }),
      ...(updates.taxExempt !== undefined && { tax_exempt: updates.taxExempt }),
      ...(updates.environmentalFee !== undefined && { environmental_fee: updates.environmentalFee }),
      ...(updates.coreCharge !== undefined && { core_charge: updates.coreCharge }),
      ...(updates.hazmatFee !== undefined && { hazmat_fee: updates.hazmatFee }),
      
      // Product Details
      ...(updates.weight !== undefined && { weight: updates.weight }),
      ...(updates.dimensions !== undefined && { dimensions: updates.dimensions }),
      ...(updates.color !== undefined && { color: updates.color }),
      ...(updates.material !== undefined && { material: updates.material }),
      ...(updates.modelYear !== undefined && { model_year: updates.modelYear }),
      ...(updates.oemPartNumber !== undefined && { oem_part_number: updates.oemPartNumber }),
      ...(updates.universalPart !== undefined && { universal_part: updates.universalPart }),
      ...(updates.warrantyPeriod !== undefined && { warranty_period: updates.warrantyPeriod }),
      
      // Additional Info
      ...(updates.dateBought !== undefined && { date_bought: updates.dateBought }),
      ...(updates.dateLast !== undefined && { date_last: updates.dateLast }),
      ...(updates.notes !== undefined && { notes: updates.notes })
    };

    console.log("Updating inventory item with:", { id, dbUpdates });

    const { data, error } = await supabase
      .from('inventory')
      .update(dbUpdates)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

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
): Promise<void> => {
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
