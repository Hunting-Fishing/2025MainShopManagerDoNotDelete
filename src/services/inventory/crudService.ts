
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

/**
 * Get all inventory items from the database - NO SAMPLE DATA
 */
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    console.log('Fetching real inventory items from Supabase...');
    
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .order('name');
      
    if (error) {
      console.error('Supabase error:', error);
      throw error;
    }
    
    console.log(`Retrieved ${data?.length || 0} real items from database`);
    
    // Only return real data from database, no fallback to sample data
    if (!data || data.length === 0) {
      console.log('No real inventory items found in database');
      return [];
    }
    
    return data.map(item => formatInventoryItem(item));
  } catch (error) {
    console.error('Error fetching real inventory items:', error);
    return []; // Return empty array instead of sample data
  }
};

/**
 * Get inventory item by ID - NO SAMPLE DATA
 */
export const getInventoryItemById = async (id: string): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .select('*')
      .eq('id', id)
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error fetching inventory item:', error);
    return null;
  }
};

/**
 * Create a new inventory item with ALL form fields
 */
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .insert({
        // Basic Info
        name: item.name,
        sku: item.sku,
        barcode: item.barcode,
        part_number: item.partNumber,
        category: item.category,
        subcategory: item.subcategory,
        status: item.status,
        manufacturer: item.manufacturer,
        supplier: item.supplier,
        description: item.description,
        vehicle_compatibility: item.vehicleCompatibility,
        
        // Inventory Management
        quantity: item.quantity || 0,
        reorder_point: item.reorder_point || 0,
        measurement_unit: item.measurementUnit,
        location: item.location,
        on_hold: item.onHold || 0,
        on_order: item.onOrder || 0,
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
      })
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error creating inventory item:', error);
    return null;
  }
};

/**
 * Update an inventory item with ALL form fields
 */
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended | null> => {
  try {
    const updateData: any = {};
    
    // Map all possible form fields to database columns
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.sku !== undefined) updateData.sku = updates.sku;
    if (updates.barcode !== undefined) updateData.barcode = updates.barcode;
    if (updates.partNumber !== undefined) updateData.part_number = updates.partNumber;
    if (updates.category !== undefined) updateData.category = updates.category;
    if (updates.subcategory !== undefined) updateData.subcategory = updates.subcategory;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.manufacturer !== undefined) updateData.manufacturer = updates.manufacturer;
    if (updates.supplier !== undefined) updateData.supplier = updates.supplier;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.vehicleCompatibility !== undefined) updateData.vehicle_compatibility = updates.vehicleCompatibility;
    
    // Inventory Management
    if (updates.quantity !== undefined) updateData.quantity = updates.quantity;
    if (updates.reorder_point !== undefined) updateData.reorder_point = updates.reorder_point;
    if (updates.measurementUnit !== undefined) updateData.measurement_unit = updates.measurementUnit;
    if (updates.location !== undefined) updateData.location = updates.location;
    if (updates.onHold !== undefined) updateData.on_hold = updates.onHold;
    if (updates.onOrder !== undefined) updateData.on_order = updates.onOrder;
    if (updates.minStockLevel !== undefined) updateData.min_stock_level = updates.minStockLevel;
    if (updates.maxStockLevel !== undefined) updateData.max_stock_level = updates.maxStockLevel;
    
    // Pricing
    if (updates.unit_price !== undefined) updateData.unit_price = updates.unit_price;
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
    if (updates.dimensions !== undefined) updateData.dimensions = updates.dimensions;
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
      .from('inventory_items')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error updating inventory item:', error);
    return null;
  }
};

/**
 * Update inventory item quantity only
 */
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended | null> => {
  try {
    const { data, error } = await supabase
      .from('inventory_items')
      .update({ quantity })
      .eq('id', id)
      .select()
      .single();
      
    if (error) throw error;
    
    return data ? formatInventoryItem(data) : null;
  } catch (error) {
    console.error('Error updating inventory quantity:', error);
    return null;
  }
};

export const deleteInventoryItem = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .eq('id', id);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error deleting inventory item:', error);
    return false;
  }
};

export const clearAllInventoryItems = async (): Promise<boolean> => {
  try {
    console.log('Clearing all inventory items from database...');
    
    const { error } = await supabase
      .from('inventory_items')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000'); // Matches all UUIDs
    
    if (error) {
      console.error('Error clearing inventory:', error);
      throw error;
    }
    
    console.log('All inventory items cleared from database');
    return true;
  } catch (error) {
    console.error('Failed to clear inventory:', error);
    return false;
  }
};
