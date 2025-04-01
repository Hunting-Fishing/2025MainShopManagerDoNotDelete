
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { mapDbItemToInventoryItem, mapInventoryItemToDbFormat, getInventoryStatus } from "./utils";

// Fetch all inventory items
export async function getAllInventoryItems(): Promise<InventoryItemExtended[]> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .order("name");

  if (error) {
    console.error("Error fetching inventory items:", error);
    throw error;
  }

  // Map the database fields to our InventoryItemExtended type
  return (data || []).map(mapDbItemToInventoryItem);
}

// Fetch a single inventory item
export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  const { data, error } = await supabase
    .from("inventory_items")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    console.error(`Error fetching inventory item ${id}:`, error);
    throw error;
  }

  if (!data) return null;

  return mapDbItemToInventoryItem(data);
}

// Create a new inventory item
export async function createInventoryItem(item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> {
  // Determine the status based on quantity and reorder point
  const status = getInventoryStatus(item.quantity, item.reorderPoint);
  
  // Convert to database format
  const dbItem = mapInventoryItemToDbFormat({
    ...item,
    status
  });

  // Ensure required fields are present
  if (!dbItem.name || !dbItem.sku || !dbItem.category || !dbItem.supplier || dbItem.unit_price === undefined) {
    throw new Error("Missing required inventory item fields");
  }

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      name: dbItem.name,
      sku: dbItem.sku,
      category: dbItem.category,
      supplier: dbItem.supplier,
      unit_price: dbItem.unit_price,
      quantity: dbItem.quantity,
      reorder_point: dbItem.reorder_point,
      location: dbItem.location,
      status: dbItem.status,
      description: dbItem.description
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }

  return mapDbItemToInventoryItem(data);
}

// Update an inventory item
export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  // If quantity is updated, we need to recalculate the status
  if (updates.quantity !== undefined) {
    // Get the reorder point, either from the updates or from the current item
    let reorderPoint = updates.reorderPoint;
    if (reorderPoint === undefined) {
      // Get the current item to check against its reorder point
      const currentItem = await getInventoryItemById(id);
      if (currentItem) {
        reorderPoint = currentItem.reorderPoint;
      }
    }
    
    if (reorderPoint !== undefined) {
      updates.status = getInventoryStatus(updates.quantity, reorderPoint);
    }
  }
  
  // Convert to database format
  const dbUpdates = mapInventoryItemToDbFormat(updates);

  const { data, error } = await supabase
    .from("inventory_items")
    .update(dbUpdates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error(`Error updating inventory item ${id}:`, error);
    throw error;
  }

  return mapDbItemToInventoryItem(data);
}

// Delete an inventory item
export async function deleteInventoryItem(id: string): Promise<void> {
  const { error } = await supabase
    .from("inventory_items")
    .delete()
    .eq("id", id);

  if (error) {
    console.error(`Error deleting inventory item ${id}:`, error);
    throw error;
  }
}
