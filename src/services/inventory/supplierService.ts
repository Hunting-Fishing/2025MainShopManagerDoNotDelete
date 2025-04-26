
import { supabase } from "@/lib/supabase";

// Get all inventory suppliers
export async function getInventorySuppliers(): Promise<string[]> {
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
    console.error('Error getting inventory suppliers:', error);
    return [
      'Ace Auto Parts',
      'Tech Automotive',
      'Quality Suppliers',
      'FastTech Parts',
      'Premier Auto Supply',
      'Other'
    ];
  }
}

// Add a new inventory supplier
export async function addInventorySupplier(name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory_suppliers')
      .insert({ name });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding inventory supplier:', error);
    return false;
  }
}
