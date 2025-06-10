
import { supabase } from "@/integrations/supabase/client";
import { InventoryItemExtended } from "@/types/inventory";
import { formatInventoryItem } from "@/utils/inventory/inventoryUtils";

// Get all inventory items
export const getInventoryItems = async (): Promise<InventoryItemExtended[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory')
      .select('*')
      .order('name');

    if (error) throw error;
    
    return (data || []).map(formatInventoryItem);
  } catch (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }
};

// Get inventory item by ID
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

// Create new inventory item
export const createInventoryItem = async (item: Omit<InventoryItemExtended, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItemExtended> => {
  try {
    const dbItem = {
      name: item.name,
      sku: item.sku,
      description: item.description,
      unit_price: item.unit_price,
      category: item.category,
      supplier: item.supplier,
      status: item.status,
      quantity: item.quantity,
      reorder_point: item.reorder_point,
      location: item.location,
      
      // Additional fields
      part_number: item.partNumber,
      barcode: item.barcode,
      subcategory: item.subcategory,
      manufacturer: item.manufacturer,
      vehicle_compatibility: item.vehicleCompatibility,
      
      // Inventory Management
      measurement_unit: item.measurementUnit,
      on_hold: item.onHold,
      on_order: item.onOrder,
      min_stock_level: item.minStockLevel,
      max_stock_level: item.maxStockLevel,
      
      // Pricing
      sell_price_per_unit: item.sell_price_per_unit,
      cost_per_unit: item.cost_per_unit,
      margin_markup: item.marginMarkup,
      
      // Taxes & Fees
      tax_rate: item.taxRate,
      tax_exempt: item.taxExempt,
      environmental_fee: item.environmentalFee,
      core_charge: item.coreCharge,
      hazmat_fee: item.hazmatFee,
      
      // Product Details
      weight: item.weight,
      dimensions: item.dimensions,
      color: item.color,
      material: item.material,
      model_year: item.modelYear,
      oem_part_number: item.oemPartNumber,
      universal_part: item.universalPart,
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

// Update inventory item
export const updateInventoryItem = async (id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> => {
  try {
    const dbUpdates: any = {};
    
    // Map form fields to database fields
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
    if (updates.description !== undefined) dbUpdates.description = updates.description;
    if (updates.unit_price !== undefined) dbUpdates.unit_price = updates.unit_price;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.quantity !== undefined) dbUpdates.quantity = updates.quantity;
    if (updates.reorder_point !== undefined) dbUpdates.reorder_point = updates.reorder_point;
    if (updates.location !== undefined) dbUpdates.location = updates.location;
    
    // Additional fields
    if (updates.partNumber !== undefined) dbUpdates.part_number = updates.partNumber;
    if (updates.barcode !== undefined) dbUpdates.barcode = updates.barcode;
    if (updates.subcategory !== undefined) dbUpdates.subcategory = updates.subcategory;
    if (updates.manufacturer !== undefined) dbUpdates.manufacturer = updates.manufacturer;
    if (updates.vehicleCompatibility !== undefined) dbUpdates.vehicle_compatibility = updates.vehicleCompatibility;
    
    // Inventory Management
    if (updates.measurementUnit !== undefined) dbUpdates.measurement_unit = updates.measurementUnit;
    if (updates.onHold !== undefined) dbUpdates.on_hold = updates.onHold;
    if (updates.onOrder !== undefined) dbUpdates.on_order = updates.onOrder;
    if (updates.minStockLevel !== undefined) dbUpdates.min_stock_level = updates.minStockLevel;
    if (updates.maxStockLevel !== undefined) dbUpdates.max_stock_level = updates.maxStockLevel;
    
    // Pricing
    if (updates.sell_price_per_unit !== undefined) dbUpdates.sell_price_per_unit = updates.sell_price_per_unit;
    if (updates.cost_per_unit !== undefined) dbUpdates.cost_per_unit = updates.cost_per_unit;
    if (updates.marginMarkup !== undefined) dbUpdates.margin_markup = updates.marginMarkup;
    
    // Taxes & Fees
    if (updates.taxRate !== undefined) dbUpdates.tax_rate = updates.taxRate;
    if (updates.taxExempt !== undefined) dbUpdates.tax_exempt = updates.taxExempt;
    if (updates.environmentalFee !== undefined) dbUpdates.environmental_fee = updates.environmentalFee;
    if (updates.coreCharge !== undefined) dbUpdates.core_charge = updates.coreCharge;
    if (updates.hazmatFee !== undefined) dbUpdates.hazmat_fee = updates.hazmatFee;
    
    // Product Details
    if (updates.weight !== undefined) dbUpdates.weight = updates.weight;
    if (updates.dimensions !== undefined) dbUpdates.dimensions = updates.dimensions;
    if (updates.color !== undefined) dbUpdates.color = updates.color;
    if (updates.material !== undefined) dbUpdates.material = updates.material;
    if (updates.modelYear !== undefined) dbUpdates.model_year = updates.modelYear;
    if (updates.oemPartNumber !== undefined) dbUpdates.oem_part_number = updates.oemPartNumber;
    if (updates.universalPart !== undefined) dbUpdates.universal_part = updates.universalPart;
    if (updates.warrantyPeriod !== undefined) dbUpdates.warranty_period = updates.warrantyPeriod;
    
    // Additional Info
    if (updates.dateBought !== undefined) dbUpdates.date_bought = updates.dateBought;
    if (updates.dateLast !== undefined) dbUpdates.date_last = updates.dateLast;
    if (updates.notes !== undefined) dbUpdates.notes = updates.notes;

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

// Update inventory quantity
export const updateInventoryQuantity = async (id: string, quantity: number): Promise<InventoryItemExtended> => {
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
