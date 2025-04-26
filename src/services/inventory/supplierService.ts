
import { supabase } from "@/lib/supabase";

// Get inventory suppliers from the database
export async function getInventorySuppliers(): Promise<string[]> {
  try {
    // Try to get suppliers from the database
    // Cast supabase to any to bypass TypeScript checking until Supabase types are updated
    const { data, error } = await (supabase as any)
      .from("inventory_suppliers")
      .select("name")
      .order("name");

    if (error) throw error;

    // If there are suppliers in the DB, return them
    if (data && data.length > 0) {
      return data.map(supplier => supplier.name);
    }

    // If no suppliers in DB, use default empty array
    return [];
  } catch (error) {
    console.error("Error fetching inventory suppliers:", error);
    return [];
  }
}

// Add a new inventory supplier
export async function addInventorySupplier(name: string): Promise<void> {
  try {
    // Use the any type to bypass TypeScript checking until Supabase types are updated
    const { error } = await (supabase as any)
      .from("inventory_suppliers")
      .insert({ name });

    if (error) throw error;
  } catch (error) {
    console.error("Error adding inventory supplier:", error);
    throw error;
  }
}

// Delete an inventory supplier
export async function deleteInventorySupplier(name: string): Promise<void> {
  try {
    // Use the any type to bypass TypeScript checking until Supabase types are updated
    const { error } = await (supabase as any)
      .from("inventory_suppliers")
      .delete()
      .eq("name", name);

    if (error) throw error;
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}
