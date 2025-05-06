
import { supabase } from '@/lib/supabase';
import { toast } from '@/hooks/use-toast';

/**
 * Get all inventory categories from the database
 * @returns Array of category names
 */
export async function getInventoryCategories(): Promise<string[]> {
  try {
    // First try to get existing categories
    const { data: categories, error } = await supabase
      .from('inventory_categories')
      .select('name')
      .order('name');
    
    if (error) throw error;
    
    // Extract category names
    const categoryNames = categories.map(cat => cat.name);
    
    // If no categories exist, try to initialize defaults (but don't error if this fails)
    if (categoryNames.length === 0) {
      try {
        await initializeDefaultCategories();
        // Try to fetch again after initializing
        const { data: updatedCategories, error: refetchError } = await supabase
          .from('inventory_categories')
          .select('name')
          .order('name');
        
        if (!refetchError && updatedCategories.length > 0) {
          return updatedCategories.map(cat => cat.name);
        }
        
        // If we still don't have categories, return default ones for UI
        if (categoryNames.length === 0) {
          // Return fallback categories for UI without DB persistence
          return ['Electrical', 'Engine', 'Brakes', 'Suspension', 'Body', 'Interior', 'Fluids', 'Other'];
        }
      } catch (initError) {
        console.error('Error initializing default categories:', initError);
        // Return fallback categories if initialization fails
        return ['Electrical', 'Engine', 'Brakes', 'Suspension', 'Body', 'Interior', 'Fluids', 'Other'];
      }
    }
    
    return categoryNames;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    // Fallback categories if everything fails
    return ['Electrical', 'Engine', 'Brakes', 'Suspension', 'Body', 'Interior', 'Fluids', 'Other'];
  }
}

/**
 * Create a new category
 * @param name Category name
 * @returns Created category or null if error
 */
export async function createCategory(name: string) {
  try {
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert({ name })
      .select()
      .single();
    
    if (error) throw error;
    
    toast({
      title: "Category created",
      description: `Category "${name}" has been created`,
    });
    
    return data;
  } catch (error) {
    console.error('Error creating category:', error);
    toast({
      title: "Error",
      description: "Could not create category",
      variant: "destructive",
    });
    return null;
  }
}

/**
 * Add a new inventory category
 * @param name Category name
 * @returns Created category or null if error
 */
export async function addInventoryCategory(name: string) {
  // This function is just an alias for createCategory for backward compatibility
  return createCategory(name);
}

/**
 * Delete an inventory category
 * @param name Category name
 * @returns True if successful, false otherwise
 */
export async function deleteInventoryCategory(name: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('name', name);
    
    if (error) throw error;
    
    toast({
      title: "Category deleted",
      description: `Category "${name}" has been deleted`,
    });
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast({
      title: "Error",
      description: "Could not delete category",
      variant: "destructive",
    });
    return false;
  }
}

/**
 * Initialize default categories if none exist
 * This function should not throw - silently fail if RLS prevents this
 */
async function initializeDefaultCategories() {
  const defaultCategories = [
    { name: 'Electrical' },
    { name: 'Engine' },
    { name: 'Brakes' },
    { name: 'Suspension' },
    { name: 'Body' },
    { name: 'Interior' },
    { name: 'Fluids' },
    { name: 'Other' }
  ];
  
  try {
    const { error } = await supabase
      .from('inventory_categories')
      .insert(defaultCategories);
    
    if (error) {
      console.error('Error initializing default categories:', error);
    }
  } catch (error) {
    console.error('Exception initializing default categories:', error);
  }
}
