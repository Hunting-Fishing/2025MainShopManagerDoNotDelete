
import { InventoryItemExtended, InventoryStatus } from "@/types/inventory";

/**
 * Calculate inventory value based on quantity and unit price
 */
export const calculateInventoryValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    return total + (item.quantity * item.unit_price);
  }, 0);
};

/**
 * Count low stock items (where quantity is <= reorder_point)
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_point).length;
};

/**
 * Count out of stock items (where quantity is 0)
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => item.quantity === 0).length;
};

/**
 * Format inventory item for API submission
 */
export const formatInventoryItemForSubmission = (item: Partial<InventoryItemExtended>): any => {
  return {
    name: item.name,
    sku: item.sku,
    description: item.description,
    quantity: item.quantity,
    reorder_point: item.reorder_point,
    unit_price: item.unit_price,
    category: item.category,
    supplier: item.supplier,
    location: item.location,
    status: item.status || "In Stock",
  };
};

/**
 * Get inventory status based on quantity and reorder point
 */
export const getInventoryStatus = (item: InventoryItemExtended): string => {
  if (item.quantity <= 0) {
    return "Out of Stock";
  } else if (item.quantity <= item.reorder_point) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
};

/**
 * Clean inventory item keys from database for frontend use
 */
export const sanitizeInventoryItem = (item: any): Partial<InventoryItemExtended> => {
  const cleanItem: Partial<InventoryItemExtended> = {
    ...item,
    // Ensure properties use consistent naming
    reorder_point: item.reorder_point || item.reorderPoint,
    unit_price: item.unit_price || item.unitPrice
  };
  
  return cleanItem;
};
