
import { InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem, ExtendedWorkOrderInventoryItem } from "@/components/work-orders/inventory/WorkOrderInventoryItem";
import { InvoiceItem } from "@/types/invoice";

/**
 * Get inventory status based on quantity and reorder point
 */
export const getInventoryStatus = (
  quantity: number | undefined, 
  reorderPoint: number | undefined
): "In Stock" | "Low Stock" | "Out of Stock" => {
  if (quantity === undefined || quantity <= 0) {
    return "Out of Stock";
  } else if (reorderPoint !== undefined && quantity <= reorderPoint) {
    return "Low Stock";
  }
  return "In Stock";
};

/**
 * Get inventory status for an item
 */
export const getItemInventoryStatus = (item: InventoryItemExtended): string => {
  const quantity = Number(item.quantity) || 0;
  const reorderPoint = Number(item.reorder_point) || 0;
  return getInventoryStatus(quantity, reorderPoint);
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
    updated_at: item.updated_at || new Date().toISOString()
  };
};

/**
 * Convert inventory item to invoice item
 */
export const inventoryItemToInvoiceItem = (item: InventoryItemExtended): InvoiceItem => {
  const quantity = 1;
  const price = Number(item.unit_price) || Number(item.price) || 0;
  
  return {
    id: item.id,
    name: item.name,
    description: item.description || item.name,
    sku: item.sku,
    quantity: quantity,
    price: price,
    total: price * quantity,
    category: item.category
  };
};

/**
 * Convert work order inventory item to invoice item
 */
export const workOrderInventoryItemToInvoiceItem = (item: WorkOrderInventoryItem): InvoiceItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.name,
    sku: item.sku,
    quantity: item.quantity,
    price: item.unit_price,
    total: item.total,
    category: item.category
  };
};

/**
 * Get CSS class based on inventory status
 */
export const getStatusColorClass = (status: string): string => {
  switch (status.toLowerCase()) {
    case 'in stock':
    case 'in-stock':
      return 'bg-green-100 text-green-800 border-green-300';
    case 'low stock':
    case 'low-stock':
      return 'bg-yellow-100 text-yellow-800 border-yellow-300';
    case 'out of stock':
    case 'out-of-stock':
      return 'bg-red-100 text-red-800 border-red-300';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-300';
  }
};
