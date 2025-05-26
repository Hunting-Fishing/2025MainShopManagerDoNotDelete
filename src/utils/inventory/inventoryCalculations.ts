
import { InventoryItem } from "@/types/inventory";
import { WorkOrderInventoryItem } from "@/types/workOrder"; // Updated import

export function calculateInventoryTotal(items: WorkOrderInventoryItem[]): number {
  return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
}

export function calculateItemTotal(item: WorkOrderInventoryItem): number {
  return item.quantity * item.unit_price;
}

export function isLowStock(item: InventoryItem): boolean {
  return item.quantity <= item.reorder_point;
}

export function getInventoryValue(items: InventoryItem[]): number {
  return items.reduce((total, item) => total + (item.quantity * item.unit_price), 0);
}
