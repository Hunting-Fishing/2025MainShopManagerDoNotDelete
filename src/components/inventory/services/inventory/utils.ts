
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
    reorder_point: dbItem.reorder_point || 0,
    unit_price: dbItem.unit_price || 0,
    location: dbItem.location || "",
    status: dbItem.status || "In Stock",
    description: dbItem.description || "",
    partNumber: dbItem.part_number,
    barcode: dbItem.barcode,
    subcategory: dbItem.subcategory,
    manufacturer: dbItem.manufacturer,
    vehicleCompatibility: dbItem.vehicle_compatibility,
    onHold: dbItem.on_hold || 0,
    onOrder: dbItem.on_order || 0,
    cost: dbItem.cost,
    marginMarkup: dbItem.margin_markup,
    warrantyPeriod: dbItem.warranty_period,
    dateBought: dbItem.date_bought,
    dateLast: dbItem.date_last,
    notes: dbItem.notes
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
  if (item.reorder_point !== undefined) dbItem.reorder_point = item.reorder_point;
  if (item.unit_price !== undefined) dbItem.unit_price = item.unit_price;
  if (item.location !== undefined) dbItem.location = item.location;
  if (item.status !== undefined) dbItem.status = item.status;
  if (item.description !== undefined) dbItem.description = item.description;
  
  // Extended properties
  if (item.partNumber !== undefined) dbItem.part_number = item.partNumber;
  if (item.barcode !== undefined) dbItem.barcode = item.barcode;
  if (item.subcategory !== undefined) dbItem.subcategory = item.subcategory;
  if (item.manufacturer !== undefined) dbItem.manufacturer = item.manufacturer;
  if (item.vehicleCompatibility !== undefined) dbItem.vehicle_compatibility = item.vehicleCompatibility;
  if (item.onHold !== undefined) dbItem.on_hold = item.onHold;
  if (item.onOrder !== undefined) dbItem.on_order = item.onOrder;
  if (item.cost !== undefined) dbItem.cost = item.cost;
  if (item.marginMarkup !== undefined) dbItem.margin_markup = item.marginMarkup;
  if (item.warrantyPeriod !== undefined) dbItem.warranty_period = item.warrantyPeriod;
  if (item.dateBought !== undefined) dbItem.date_bought = item.dateBought;
  if (item.dateLast !== undefined) dbItem.date_last = item.dateLast;
  if (item.notes !== undefined) dbItem.notes = item.notes;
  
  return dbItem;
}
