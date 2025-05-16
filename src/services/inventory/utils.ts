
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Calculate the total value of inventory items
 */
export const calculateTotalValue = (items: InventoryItemExtended[]): number => {
  return items.reduce((total, item) => {
    const cost = item.cost || 0;
    const quantity = item.quantity || 0;
    return total + (cost * quantity);
  }, 0);
};

/**
 * Calculate the value of a single inventory item
 */
export const calculateItemValue = (item: InventoryItemExtended): number => {
  return (item.cost || 0) * (item.quantity || 0);
};

/**
 * Calculate total value of items in specific category
 */
export const calculateCategoryValue = (
  items: InventoryItemExtended[], 
  category: string
): number => {
  return items
    .filter(item => item.category === category)
    .reduce((total, item) => {
      const cost = item.cost || 0;
      const quantity = item.quantity || 0;
      return total + (cost * quantity);
    }, 0);
};

/**
 * Format currency for display
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(amount);
};
