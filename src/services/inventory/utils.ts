import { Inventory, InventoryItemExtended } from "@/types/inventory";

// Convert database item to inventory item
export function mapDbItemToInventoryItem(dbItem: any): InventoryItemExtended {
  return {
    id: dbItem.id,
    name: dbItem.name || '',
    sku: dbItem.sku || '',
    description: dbItem.description || '',
    quantity: Number(dbItem.quantity) || 0,
    unit_price: Number(dbItem.unit_price) || 0,
    category: dbItem.category || '',
    supplier: dbItem.supplier || '',
    min_stock_level: Number(dbItem.min_stock_level) || 0,
    reorder_quantity: Number(dbItem.reorder_quantity) || 0,
    location: dbItem.location || '',
    last_ordered: dbItem.last_ordered || null,
    last_received: dbItem.last_received || null,
    created_at: dbItem.created_at || new Date().toISOString(),
    updated_at: dbItem.updated_at || new Date().toISOString(),
    status: determineInventoryStatus(dbItem),
    auto_reorder: dbItem.auto_reorder || false
  };
}

// Helper alias for backwards compatibility
export const mapDbToInventoryItem = mapDbItemToInventoryItem;

// Determine inventory status based on quantity and min_stock_level
export function determineInventoryStatus(item: any): string {
  if (!item || typeof item.quantity === 'undefined') return 'Unknown';
  
  const quantity = Number(item.quantity);
  const minStock = Number(item.min_stock_level || 5);
  
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
    price: item.unit_price,
    category: item.category,
    supplier: item.supplier,
    status: item.status,
    minStockLevel: item.min_stock_level,
    reorderQuantity: item.reorder_quantity,
    location: item.location,
    lastOrdered: item.last_ordered,
    lastReceived: item.last_received,
    autoReorder: item.auto_reorder
  };
}
