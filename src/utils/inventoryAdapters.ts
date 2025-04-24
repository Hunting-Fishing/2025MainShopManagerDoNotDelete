
import { InventoryItem, InventoryItemExtended } from '@/types/inventory';
import { WorkOrderInventoryItem } from '@/types/workOrder';

/**
 * Maps database inventory items to InventoryItemExtended format
 * @param dbItems Inventory items from the database
 */
export const mapToInventoryItemExtended = (dbItems: any[]): InventoryItemExtended[] => {
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
    status: item.status || 'In Stock',
    description: item.description || ''
  }));
};

/**
 * Maps database inventory items to InventoryItem format
 * @param dbItems Inventory items from the database
 */
export const mapToInventoryItem = (dbItems: any[]): InventoryItem[] => {
  return dbItems.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    price: item.unit_price,
    description: item.description,
    quantity: item.quantity,
    supplier: item.supplier,
    status: item.status
  }));
};

/**
 * Maps database work order inventory items to WorkOrderInventoryItem format
 * @param dbItems Work order inventory items from the database
 */
export const mapToWorkOrderInventoryItem = (dbItems: any[]): WorkOrderInventoryItem[] => {
  return dbItems.map(item => ({
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    category: item.category || '',
    quantity: item.quantity || 0,
    unitPrice: item.unit_price || 0,
    totalPrice: (item.quantity || 0) * (item.unit_price || 0),
    itemStatus: item.item_status || 'in-stock'
  }));
};

/**
 * Maps WorkOrderInventoryItem to database format
 * @param item Work order inventory item
 */
export const mapWorkOrderInventoryItemToDb = (item: WorkOrderInventoryItem): any => {
  return {
    name: item.name,
    sku: item.sku,
    category: item.category,
    quantity: item.quantity,
    unit_price: item.unitPrice,
    item_status: item.itemStatus
  };
};
