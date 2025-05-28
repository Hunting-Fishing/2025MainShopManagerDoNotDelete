
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories from database...');
    
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    console.log('Raw database data:', data);

    if (!data || data.length === 0) {
      console.log('No service categories found in database');
      return [];
    }

    // Transform database records to ServiceMainCategory format
    const categories: ServiceMainCategory[] = data.map((record: any) => {
      let subcategories: ServiceSubcategory[] = [];
      
      try {
        if (record.subcategories) {
          if (typeof record.subcategories === 'string') {
            subcategories = JSON.parse(record.subcategories);
          } else if (Array.isArray(record.subcategories)) {
            subcategories = record.subcategories;
          }
        }
      } catch (parseError) {
        console.error('Error parsing subcategories for category:', record.name, parseError);
        subcategories = [];
      }

      return {
        id: record.id,
        name: record.name,
        description: record.description || '',
        subcategories: subcategories,
        position: record.position
      };
    });

    console.log('Transformed categories:', categories);
    return categories;

  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error(`Failed to fetch service categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const saveServiceCategories = async (categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Saving service categories to database...', categories);

    // Delete existing categories first
    const { error: deleteError } = await supabase
      .from('service_categories')
      .delete()
      .gte('id', '00000000-0000-0000-0000-000000000000');

    if (deleteError && deleteError.code !== 'PGRST116') {
      console.error('Error deleting existing categories:', deleteError);
      throw deleteError;
    }

    // Prepare data for insertion
    const categoriesToSave = categories.map((category, index) => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      position: category.position || index,
      subcategories: JSON.stringify(category.subcategories || [])
    }));

    console.log('Categories to save:', categoriesToSave);

    // Insert new categories
    const { data, error } = await supabase
      .from('service_categories')
      .insert(categoriesToSave)
      .select();

    if (error) {
      console.error('Error saving categories:', error);
      throw error;
    }

    console.log('Successfully saved categories:', data);
    return categories;

  } catch (error) {
    console.error('Error in saveServiceCategories:', error);
    throw new Error(`Failed to save service categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const saveServiceCategory = saveServiceCategories;

export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> => {
  try {
    const newCategory: ServiceMainCategory = {
      id: crypto.randomUUID(),
      ...category,
      subcategories: category.subcategories || []
    };

    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        id: newCategory.id,
        name: newCategory.name,
        description: newCategory.description || '',
        position: newCategory.position || 0,
        subcategories: JSON.stringify(newCategory.subcategories)
      })
      .select()
      .single();

    if (error) throw error;

    return newCategory;
  } catch (error) {
    console.error('Error creating service category:', error);
    throw error;
  }
};

export const updateServiceCategory = async (id: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  try {
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.position !== undefined) updateData.position = updates.position;
    if (updates.subcategories !== undefined) {
      updateData.subcategories = JSON.stringify(updates.subcategories);
    }

    const { data, error } = await supabase
      .from('service_categories')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Transform back to ServiceMainCategory
    let subcategories: ServiceSubcategory[] = [];
    try {
      if (data.subcategories) {
        subcategories = typeof data.subcategories === 'string' 
          ? JSON.parse(data.subcategories) 
          : data.subcategories;
      }
    } catch (parseError) {
      console.error('Error parsing subcategories:', parseError);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      subcategories,
      position: data.position
    };
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (error) throw error;
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  try {
    // Fetch the current category
    const { data, error: fetchError } = await supabase
      .from('service_categories')
      .select('subcategories')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Parse subcategories and remove the specified one
    let subcategories: ServiceSubcategory[] = [];
    try {
      if (data.subcategories) {
        subcategories = typeof data.subcategories === 'string' 
          ? JSON.parse(data.subcategories) 
          : data.subcategories;
      }
    } catch (parseError) {
      console.error('Error parsing subcategories:', parseError);
    }

    // Filter out the subcategory to delete
    const updatedSubcategories = subcategories.filter(sub => sub.id !== subcategoryId);

    // Update the category with the new subcategories
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw error;
  }
};

export const deleteServiceJob = async (categoryId: string, subcategoryId: string, jobId: string): Promise<void> => {
  try {
    // Fetch the current category
    const { data, error: fetchError } = await supabase
      .from('service_categories')
      .select('subcategories')
      .eq('id', categoryId)
      .single();

    if (fetchError) throw fetchError;

    // Parse subcategories
    let subcategories: ServiceSubcategory[] = [];
    try {
      if (data.subcategories) {
        subcategories = typeof data.subcategories === 'string' 
          ? JSON.parse(data.subcategories) 
          : data.subcategories;
      }
    } catch (parseError) {
      console.error('Error parsing subcategories:', parseError);
    }

    // Find the subcategory and remove the job
    const updatedSubcategories = subcategories.map(subcategory => {
      if (subcategory.id === subcategoryId) {
        return {
          ...subcategory,
          jobs: subcategory.jobs.filter(job => job.id !== jobId)
        };
      }
      return subcategory;
    });

    // Update the category with the new subcategories
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw error;
  }
};

export const bulkImportServiceCategories = async (categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Starting bulk import of service categories...');
    
    // Save the categories using the existing save function
    const result = await saveServiceCategories(categories);
    
    console.log('Bulk import completed successfully');
    return result;
  } catch (error) {
    console.error('Error in bulk import:', error);
    throw new Error(`Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

export const removeDuplicateItem = async (itemId: string, itemType: 'category' | 'subcategory' | 'job'): Promise<void> => {
  try {
    console.log(`Removing duplicate ${itemType} with ID: ${itemId}`);
    
    if (itemType === 'category') {
      await deleteServiceCategory(itemId);
    } else {
      // For subcategories and jobs, we need more context to remove them
      // This is a simplified implementation
      console.warn(`Removing ${itemType} requires additional context (category/subcategory IDs)`);
    }
  } catch (error) {
    console.error(`Error removing duplicate ${itemType}:`, error);
    throw error;
  }
};
