
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { mapDbItemToInventoryItem } from "./utils";

// Get inventory items with low stock
export async function getLowStockItems(): Promise<InventoryItemExtended[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("status", "Low Stock");

  if (error) {
    console.error("Error fetching low stock items:", error);
    throw error;
  }

  return (data || []).map(mapDbItemToInventoryItem);
}

// Get inventory items that are out of stock
export async function getOutOfStockItems(): Promise<InventoryItemExtended[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("status", "Out of Stock");

  if (error) {
    console.error("Error fetching out of stock items:", error);
    throw error;
  }

  return (data || []).map(mapDbItemToInventoryItem);
}
