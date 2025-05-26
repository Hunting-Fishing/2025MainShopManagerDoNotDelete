
import { InventoryItem, InventoryItemExtended } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder";

export function toExtendedWorkOrderItem(item: WorkOrderInventoryItem): WorkOrderInventoryItem {
  return {
    ...item,
    total: item.quantity * item.unit_price
  };
}

export function toInventoryItem(workOrderItem: WorkOrderInventoryItem): InventoryItemExtended {
  return {
    id: workOrderItem.id,
    name: workOrderItem.name,
    sku: workOrderItem.sku,
    category: workOrderItem.category,
    quantity: workOrderItem.quantity,
    unit_price: workOrderItem.unit_price,
    price: workOrderItem.unit_price,
    reorder_point: 10, // Default value
    supplier: workOrderItem.supplierName || 'Unknown',
    status: 'In Stock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}

export function standardizeInventoryItem(item: any): InventoryItemExtended {
  return {
    id: item.id,
    name: item.name || '',
    sku: item.sku || '',
    category: item.category || '',
    description: item.description || '',
    quantity: Number(item.quantity) || 0,
    unit_price: Number(item.unit_price) || 0,
    price: Number(item.unit_price) || 0,
    reorder_point: Number(item.reorder_point) || 10,
    supplier: item.supplier || '',
    status: item.status || 'In Stock',
    created_at: item.created_at || new Date().toISOString(),
    updated_at: item.updated_at || new Date().toISOString()
  };
}
