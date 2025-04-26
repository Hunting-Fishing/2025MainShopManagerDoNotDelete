
import { supabase } from "@/lib/supabase";

// Get all inventory categories
export const getInventoryCategories = async (): Promise<string[]> => {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('name')
      .order('name');

    if (error) {
      throw error;
    }

    return data?.map(category => category.name) || [];
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return [];
  }
};

// Add a new inventory category
export const addInventoryCategory = async (name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_categories')
      .insert([{ name }]);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error adding inventory category:', error);
    return false;
  }
};

// Delete an inventory category
export const deleteInventoryCategory = async (name: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('name', name);

    if (error) {
      throw error;
    }

    return true;
  } catch (error) {
    console.error('Error deleting inventory category:', error);
    return false;
  }
};
