
import { InventoryItem, InventoryItemExtended, WorkOrderInventoryItem } from "@/types/inventory";

// Adapter to convert database inventory items to InventoryItemExtended
export function mapToInventoryItemExtended(dbItems: any[]): InventoryItemExtended[] {
  return dbItems.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    category: item.category || '',
    supplier: item.supplier || '',
    quantity: item.quantity || 0,
    reorderPoint: item.reorder_point || 0,
    unitPrice: item.unit_price || 0,
    location: item.location || '',
    status: item.status || 'active',
    description: item.description || ''
  }));
}

// Adapter to convert database inventory items to InventoryItem
export function mapToInventoryItem(dbItems: any[]): InventoryItem[] {
  return dbItems.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    price: item.unit_price || 0, // Map unit_price to price
    description: item.description,
    quantity: item.quantity,
    supplier: item.supplier,
    status: item.status
  }));
}

// Adapter to convert database work order inventory items to WorkOrderInventoryItem
export function mapToWorkOrderInventoryItem(dbItems: any[]): WorkOrderInventoryItem[] {
  return dbItems.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    category: item.category || '',
    quantity: item.quantity || 0,
    unitPrice: item.unit_price || 0, // Map unit_price to unitPrice
    workOrderId: item.work_order_id
  }));
}
