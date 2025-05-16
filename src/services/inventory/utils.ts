
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Calculate the total value of inventory items
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const itemValue = (item.quantity || 0) * (item.unit_price || 0);
    return total + itemValue;
  }, 0);
};

/**
 * Count items that are below their reorder level but not completely out of stock
 */
export const countLowStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => {
    const quantity = item.quantity || 0;
    const reorderPoint = item.reorder_point || 0;
    return quantity > 0 && quantity <= reorderPoint;
  }).length;
};

/**
 * Count items that are completely out of stock (quantity is 0)
 */
export const countOutOfStockItems = (items: InventoryItemExtended[]): number => {
  return items.filter(item => (item.quantity || 0) === 0).length;
};

/**
 * Calculate available quantity (total - reserved)
 */
export const calculateAvailableQuantity = (item: InventoryItemExtended): number => {
  const totalQuantity = item.quantity || 0;
  const reservedQuantity = item.quantity_reserved || 0;
  return Math.max(0, totalQuantity - reservedQuantity);
};

/**
 * Check if an item needs reordering
 */
export const needsReordering = (item: InventoryItemExtended): boolean => {
  const availableQuantity = calculateAvailableQuantity(item);
  const reorderPoint = item.reorder_point || 0;
  return availableQuantity <= reorderPoint;
};
