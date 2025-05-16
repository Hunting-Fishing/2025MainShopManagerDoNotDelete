
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Formats an inventory item for display
 */
export const formatInventoryItem = (item: any): InventoryItemExtended => {
  // Convert API/database field names to frontend format if needed
  return {
    id: item.id,
    name: item.name || "",
    sku: item.sku || "",
    description: item.description || "",
    category: item.category || "",
    quantity: item.quantity || 0,
    unit_price: item.unit_price || 0,
    reorder_point: item.reorder_point || 10,
    supplier: item.supplier || "",
    location: item.location || "",
    status: getItemStatus(item.quantity, item.reorder_point),
    shop_id: item.shop_id || null,
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString()
  };
};

/**
 * Calculate the status of an inventory item based on quantity and reorder point
 */
export const getItemStatus = (quantity: number = 0, reorderPoint: number = 10): string => {
  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
};

/**
 * Calculate the total value of an inventory (quantity * price for each item)
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    return total + (item.quantity * (item.unit_price || 0));
  }, 0);
};

/**
 * Count items that are below or at their reorder point
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => item.quantity > 0 && item.quantity <= item.reorder_point).length;
};

/**
 * Count items that are out of stock (quantity = 0)
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => item.quantity <= 0).length;
};

/**
 * Validate inventory item data
 */
export const validateInventoryItem = (data: Partial<InventoryItemExtended>): string[] => {
  const errors: string[] = [];
  
  if (!data.name || data.name.trim() === "") {
    errors.push("Name is required");
  }
  
  if (!data.sku || data.sku.trim() === "") {
    errors.push("SKU is required");
  }
  
  if (data.quantity !== undefined && data.quantity < 0) {
    errors.push("Quantity cannot be negative");
  }
  
  if (data.reorder_point !== undefined && data.reorder_point < 0) {
    errors.push("Reorder point cannot be negative");
  }
  
  if (data.unit_price !== undefined && data.unit_price < 0) {
    errors.push("Unit price cannot be negative");
  }
  
  return errors;
};
