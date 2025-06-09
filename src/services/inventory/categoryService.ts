
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface CategoryRecord {
  name: string;
  description?: string;
  is_active?: boolean;
  display_order?: number;
}

interface InventoryCategory {
  id: string;
  name: string;
  description?: string;
  is_active: boolean;
  display_order: number;
}

/**
 * Get all inventory categories from the database with enhanced details
 * @returns Array of category objects with descriptions and display order
 */
export async function getInventoryCategories(): Promise<string[]> {
  try {
    console.log('Fetching comprehensive automotive inventory categories from database...');
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('name, description, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching categories from database:', error);
      throw error;
    }
    
    const records = (data as CategoryRecord[]) || [];
    const categoryNames = records.map(record => record.name);
    
    console.log(`Retrieved ${categoryNames.length} automotive categories from database`);
    return categoryNames;
  } catch (error) {
    console.error('Error fetching inventory categories:', error);
    return [];
  }
}

/**
 * Get all inventory categories with full details
 * @returns Array of category objects with all details
 */
export async function getInventoryCategoriesWithDetails(): Promise<InventoryCategory[]> {
  try {
    console.log('Fetching detailed automotive inventory categories from database...');
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .select('id, name, description, is_active, display_order')
      .eq('is_active', true)
      .order('display_order', { ascending: true });
    
    if (error) {
      console.error('Error fetching detailed categories from database:', error);
      throw error;
    }
    
    const categories = (data as InventoryCategory[]) || [];
    console.log(`Retrieved ${categories.length} detailed automotive categories from database`);
    return categories;
  } catch (error) {
    console.error('Error fetching detailed inventory categories:', error);
    return [];
  }
}

/**
 * Create a new category
 * @param name Category name
 * @param description Optional category description
 * @param displayOrder Optional display order
 * @returns Created category or null if error
 */
export async function createCategory(name: string, description?: string, displayOrder?: number) {
  try {
    console.log('Creating new automotive category:', name);
    
    // Get the next display order if not provided
    let nextOrder = displayOrder;
    if (!nextOrder) {
      const { data: maxOrderData } = await supabase
        .from('inventory_categories')
        .select('display_order')
        .order('display_order', { ascending: false })
        .limit(1);
      
      nextOrder = (maxOrderData?.[0]?.display_order || 0) + 1;
    }
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .insert({ 
        name: name.trim(),
        description: description?.trim(),
        is_active: true,
        display_order: nextOrder
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }
    
    console.log('Automotive category created successfully:', data);
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
 * @param description Optional category description
 * @returns Created category or null if error
 */
export async function addInventoryCategory(name: string, description?: string) {
  return createCategory(name, description);
}

/**
 * Update an inventory category
 * @param id Category ID
 * @param updates Object with fields to update
 * @returns Updated category or null if error
 */
export async function updateInventoryCategory(id: string, updates: Partial<InventoryCategory>) {
  try {
    console.log('Updating automotive category:', id);
    
    const { data, error } = await supabase
      .from('inventory_categories')
      .update(updates)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }
    
    console.log('Automotive category updated successfully:', data);
    toast.success(`Category has been updated`);
    
    return data;
  } catch (error) {
    console.error('Error updating category:', error);
    toast.error("Could not update category");
    return null;
  }
}

/**
 * Delete an inventory category
 * @param name Category name
 * @returns True if successful, false otherwise
 */
export async function deleteInventoryCategory(name: string): Promise<boolean> {
  try {
    console.log('Deleting automotive category:', name);
    
    const { error } = await supabase
      .from('inventory_categories')
      .delete()
      .eq('name', name);
    
    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }
    
    console.log('Automotive category deleted successfully');
    toast.success(`Category "${name}" has been deleted`);
    
    return true;
  } catch (error) {
    console.error('Error deleting category:', error);
    toast.error("Could not delete category");
    return false;
  }
}

/**
 * Get categories organized by automotive systems
 * @returns Object with categories grouped by system type
 */
export async function getCategoriesBySystem() {
  try {
    const categories = await getInventoryCategoriesWithDetails();
    
    const systemGroups = {
      'Engine & Powertrain': [
        'Engine Parts', 'Transmission', 'Fuel System', 'Cooling System', 
        'Exhaust System', 'Drivetrain', 'Belts & Hoses'
      ],
      'Chassis & Safety': [
        'Braking System', 'Suspension', 'Steering', 'Safety Equipment',
        'Tires & Wheels'
      ],
      'Electrical & Comfort': [
        'Electrical Components', 'HVAC Components', 'Lighting'
      ],
      'Body & Interior': [
        'Body Parts', 'Interior Parts', 'Exterior Parts'
      ],
      'Maintenance & Tools': [
        'Maintenance & Fluids', 'Tools', 'Consumables', 'Fasteners & Hardware'
      ],
      'Aftermarket & Accessories': [
        'Performance Parts', 'Accessories'
      ]
    };
    
    const groupedCategories: Record<string, InventoryCategory[]> = {};
    
    Object.entries(systemGroups).forEach(([system, categoryNames]) => {
      groupedCategories[system] = categories.filter(cat => 
        categoryNames.includes(cat.name)
      );
    });
    
    return groupedCategories;
  } catch (error) {
    console.error('Error grouping categories by system:', error);
    return {};
  }
}
