
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryRecord {
  name: string;
}

/**
 * Get all inventory categories from the database
 * @returns Array of category names
 */
export async function getInventoryCategories(): Promise<string[]> {
  try {
    console.log('Fetching inventory categories from database...');
    
    // Use a simple approach to avoid TypeScript type inference issues
    const { data, error } = await supabase.rpc('get_inventory_categories');
    
    if (error) {
      console.error('Error fetching categories from database:', error);
      // Fallback to direct query if RPC fails
      const fallbackResult = await supabase
        .from('inventory_categories')
        .select('name');
      
      if (fallbackResult.error) {
        throw fallbackResult.error;
      }
      
      const categories = (fallbackResult.data as any[])?.map((item: any) => item.name) || [];
      console.log(`Retrieved ${categories.length} categories from database (fallback)`);
      return categories;
    }
    
    const categoryNames = (data as string[]) || [];
    console.log(`Retrieved ${categoryNames.length} categories from database`);
    return categoryNames;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return [];
  }
}

/**
 * Create a new category
 * @param name Category name
 * @returns Created category or null if error
 */
export async function createCategory(name: string) {
  try {
    console.log('Creating new category:', name);
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert({ 
        name: name.trim(),
        is_active: true,
        display_order: 0
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Category created successfully:', data);
    toast.success(`Category "${name}" has been created`);
    
    return data;
  } catch (error: any) {
    console.error('Error creating category:', error);
    if (error.code === '23505') {
      toast.error(`Category "${name}" already exists`);
    } else {
      toast.error("Could not create category");
    }
    return null;
  }
}

/**
 * Add a new inventory category
 * @param name Category name
 * @returns Created category or null if error
 */
export async function addInventoryCategory(name: string) {
  return createCategory(name);
}

/**
 * Delete an inventory category
 * @param name Category name
 * @returns True if successful, false otherwise
 */
export async function deleteInventoryCategory(name: string): Promise<boolean> {
  try {
    console.log('Deleting category:', name);
    
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('name', name);
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    console.log('Category deleted successfully');
    toast.success(`Category "${name}" has been deleted`);
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error("Could not delete category");
    return false;
  }
}
