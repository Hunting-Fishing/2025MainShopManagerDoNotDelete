
import { InventoryItem } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder"; // Updated import

export function toExtendedWorkOrderItem(item: WorkOrderInventoryItem): WorkOrderInventoryItem {
  return {
    ...item,
    total: item.quantity * item.unit_price
  };
}

export function toInventoryItem(workOrderItem: WorkOrderInventoryItem): InventoryItem {
  return {
    id: workOrderItem.id,
    name: workOrderItem.name,
    sku: workOrderItem.sku,
    category: workOrderItem.category,
    quantity: workOrderItem.quantity,
    unit_price: workOrderItem.unit_price,
    reorder_point: 10, // Default value
    supplier: workOrderItem.supplierName || 'Unknown',
    location: '', // Default empty
    status: 'In Stock',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  };
}
