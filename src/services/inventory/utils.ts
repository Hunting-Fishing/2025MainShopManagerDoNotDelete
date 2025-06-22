
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Get inventory status based on quantity and reorder point
 */
export const getInventoryStatus = (item: InventoryItemExtended): string => {
  const quantity = Number(item.quantity) || 0;
  const reorderPoint = Number(item.reorder_point) || 0;

  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
};

/**
 * Count low stock items in inventory
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => {
    const quantity = Number(item.quantity) || 0;
    const reorderPoint = Number(item.reorder_point) || 0;
    return quantity > 0 && quantity <= reorderPoint;
  }).length;
};

/**
 * Count out of stock items in inventory
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => {
    const quantity = Number(item.quantity) || 0;
    return quantity <= 0;
  }).length;
};

/**
 * Calculate total inventory value
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
};

/**
 * Format inventory item from database to application format
 */
export const formatInventoryItem = (dbItem: any): InventoryItemExtended => {
  console.log('Formatting database item:', dbItem);
  
  // Extract and convert values with proper fallbacks
  const quantity = Number(dbItem.quantity) || 0;
  const reorderPoint = Number(dbItem.reorder_point) || 0;
  const unitPrice = Number(dbItem.unit_price) || 0;
  
  // Normalize status - convert "In Stock" to "active" for consistency
  let normalizedStatus = dbItem.status || 'active';
  if (normalizedStatus === 'In Stock') {
    normalizedStatus = 'active';
  }
  
  const formatted: InventoryItemExtended = {
    id: dbItem.id || crypto.randomUUID(),
    name: dbItem.name || '',
    sku: dbItem.sku || '',
    category: dbItem.category || '',
    description: dbItem.description || '',
    quantity: quantity,
    reorder_point: reorderPoint,
    unit_price: unitPrice,
    price: unitPrice, // Legacy field compatibility
    supplier: dbItem.supplier || '',
    location: dbItem.location || '',
    status: normalizedStatus,
    created_at: dbItem.created_at || new Date().toISOString(),
    updated_at: dbItem.updated_at || new Date().toISOString(),
    
    // Extended fields with proper defaults
    partNumber: dbItem.part_number || '',
    barcode: dbItem.barcode || '',
    subcategory: dbItem.subcategory || '',
    manufacturer: dbItem.manufacturer || '',
    vehicleCompatibility: dbItem.vehicle_compatibility || '',
    
    // Inventory Management
    measurementUnit: dbItem.measurement_unit || '',
    onHold: Number(dbItem.on_hold) || 0,
    onOrder: Number(dbItem.on_order) || 0,
    minStockLevel: Number(dbItem.min_stock_level) || 0,
    maxStockLevel: Number(dbItem.max_stock_level) || 0,
    
    // Pricing
    sellPricePerUnit: Number(dbItem.sell_price_per_unit) || unitPrice,
    sell_price_per_unit: Number(dbItem.sell_price_per_unit) || unitPrice,
    costPerUnit: Number(dbItem.cost_per_unit) || 0,
    cost_per_unit: Number(dbItem.cost_per_unit) || 0,
    marginMarkup: Number(dbItem.margin_markup) || 0,
    
    // Taxes & Fees
    taxRate: Number(dbItem.tax_rate) || 0,
    taxExempt: Boolean(dbItem.tax_exempt) || false,
    environmentalFee: Number(dbItem.environmental_fee) || 0,
    coreCharge: Number(dbItem.core_charge) || 0,
    hazmatFee: Number(dbItem.hazmat_fee) || 0,
    
    // Product Details
    weight: Number(dbItem.weight) || 0,
    dimensions: dbItem.dimensions || '',
    color: dbItem.color || '',
    material: dbItem.material || '',
    modelYear: dbItem.model_year || '',
    oemPartNumber: dbItem.oem_part_number || '',
    universalPart: Boolean(dbItem.universal_part) || false,
    warrantyPeriod: dbItem.warranty_period || '',
    
    // Additional Info
    dateBought: dbItem.date_bought || '',
    dateLast: dbItem.date_last || '',
    notes: dbItem.notes || '',
    
    // Legacy fields for backward compatibility
    cost: Number(dbItem.cost_per_unit) || 0
  };
  
  console.log('Formatted inventory item:', formatted);
  return formatted;
};

/**
 * Format inventory item for API submission
 */
export const formatInventoryForApi = (item: Partial<InventoryItemExtended>): any => {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    description: item.description,
    quantity: Number(item.quantity) || 0,
    reorder_point: Number(item.reorder_point) || 0,
    unit_price: Number(item.unit_price || item.price) || 0,
    supplier: item.supplier,
    location: item.location,
    status: item.status || 'active'
  };
};

/**
 * Map database item to inventory item
 */
export const mapApiToInventoryItem = (apiItem: any): InventoryItemExtended => {
  return formatInventoryItem(apiItem);
};
