
import { supabase } from "@/lib/supabase";

// Get all inventory categories
export async function getInventoryCategories(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('name')
      .order('name');

    if (error) {
      throw error;
    }

    return data?.map(cat => cat.name) || [];
  } catch (error) {
    console.error('Error getting inventory categories:', error);
    return [
      'Parts',
      'Tools',
      'Consumables',
      'Lubricants',
      'Electronics',
      'Hardware',
      'Other'
    ];
  }
}

// Add a new inventory category
export async function addInventoryCategory(name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory_categories')
      .insert({ name });

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding inventory category:', error);
    return false;
  }
}
