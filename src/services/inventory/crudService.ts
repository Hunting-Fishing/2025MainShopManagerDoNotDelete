
import { supabase } from "@/lib/supabase";
import { InventoryItemExtended } from "@/types/inventory";
import { mapDbItemToInventoryItem, mapInventoryItemToDbFormat, getInventoryStatus } from "./utils";
import { handleApiError } from "@/utils/errorHandling";

// Fetch all inventory items
export async function getAllInventoryItems(): Promise<InventoryItemExtended[]> {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .order("name");

    if (error) throw error;

    // Map the database fields to our InventoryItemExtended type
    return (data || []).map(mapDbItemToInventoryItem);
  } catch (error) {
    handleApiError(error, "Failed to fetch inventory items");
    throw error;
  }
}

// Fetch a single inventory item
export async function getInventoryItemById(id: string): Promise<InventoryItemExtended | null> {
  try {
    const { data, error } = await supabase
      .from("inventory_items")
      .select("*")
      .eq("id", id)
      .single();

    if (error) throw error;

    if (!data) return null;

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    handleApiError(error, `Failed to fetch inventory item ${id}`);
    throw error;
  }
}

// Create a new inventory item
export async function createInventoryItem(item: Omit<InventoryItemExtended, "id">): Promise<InventoryItemExtended> {
  try {
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

    if (error) throw error;

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    handleApiError(error, "Failed to create inventory item");
    throw error;
  }
}

// Update an inventory item
export async function updateInventoryItem(id: string, updates: Partial<InventoryItemExtended>): Promise<InventoryItemExtended> {
  try {
    // Validate required fields if they're being updated
    if (updates.name === "") throw new Error("Name cannot be empty");
    if (updates.sku === "") throw new Error("SKU cannot be empty");
    if (updates.category === "") throw new Error("Category cannot be empty");
    if (updates.supplier === "") throw new Error("Supplier cannot be empty");
    if (updates.unitPrice !== undefined && updates.unitPrice < 0) throw new Error("Unit price cannot be negative");
    
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

    if (error) throw error;

    return mapDbItemToInventoryItem(data);
  } catch (error) {
    handleApiError(error, `Failed to update inventory item ${id}`);
    throw error;
  }
}

// Delete an inventory item
export async function deleteInventoryItem(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("inventory_items")
      .delete()
      .eq("id", id);

    if (error) throw error;
  } catch (error) {
    handleApiError(error, `Failed to delete inventory item ${id}`);
    throw error;
  }
}

// Update inventory quantity when items are consumed by work orders
export async function updateInventoryQuantity(itemId: string, quantityChange: number): Promise<void> {
  try {
    // First get the current item to check quantities
    const currentItem = await getInventoryItemById(itemId);
    if (!currentItem) {
      throw new Error(`Inventory item with ID ${itemId} not found`);
    }
    
    // Calculate new quantity
    const newQuantity = currentItem.quantity + quantityChange;
    
    // Don't allow negative inventory (unless specifically configured to allow backorders)
    if (newQuantity < 0) {
      throw new Error(`Cannot reduce quantity below zero for item ${currentItem.name}`);
    }
    
    // Update the item with new quantity and recalculated status
    await updateInventoryItem(itemId, { 
      quantity: newQuantity 
      // Status will be automatically calculated in updateInventoryItem
    });
  } catch (error) {
    handleApiError(error, `Failed to update inventory quantity for item ${itemId}`);
    throw error;
  }
}
