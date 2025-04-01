
import { supabase } from "@/lib/supabase";

// Get inventory categories from the database
export async function getInventoryCategories(): Promise<string[]> {
  try {
    // Try to get categories from the database
    const { data, error } = await supabase
      .from("inventory_categories")
      .select("name")
      .order("name");

    if (error) throw error;

    // If there are categories in the DB, return them
    if (data && data.length > 0) {
      return data.map(category => category.name);
    }

    // If no categories in DB, use the default ones from constants
    const { INVENTORY_CATEGORIES } = await import("@/constants/inventoryCategories");
    
    // Initialize the database with default categories
    await initializeDefaultCategories(INVENTORY_CATEGORIES);
    
    return [...INVENTORY_CATEGORIES];
  } catch (error) {
    console.error("Error fetching inventory categories:", error);
    // If there's an error, fall back to constants
    const { INVENTORY_CATEGORIES } = await import("@/constants/inventoryCategories");
    return [...INVENTORY_CATEGORIES];
  }
}

// Add a new inventory category
export async function addInventoryCategory(name: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("inventory_categories")
      .insert({ name });

    if (error) throw error;
  } catch (error) {
    console.error("Error adding inventory category:", error);
    throw error;
  }
}

// Delete an inventory category
export async function deleteInventoryCategory(name: string): Promise<void> {
  try {
    const { error } = await supabase
      .from("inventory_categories")
      .delete()
      .eq("name", name);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting inventory category:", error);
    throw error;
  }
}

// Initialize the database with default categories if needed
async function initializeDefaultCategories(categories: string[]): Promise<void> {
  try {
    // Prepare the data for batch insert
    const categoryData = categories.map(name => ({ name }));
    
    const { error } = await supabase
      .from("inventory_categories")
      .insert(categoryData);

    if (error) throw error;
  } catch (error) {
    console.error("Error initializing default categories:", error);
  }
}
