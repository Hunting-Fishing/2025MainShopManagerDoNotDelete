
import { supabase } from "@/lib/supabase";

// Get all inventory suppliers
export const getInventorySuppliers = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_suppliers')
      .select('name')
      .order('name');

    if (error) {
      throw error;
    }

    return data?.map(supplier => supplier.name) || [];
  } catch (error) {
    console.error('Error fetching inventory suppliers:', error);
    return [];
  }
};

// Add a new inventory supplier
export const addInventorySupplier = async (name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_suppliers')
      .insert([{ name }]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding inventory supplier:', error);
    return false;
  }
};

// Delete an inventory supplier
export const deleteInventorySupplier = async (name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_suppliers')
      .delete()
      .eq('name', name);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inventory supplier:', error);
    return false;
  }
};
