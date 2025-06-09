
import { supabase } from "@/integrations/supabase/client";
import { toast } from 'sonner';

// Get inventory suppliers from the dedicated suppliers table
export async function getInventorySuppliers(): Promise<string[]> {
  try {
    console.log('Fetching inventory suppliers from suppliers table...');
    
    // Get suppliers from the dedicated inventory_suppliers table
    const { data, error } = await supabase
      .from("inventory_suppliers")
      .select("name")
      .order("name");

    if (error) {
      console.error('Error fetching suppliers:', error);
      throw error;
    }

    // Extract supplier names with explicit type annotation
    const supplierNames: string[] = data?.map((item: { name: string }) => item.name).filter((name): name is string => Boolean(name)) || [];
    
    console.log(`Retrieved ${supplierNames.length} suppliers from database`);
    return supplierNames;
  } catch (error) {
    console.error("Error fetching inventory suppliers:", error);
    return [];
  }
}

// Add a new supplier to the dedicated suppliers table
export async function addInventorySupplier(name: string): Promise<void> {
  try {
    if (!name.trim()) {
      throw new Error('Supplier name cannot be empty');
    }

    console.log('Adding supplier to database:', name);
    
    // Check if supplier already exists
    const { data: existing, error: checkError } = await supabase
      .from("inventory_suppliers")
      .select("id")
      .eq("name", name.trim())
      .single();

    if (checkError && checkError.code !== 'PGRST116') {
      throw checkError;
    }

    if (existing) {
      console.log('Supplier already exists:', name);
      toast.success(`Supplier "${name}" is already available`);
      return;
    }

    // Add new supplier
    const { error } = await supabase
      .from("inventory_suppliers")
      .insert({
        name: name.trim()
      });

    if (error) {
      console.error('Error adding supplier:', error);
      throw error;
    }
    
    console.log('Supplier added successfully:', name);
    toast.success(`Supplier "${name}" has been added successfully`);
  } catch (error) {
    console.error("Error adding supplier:", error);
    throw error;
  }
}

// Delete supplier from the suppliers table
export async function deleteInventorySupplier(name: string): Promise<void> {
  try {
    console.log('Removing supplier from database:', name);
    
    const { error } = await supabase
      .from("inventory_suppliers")
      .delete()
      .eq("name", name);

    if (error) {
      console.error('Error removing supplier:', error);
      throw error;
    }
    
    console.log('Supplier removed successfully');
    toast.success(`Supplier "${name}" has been removed`);
  } catch (error) {
    console.error("Error deleting supplier:", error);
    throw error;
  }
}
