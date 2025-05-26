
import { WorkOrderInventoryItem } from "@/types/workOrder";
import { InventoryItemExtended } from "@/types/inventory";

/**
 * Convert inventory item to work order format
 */
export const toWorkOrderInventoryItem = (
  inventoryItem: InventoryItemExtended,
  quantity: number = 1
): WorkOrderInventoryItem => ({
  id: inventoryItem.id,
  name: inventoryItem.name,
  sku: inventoryItem.sku,
  category: inventoryItem.category || '',
  quantity,
  unit_price: inventoryItem.unit_price,
  total: quantity * inventoryItem.unit_price
});

/**
 * Convert work order inventory item to extended format for display
 */
export const toExtendedWorkOrderItem = (item: WorkOrderInventoryItem): InventoryItemExtended => ({
  id: item.id,
  name: item.name,
  sku: item.sku,
  category: item.category,
  supplier: item.supplierName || '',
  location: '',
  status: 'In Stock',
  description: item.notes || '',
  quantity: item.quantity,
  reorder_point: 10,
  unit_price: item.unit_price,
  shop_id: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
});
