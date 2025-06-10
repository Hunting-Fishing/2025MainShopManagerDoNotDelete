import { InventoryItemExtended } from "@/types/inventory";
import { supabase } from "@/integrations/supabase/client";
import { getInventoryStatus, needsReorder } from "./statusUtils";

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
    
    // Pricing - using correct property names from type definition
    marginMarkup: dbItem.margin_markup || 0,
    
    // Product Details - only including properties that exist in InventoryItemExtended type
    weight: dbItem.weight || 0,
    dimensions: dbItem.dimensions || '',
    universalPart: dbItem.universal_part || false,
    warrantyPeriod: dbItem.warranty_period || '',
    
    // Additional Info
    dateBought: dbItem.date_bought || '',
    dateLast: dbItem.date_last || '',
    notes: dbItem.notes || ''
  };
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
 * Count items with low stock - now using centralized status logic
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => getInventoryStatus(item) === "low_stock").length;
};

/**
 * Count items that are out of stock - now using centralized status logic
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => getInventoryStatus(item) === "out_of_stock").length;
};

/**
 * Calculate total inventory value
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    return total + (item.unit_price * item.quantity);
  }, 0);
};

// Re-export from status utils for backward compatibility
export { getInventoryStatus, needsReorder } from "./statusUtils";
