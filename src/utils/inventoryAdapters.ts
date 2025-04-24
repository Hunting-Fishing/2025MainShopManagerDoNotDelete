
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
    itemStatus: item.item_status || 'in-stock',
    estimatedArrivalDate: item.estimated_arrival_date,
    supplierName: item.supplier_name,
    supplierOrderRef: item.supplier_order_ref,
    notes: item.notes
  }));
};

/**
 * Maps WorkOrderInventoryItem to database format
 * @param item Work order inventory item
 */
export const mapWorkOrderInventoryItemToDb = (item: Partial<WorkOrderInventoryItem> & { id: string }): any => {
  const dbItem: Record<string, any> = {};
  
  if (item.name !== undefined) dbItem.name = item.name;
  if (item.sku !== undefined) dbItem.sku = item.sku;
  if (item.category !== undefined) dbItem.category = item.category;
  if (item.quantity !== undefined) dbItem.quantity = item.quantity;
  if (item.unitPrice !== undefined) dbItem.unit_price = item.unitPrice;
  if (item.itemStatus !== undefined) dbItem.item_status = item.itemStatus;
  if (item.estimatedArrivalDate !== undefined) dbItem.estimated_arrival_date = item.estimatedArrivalDate;
  if (item.supplierName !== undefined) dbItem.supplier_name = item.supplierName;
  if (item.supplierOrderRef !== undefined) dbItem.supplier_order_ref = item.supplierOrderRef;
  if (item.notes !== undefined) dbItem.notes = item.notes;
  
  return dbItem;
};
