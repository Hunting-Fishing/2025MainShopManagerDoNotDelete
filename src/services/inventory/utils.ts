
import { Inventory, InventoryItemExtended } from "@/types/inventory";

// Convert database item to inventory item
export function mapDbItemToInventoryItem(dbItem: any): InventoryItemExtended {
  const item = {
    id: dbItem.id,
    name: dbItem.name || '',
    sku: dbItem.sku || '',
    description: dbItem.description || '',
    quantity: Number(dbItem.quantity) || 0,
    unit_price: Number(dbItem.unit_price) || 0,
    category: dbItem.category || '',
    supplier: dbItem.supplier || '',
    min_stock_level: Number(dbItem.min_stock_level) || Number(dbItem.reorder_point) || 0,
    reorder_quantity: Number(dbItem.reorder_quantity) || 0,
    location: dbItem.location || '',
    last_ordered: dbItem.last_ordered || null,
    last_received: dbItem.last_received || null,
    created_at: dbItem.created_at || new Date().toISOString(),
    updated_at: dbItem.updated_at || new Date().toISOString(),
    status: determineInventoryStatus(dbItem),
    auto_reorder: dbItem.auto_reorder || false
  };
  
  // Add alias properties for compatibility
  item.reorderPoint = item.min_stock_level;
  item.unitPrice = item.unit_price;
  
  return item;
}

// Helper alias for backwards compatibility
export const mapDbToInventoryItem = mapDbItemToInventoryItem;

// Determine inventory status based on quantity and min_stock_level
export function determineInventoryStatus(item: any): string {
  if (!item || typeof item.quantity === 'undefined') return 'Unknown';
  
  const quantity = Number(item.quantity);
  const minStock = Number(item.min_stock_level || item.reorder_point || 5);
  
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= minStock) return 'Low Stock';
  return 'In Stock';
}

// Add this function to fix the useInventoryForm error
export function getInventoryStatus(quantity: number, reorderPoint: number): string {
  if (quantity <= 0) return 'Out of Stock';
  if (quantity <= reorderPoint) return 'Low Stock';
  return 'In Stock';
}

// Format inventory for display
export function formatInventoryItem(item: InventoryItemExtended): Inventory {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    description: item.description,
    quantity: item.quantity,
    price: item.unit_price, // Map unit_price to price
    category: item.category,
    supplier: item.supplier,
    status: item.status,
    minStockLevel: item.min_stock_level,
    reorderQuantity: item.reorder_quantity || 0,
    location: item.location,
    lastOrdered: item.last_ordered,
    lastReceived: item.last_received,
    autoReorder: item.auto_reorder
  };
}

// Add the missing function to map inventory item to database format
export function mapInventoryItemToDbFormat(item: Partial<InventoryItemExtended>): any {
  return {
    name: item.name,
    sku: item.sku,
    description: item.description,
    quantity: item.quantity,
    unit_price: item.unit_price || item.unitPrice,
    category: item.category,
    supplier: item.supplier,
    min_stock_level: item.min_stock_level || item.reorderPoint,
    reorder_quantity: item.reorder_quantity,
    location: item.location,
    last_ordered: item.last_ordered,
    last_received: item.last_received,
    status: item.status,
    auto_reorder: item.auto_reorder
  };
}
