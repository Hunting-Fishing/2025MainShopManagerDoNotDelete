
/**
 * Utility functions for inventory data conversion between frontend and database
 */

import { InventoryItemExtended, AutoReorderSettings } from "@/types/inventory";

// Convert DB format to frontend format
export function mapDbItemToInventoryItem(item: any): InventoryItemExtended {
  return {
    id: item.id,
    name: item.name,
    sku: item.sku,
    category: item.category,
    supplier: item.supplier,
    quantity: item.quantity,
    reorderPoint: item.reorder_point,
    unitPrice: parseFloat(item.unit_price),
    location: item.location || "",
    status: item.status,
    description: item.description || ""
  };
}

// Convert frontend format to DB format for create/update operations
export function mapInventoryItemToDbFormat(item: Partial<InventoryItemExtended>) {
  const dbItem: Record<string, any> = {};
  
  if (item.name !== undefined) dbItem.name = item.name;
  if (item.sku !== undefined) dbItem.sku = item.sku;
  if (item.category !== undefined) dbItem.category = item.category;
  if (item.supplier !== undefined) dbItem.supplier = item.supplier;
  if (item.quantity !== undefined) dbItem.quantity = item.quantity;
  if (item.reorderPoint !== undefined) dbItem.reorder_point = item.reorderPoint;
  if (item.unitPrice !== undefined) dbItem.unit_price = item.unitPrice.toString();
  if (item.location !== undefined) dbItem.location = item.location;
  if (item.status !== undefined) dbItem.status = item.status;
  if (item.description !== undefined) dbItem.description = item.description;
  
  return dbItem;
}

// Helper function to determine inventory status
export function getInventoryStatus(quantity: number, reorderPoint: number): string {
  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
}
