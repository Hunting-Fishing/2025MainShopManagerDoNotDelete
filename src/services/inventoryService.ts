import { supabase } from "@/lib/supabase";
import { InventoryItemExtended, AutoReorderSettings } from "@/types/inventory";

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
  return (data || []).map(item => ({
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
  }));
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

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    supplier: data.supplier,
    quantity: data.quantity,
    reorderPoint: data.reorder_point,
    unitPrice: parseFloat(data.unit_price),
    location: data.location || "",
    status: data.status,
    description: data.description || ""
  };
}

// Create a new inventory item
export async function createInventoryItem(item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> {
  // Determine the status based on quantity and reorder point
  const status = getInventoryStatus(item.quantity, item.reorderPoint);

  const { data, error } = await supabase
    .from("inventory_items")
    .insert({
      name: item.name,
      sku: item.sku,
      category: item.category,
      supplier: item.supplier,
      quantity: item.quantity,
      reorder_point: item.reorderPoint,
      unit_price: Number(item.unitPrice),
      location: item.location,
      status,
      description: item.description
    })
    .select()
    .single();

  if (error) {
    console.error("Error creating inventory item:", error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    supplier: data.supplier,
    quantity: data.quantity,
    reorderPoint: data.reorder_point,
    unitPrice: parseFloat(data.unit_price),
    location: data.location || "",
    status: data.status,
    description: data.description || ""
  };
}

// Update an inventory item
export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  // Prepare updates for database format
  const dbUpdates: Record<string, any> = {};
  
  if (updates.name !== undefined) dbUpdates.name = updates.name;
  if (updates.sku !== undefined) dbUpdates.sku = updates.sku;
  if (updates.category !== undefined) dbUpdates.category = updates.category;
  if (updates.supplier !== undefined) dbUpdates.supplier = updates.supplier;
  if (updates.quantity !== undefined) {
    dbUpdates.quantity = updates.quantity;
    // Update status based on new quantity
    if (updates.reorderPoint !== undefined) {
      dbUpdates.status = getInventoryStatus(updates.quantity, updates.reorderPoint);
    } else {
      // Get the current item to check against its reorder point
      const currentItem = await getInventoryItemById(id);
      if (currentItem) {
        dbUpdates.status = getInventoryStatus(updates.quantity, currentItem.reorderPoint);
      }
    }
  }
  if (updates.reorderPoint !== undefined) dbUpdates.reorder_point = updates.reorderPoint;
  if (updates.unitPrice !== undefined) dbUpdates.unit_price = Number(updates.unitPrice);
  if (updates.location !== undefined) dbUpdates.location = updates.location;
  if (updates.description !== undefined) dbUpdates.description = updates.description;

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

  return {
    id: data.id,
    name: data.name,
    sku: data.sku,
    category: data.category,
    supplier: data.supplier,
    quantity: data.quantity,
    reorderPoint: data.reorder_point,
    unitPrice: parseFloat(data.unit_price),
    location: data.location || "",
    status: data.status,
    description: data.description || ""
  };
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

// Helper function to determine inventory status
function getInventoryStatus(quantity: number, reorderPoint: number): string {
  if (quantity <= 0) {
    return "Out of Stock";
  } else if (quantity <= reorderPoint) {
    return "Low Stock";
  } else {
    return "In Stock";
  }
}

// Get auto-reorder settings for all items
export async function getAutoReorderSettings(): Promise<Record<string, AutoReorderSettings>> {
  const { data, error } = await supabase
    .from("inventory_auto_reorder")
    .select("*");

  if (error) {
    console.error("Error fetching auto-reorder settings:", error);
    throw error;
  }

  const settings: Record<string, AutoReorderSettings> = {};
  (data || []).forEach(setting => {
    settings[setting.item_id] = {
      enabled: setting.enabled,
      threshold: setting.threshold,
      quantity: setting.quantity
    };
  });

  return settings;
}

// Enable auto-reorder for an item
export async function enableAutoReorder(itemId: string, threshold: number, quantity: number): Promise<void> {
  const { error } = await supabase
    .from("inventory_auto_reorder")
    .upsert({
      item_id: itemId,
      enabled: true,
      threshold,
      quantity
    });

  if (error) {
    console.error(`Error enabling auto-reorder for item ${itemId}:`, error);
    throw error;
  }
}

// Disable auto-reorder for an item
export async function disableAutoReorder(itemId: string): Promise<void> {
  const { error } = await supabase
    .from("inventory_auto_reorder")
    .update({ enabled: false })
    .eq("item_id", itemId);

  if (error) {
    console.error(`Error disabling auto-reorder for item ${itemId}:`, error);
    throw error;
  }
}

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

  return (data || []).map(item => ({
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
  }));
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

  return (data || []).map(item => ({
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
  }));
}
