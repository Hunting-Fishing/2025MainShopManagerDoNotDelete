
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Get inventory suppliers from the database
export async function getInventorySuppliers(): Promise<string[]> {
  try {
    console.log('Fetching inventory suppliers from database...');
    
    // Get unique suppliers from inventory_items table
    const { data, error } = await supabase
      .from("inventory_items")
      .select("supplier")
      .not("supplier", "is", null)
      .not("supplier", "eq", "");

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Extract unique supplier names
    const uniqueSuppliers = [...new Set(
      data?.map(item => item.supplier).filter(Boolean) || []
    )].sort();
    
    console.log(`Retrieved ${uniqueSuppliers.length} unique suppliers from database`);
    return uniqueSuppliers;
  } catch (error) {
    console.error("Error fetching inventory suppliers:", error);
    return [];
  }
}

// This function will be used to update supplier info in items, not to create standalone suppliers
export async function addInventorySupplier(name: string): Promise<void> {
  // Since we're getting suppliers from inventory_items, we just need to validate the name
  if (!name.trim()) {
    throw new Error('Supplier name cannot be empty');
  }
  
  console.log('Supplier name validated:', name);
  toast.success(`Supplier "${name}" is ready to be used in inventory items`);
}

// Delete supplier references from inventory items
export async function deleteInventorySupplier(name: string): Promise<void> {
  try {
    console.log('Removing supplier references:', name);
    
    // Update all inventory items to remove this supplier reference
    const { error } = await supabase
      .from("inventory_items")
      .update({ supplier: null })
      .eq("supplier", name);

    if (error) {
      console.error('Error removing supplier references:', error);
      throw error;
    }
    
    console.log('Supplier references removed successfully');
    toast.success(`Removed supplier "${name}" from all inventory items`);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}
