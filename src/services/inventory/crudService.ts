
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from the database
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching inventory items from database...');
    
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error fetching inventory items:", error);
      throw error;
    }

    console.log(`Successfully fetched ${data?.length || 0} inventory items`);
    
    if (!data) return [];
    
    return data.map(item => formatInventoryItem(item));
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
    console.log('Creating inventory item:', item);
    
    const inventoryData = {
      // Basic Information
      name: item.name,
      sku: item.sku,
      description: item.description || '',
      part_number: item.partNumber || '',
      barcode: item.barcode || '',
      category: item.category || '',
      subcategory: item.subcategory || '',
      manufacturer: item.manufacturer || '',
      vehicle_compatibility: item.vehicleCompatibility || '',
      
      // Location and Status
      location: item.location || '',
      status: item.status || 'active',
      supplier: item.supplier || '',
      
      // Inventory Management
      quantity: item.quantity || 0,
      measurement_unit: item.measurementUnit || '',
      on_hold: item.onHold || 0,
      on_order: item.onOrder || 0,
      reorder_point: item.reorder_point || 0,
      min_stock_level: item.minStockLevel || 0,
      max_stock_level: item.maxStockLevel || 0,
      
      // Pricing
      unit_price: item.unit_price || 0,
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
      dimensions: item.dimensions || '',
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
      .select()
      .single();

    if (error) {
      console.error("Error creating inventory item:", error);
      throw error;
    }

    console.log('Successfully created inventory item:', data);
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
    console.log('Updating inventory item:', id, updates);
    
    const inventoryData = {
      // Basic Information
      ...(updates.name !== undefined && { name: updates.name }),
      ...(updates.sku !== undefined && { sku: updates.sku }),
      ...(updates.description !== undefined && { description: updates.description }),
      ...(updates.partNumber !== undefined && { part_number: updates.partNumber }),
      ...(updates.barcode !== undefined && { barcode: updates.barcode }),
      ...(updates.category !== undefined && { category: updates.category }),
      ...(updates.subcategory !== undefined && { subcategory: updates.subcategory }),
      ...(updates.manufacturer !== undefined && { manufacturer: updates.manufacturer }),
      ...(updates.vehicleCompatibility !== undefined && { vehicle_compatibility: updates.vehicleCompatibility }),
      
      // Location and Status
      ...(updates.location !== undefined && { location: updates.location }),
      ...(updates.status !== undefined && { status: updates.status }),
      ...(updates.supplier !== undefined && { supplier: updates.supplier }),
      
      // Inventory Management
      ...(updates.quantity !== undefined && { quantity: updates.quantity }),
      ...(updates.measurementUnit !== undefined && { measurement_unit: updates.measurementUnit }),
      ...(updates.onHold !== undefined && { on_hold: updates.onHold }),
      ...(updates.onOrder !== undefined && { on_order: updates.onOrder }),
      ...(updates.reorder_point !== undefined && { reorder_point: updates.reorder_point }),
      ...(updates.minStockLevel !== undefined && { min_stock_level: updates.minStockLevel }),
      ...(updates.maxStockLevel !== undefined && { max_stock_level: updates.maxStockLevel }),
      
      // Pricing
      ...(updates.unit_price !== undefined && { unit_price: updates.unit_price }),
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

    console.log('Successfully updated inventory item:', data);
    return formatInventoryItem(data);
  } catch (error) {
    console.error("Error in updateInventoryItem:", error);
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
