
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Map API response to our InventoryItemExtended type
 */
export function mapApiToInventoryItem(apiItem: any): InventoryItemExtended {
  return {
    id: apiItem.id,
    name: apiItem.name,
    sku: apiItem.sku,
    category: apiItem.category,
    supplier: apiItem.supplier,
    quantity: apiItem.quantity,
    reorder_point: apiItem.reorder_point,
    unit_price: apiItem.unit_price,
    location: apiItem.location,
    status: apiItem.status,
    description: apiItem.description,
    price: apiItem.unit_price || 0, // Ensure price is set from unit_price
    partNumber: apiItem.partNumber,
    barcode: apiItem.barcode,
    subcategory: apiItem.subcategory,
    manufacturer: apiItem.manufacturer,
    vehicleCompatibility: apiItem.vehicleCompatibility,
    onHold: apiItem.onHold,
    onOrder: apiItem.onOrder,
    cost: apiItem.cost,
    marginMarkup: apiItem.marginMarkup,
    warrantyPeriod: apiItem.warrantyPeriod,
    dateBought: apiItem.dateBought,
    dateLast: apiItem.dateLast,
    notes: apiItem.notes
  };
}

/**
 * Get status text based on quantity and reorder_point
 */
export function getInventoryStatus(item: InventoryItemExtended): string {
  if (item.quantity <= 0) {
    return 'Out of Stock';
  } else if (item.quantity <= item.reorder_point) {
    return 'Low Stock';
  } else {
    return 'In Stock';
  }
}

/**
 * Format inventory item for compatibility with the API
 */
export function formatInventoryForApi(item: Partial<InventoryItemExtended>): any {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    supplier: item.supplier,
    quantity: item.quantity,
    reorder_point: item.reorder_point || item.reorderPoint, // Support both property names
    unit_price: item.unit_price || item.unitPrice,          // Support both property names
    location: item.location,
    status: item.status,
    description: item.description
  };
}
