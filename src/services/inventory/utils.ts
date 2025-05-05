
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
    
    // New fields
    partNumber: dbItem.part_number || "",
    manufacturer: dbItem.manufacturer || "",
    cost: dbItem.cost || 0,
    marginMarkup: dbItem.margin_markup || 0,
    retailPrice: dbItem.retail_price || 0,
    wholesalePrice: dbItem.wholesale_price || 0,
    specialTax: dbItem.special_tax || 0,
    onOrder: dbItem.on_order || 0,
    onHold: dbItem.on_hold || 0,
    minimumOrder: dbItem.minimum_order || 0,
    maximumOrder: dbItem.maximum_order || 0,
    totalQtySold: dbItem.total_qty_sold || 0,
    dateBought: dbItem.date_bought || "",
    dateLast: dbItem.date_last || "",
    serialNumbers: dbItem.serial_numbers || "",
    itemCondition: dbItem.item_condition || "New",
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
  
  // New fields
  if (item.partNumber !== undefined) dbItem.part_number = item.partNumber;
  if (item.manufacturer !== undefined) dbItem.manufacturer = item.manufacturer;
  if (item.cost !== undefined) dbItem.cost = item.cost;
  if (item.marginMarkup !== undefined) dbItem.margin_markup = item.marginMarkup;
  if (item.retailPrice !== undefined) dbItem.retail_price = item.retailPrice;
  if (item.wholesalePrice !== undefined) dbItem.wholesale_price = item.wholesalePrice;
  if (item.specialTax !== undefined) dbItem.special_tax = item.specialTax;
  if (item.onOrder !== undefined) dbItem.on_order = item.onOrder;
  if (item.onHold !== undefined) dbItem.on_hold = item.onHold;
  if (item.minimumOrder !== undefined) dbItem.minimum_order = item.minimumOrder;
  if (item.maximumOrder !== undefined) dbItem.maximum_order = item.maximumOrder;
  if (item.totalQtySold !== undefined) dbItem.total_qty_sold = item.totalQtySold;
  if (item.dateBought !== undefined) dbItem.date_bought = item.dateBought;
  if (item.dateLast !== undefined) dbItem.date_last = item.dateLast;
  if (item.serialNumbers !== undefined) dbItem.serial_numbers = item.serialNumbers;
  if (item.itemCondition !== undefined) dbItem.item_condition = item.itemCondition;
  
  return dbItem;
}
