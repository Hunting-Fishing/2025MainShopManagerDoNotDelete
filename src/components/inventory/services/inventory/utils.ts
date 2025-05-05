import { InventoryItemExtended } from "@/types/inventory";

// Determine inventory status based on quantity and reorder point
export function getInventoryStatus(quantity: number, reorderPoint: number): string {
  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
}

// Map database item to InventoryItemExtended type
export function mapDbItemToInventoryItem(dbItem: any): InventoryItemExtended {
  return {
    id: dbItem.id,
    name: dbItem.name,
    sku: dbItem.sku || "",
    category: dbItem.category || "",
    supplier: dbItem.supplier || "",
    quantity: dbItem.quantity || 0,
    reorderPoint: dbItem.reorder_point || 0,
    unitPrice: dbItem.unit_price || 0,
    location: dbItem.location || "",
    status: dbItem.status || "In Stock",
    description: dbItem.description || "",
    coreCharge: dbItem.core_charge || 0,
    environmentalFee: dbItem.environmental_fee || 0,
    freightFee: dbItem.freight_fee || 0,
    otherFee: dbItem.other_fee || 0,
    otherFeeDescription: dbItem.other_fee_description || "",
  };
}

// Map InventoryItemExtended to database format
export function mapInventoryItemToDbFormat(item: Partial<InventoryItemExtended>): any {
  const dbItem: any = {};
  
  if (item.name !== undefined) dbItem.name = item.name;
  if (item.sku !== undefined) dbItem.sku = item.sku;
  if (item.category !== undefined) dbItem.category = item.category;
  if (item.supplier !== undefined) dbItem.supplier = item.supplier;
  if (item.quantity !== undefined) dbItem.quantity = item.quantity;
  if (item.reorderPoint !== undefined) dbItem.reorder_point = item.reorderPoint;
  if (item.unitPrice !== undefined) dbItem.unit_price = item.unitPrice;
  if (item.location !== undefined) dbItem.location = item.location;
  if (item.status !== undefined) dbItem.status = item.status;
  if (item.description !== undefined) dbItem.description = item.description;
  if (item.coreCharge !== undefined) dbItem.core_charge = item.coreCharge;
  if (item.environmentalFee !== undefined) dbItem.environmental_fee = item.environmentalFee;
  if (item.freightFee !== undefined) dbItem.freight_fee = item.freightFee;
  if (item.otherFee !== undefined) dbItem.other_fee = item.otherFee;
  if (item.otherFeeDescription !== undefined) dbItem.other_fee_description = item.otherFeeDescription;
  
  return dbItem;
}
