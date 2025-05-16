
import { 
  getInventoryItems,
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getInventoryCategories,
  getInventorySuppliers,
  getInventoryLocations,
  filterInventoryItems,
  calculateTotalValue
} from "./inventory/index";

import { 
  InventoryItemExtended, 
  InventoryFilter 
} from "@/types/inventory";

import { supabase } from "@/lib/supabase";

export { 
  getInventoryItems,
  createInventoryItem, 
  updateInventoryItem, 
  deleteInventoryItem,
  getInventoryCategories,
  getInventorySuppliers,
  getInventoryLocations,
  filterInventoryItems,
  calculateTotalValue
};

export const getInventoryStatistics = async () => {
  try {
    const items = await getInventoryItems();
    
    const totalItems = items.length;
    const totalValue = calculateTotalValue(items);
    const lowStockCount = items.filter(item => 
      item.quantity > 0 && item.quantity <= item.reorder_point
    ).length;
    const outOfStockCount = items.filter(item => item.quantity <= 0).length;
    
    return {
      totalItems,
      totalValue,
      lowStockCount,
      outOfStockCount
    };
  } catch (error) {
    console.error("Error getting inventory statistics:", error);
    return {
      totalItems: 0,
      totalValue: 0,
      lowStockCount: 0,
      outOfStockCount: 0
    };
  }
};

export const bulkUpdateInventory = async (items: InventoryItemExtended[]) => {
  const { data, error } = await supabase.from('inventory_items').upsert(
    items.map(item => ({
      id: item.id,
      name: item.name,
      sku: item.sku,
      category: item.category,
      description: item.description,
      quantity: item.quantity,
      reorder_point: item.reorder_point,
      unit_price: item.unit_price,
      supplier: item.supplier,
      location: item.location,
      status: item.status,
      updated_at: new Date().toISOString()
    }))
  );

  if (error) {
    console.error("Error bulk updating inventory:", error);
    throw error;
  }

  return data;
};
