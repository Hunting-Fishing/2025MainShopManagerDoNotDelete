
import { InventoryItem, InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem, ExtendedWorkOrderInventoryItem } from "@/components/work-orders/inventory/WorkOrderInventoryItem";
import { InvoiceItem } from "@/types/invoice";

/**
 * Type adapter functions to convert between different data models
 */

/**
 * Convert from InventoryItem to WorkOrderInventoryItem
 */
export const inventoryToWorkOrderItem = (item: InventoryItem): WorkOrderInventoryItem => {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku || '',
    category: item.category || '',
    quantity: 1,
    unit_price: item.unit_price || item.price || 0,
    total: (item.unit_price || item.price || 0) // initial quantity is 1
  };
};

/**
 * Convert from WorkOrderInventoryItem to InvoiceItem
 */
export const workOrderItemToInvoiceItem = (item: WorkOrderInventoryItem): InvoiceItem => {
  return {
    id: item.id,
    name: item.name,
    description: item.name,
    sku: item.sku || '',
    quantity: item.quantity,
    price: item.unit_price,
    total: item.total,
    category: item.category || ''
  };
};

/**
 * Convert extended inventory item to standard format
 */
export const standardizeInventoryItem = (item: any): InventoryItemExtended => {
  return {
    id: item.id || crypto.randomUUID(),
    name: item.name || '',
    sku: item.sku || '',
    category: item.category || '',
    description: item.description || '',
    quantity: Number(item.quantity) || 0,
    reorder_point: Number(item.reorder_point) || 10,
    unit_price: Number(item.unit_price) || 0,
    price: Number(item.unit_price) || 0, // Ensure price property exists
    supplier: item.supplier || '',
    location: item.location || '',
    status: item.status || 'In Stock',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString()
  };
};

/**
 * Convert any inventory-like object to ExtendedWorkOrderInventoryItem
 */
export const toExtendedWorkOrderItem = (item: any): ExtendedWorkOrderInventoryItem => {
  const quantity = Number(item.quantity) || 1;
  const unitPrice = Number(item.unit_price) || Number(item.price) || 0;
  
  return {
    id: item.id || `temp-${Date.now()}`,
    name: item.name || 'Unnamed Item',
    sku: item.sku || '',
    category: item.category || 'Uncategorized',
    quantity: quantity,
    unit_price: unitPrice,
    total: quantity * unitPrice,
    itemStatus: determineItemStatus(item),
    estimatedArrivalDate: item.estimatedArrivalDate || item.expected_arrival || undefined,
    supplierName: item.supplierName || item.supplier || undefined,
    notes: item.notes || undefined
  };
};

/**
 * Determine the item status based on available data
 */
export const determineItemStatus = (item: any): "special-order" | "ordered" | "in-stock" => {
  if (item.itemStatus) {
    if (["special-order", "ordered", "in-stock"].includes(item.itemStatus)) {
      return item.itemStatus as any;
    }
  }
  
  const quantity = Number(item.quantity) || 0;
  if (quantity <= 0) {
    return "special-order";
  }
  return "in-stock";
};
