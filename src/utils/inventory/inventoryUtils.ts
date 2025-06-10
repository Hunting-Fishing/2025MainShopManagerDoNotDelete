import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";

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
 * Format inventory item from database to application format
 */
export const formatInventoryItem = (dbItem: any): InventoryItemExtended => {
  return {
    id: dbItem.id,
    name: dbItem.name || '',
    sku: dbItem.sku || '',
    description: dbItem.description || '',
    price: dbItem.unit_price || 0, // Legacy field
    unit_price: dbItem.unit_price || 0,
    category: dbItem.category || '',
    supplier: dbItem.supplier || '',
    status: dbItem.status || 'active',
    quantity: dbItem.quantity || 0,
    reorder_point: dbItem.reorder_point || 0,
    location: dbItem.location || '',
    created_at: dbItem.created_at,
    updated_at: dbItem.updated_at,
    
    // Extended fields from all form sections
    partNumber: dbItem.part_number || '',
    barcode: dbItem.barcode || '',
    subcategory: dbItem.subcategory || '',
    manufacturer: dbItem.manufacturer || '',
    vehicleCompatibility: dbItem.vehicle_compatibility || '',
    
    // Inventory Management
    onHold: dbItem.on_hold || 0,
    onOrder: dbItem.on_order || 0,
    
    // Pricing
    sell_price_per_unit: dbItem.sell_price_per_unit || 0,
    cost_per_unit: dbItem.cost_per_unit || 0,
    marginMarkup: dbItem.margin_markup || 0,
    
    // Taxes & Fees
    taxRate: dbItem.tax_rate || 0,
    taxExempt: dbItem.tax_exempt || false,
    environmentalFee: dbItem.environmental_fee || 0,
    coreCharge: dbItem.core_charge || 0,
    hazmatFee: dbItem.hazmat_fee || 0,
    
    // Product Details
    weight: dbItem.weight || 0,
    dimensions: dbItem.dimensions || '',
    color: dbItem.color || '',
    material: dbItem.material || '',
    modelYear: dbItem.model_year || '',
    oemPartNumber: dbItem.oem_part_number || '',
    universalPart: dbItem.universal_part || false,
    warrantyPeriod: dbItem.warranty_period || '',
    
    // Additional Info
    dateBought: dbItem.date_bought || '',
    dateLast: dbItem.date_last || '',
    notes: dbItem.notes || ''
  };
};

/**
 * Get inventory status based on quantity and reorder point
 */
export const getInventoryStatus = (item: Partial<InventoryItemExtended>): string => {
  const quantity = Number(item.quantity) || 0;
  const reorderPoint = Number(item.reorder_point) || 0;
  
  if (quantity <= 0) {
    return "out_of_stock";
  } else if (quantity <= reorderPoint) {
    return "low_stock";
  } else {
    return "in_stock";
  }
};

/**
 * Format inventory item for API submission
 */
export const formatInventoryForApi = (item: Partial<InventoryItemExtended>) => {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    supplier: item.supplier,
    location: item.location,
    status: item.status,
    description: item.description,
    quantity: item.quantity,
    reorder_point: item.reorder_point,
    unit_price: item.unit_price
  };
};

/**
 * Map API response to inventory item format
 */
export const mapApiToInventoryItem = (apiItem: any): InventoryItemExtended => {
  return formatInventoryItem(apiItem);
};

/**
 * Count items with low stock
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => 
    item.quantity > 0 && item.quantity <= item.reorder_point
  ).length;
};

/**
 * Count items that are out of stock
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => item.quantity <= 0).length;
};

/**
 * Calculate total inventory value
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    return total + (item.unit_price * item.quantity);
  }, 0);
};
