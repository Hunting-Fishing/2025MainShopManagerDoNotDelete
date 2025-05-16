
import { InventoryItemExtended, AutoReorderSettings } from '@/types/inventory';

/**
 * Calculate the total value of inventory items
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const quantity = Number(item.quantity) || 0;
    const unitPrice = Number(item.unit_price) || 0;
    return total + (quantity * unitPrice);
  }, 0);
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
 * Format inventory item ensuring all required properties are present
 */
export const formatInventoryItem = (item: Partial<InventoryItemExtended>): InventoryItemExtended => {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || '',
    sku: item.sku || '',
    category: item.category || '',
    description: item.description || '',
    quantity: Number(item.quantity) || 0,
    reorder_point: Number(item.reorder_point) || 10,
    unit_price: Number(item.unit_price) || 0,
    price: Number(item.unit_price) || Number(item.price) || 0, // Map unit_price to price
    supplier: item.supplier || '',
    location: item.location || '',
    status: item.status || 'In Stock',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString(),
    partNumber: item.partNumber || '',
    barcode: item.barcode || '',
    subcategory: item.subcategory || '',
    manufacturer: item.manufacturer || '',
    vehicleCompatibility: item.vehicleCompatibility || '',
    onHold: item.onHold || 0,
    onOrder: item.onOrder || 0,
    cost: item.cost || 0,
    marginMarkup: item.marginMarkup || 0,
    warrantyPeriod: item.warrantyPeriod || '',
    dateBought: item.dateBought || '',
    dateLast: item.dateLast || '',
    notes: item.notes || ''
  };
};

/**
 * Format inventory data for API submission
 */
export const formatInventoryForApi = (item: Partial<InventoryItemExtended>): any => {
  return {
    ...item,
    quantity: Number(item.quantity),
    reorder_point: Number(item.reorder_point),
    unit_price: Number(item.price || item.unit_price),
  };
};

/**
 * Map API response to inventory item
 */
export const mapApiToInventoryItem = (apiItem: any): InventoryItemExtended => {
  return formatInventoryItem({
    ...apiItem,
    unit_price: apiItem.unit_price || 0,
    reorder_point: apiItem.reorder_point || 10
  });
};
