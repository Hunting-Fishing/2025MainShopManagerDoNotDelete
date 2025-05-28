
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories from database...');
    
    const { data, error } = await supabase
      .from('service_hierarchy')
      .select('*')
      .order('position');

    if (error) {
      console.error('Database error:', error);
      throw new Error(`Failed to fetch service categories: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No service categories found in database');
      return [];
    }

    console.log('Raw database data:', data);

    // Transform the database data into the expected format
    const categories: ServiceMainCategory[] = data.map(row => {
      // Parse the subcategories JSON
      let subcategories: ServiceSubcategory[] = [];
      
      if (row.subcategories) {
        try {
          const subcategoriesData = typeof row.subcategories === 'string' 
            ? JSON.parse(row.subcategories) 
            : row.subcategories;
          
          if (Array.isArray(subcategoriesData)) {
            subcategories = subcategoriesData.map((sub: any, subIndex: number) => ({
              id: sub.id || `sub-${row.id}-${subIndex}`,
              name: sub.name || 'Unnamed Subcategory',
              description: sub.description || '',
              jobs: Array.isArray(sub.jobs) ? sub.jobs.map((job: any, jobIndex: number) => ({
                id: job.id || `job-${row.id}-${subIndex}-${jobIndex}`,
                name: job.name || 'Unnamed Job',
                description: job.description || '',
                estimatedTime: job.estimatedTime || job.estimated_time || undefined,
                price: job.price || undefined
              })) : []
            }));
          }
        } catch (parseError) {
          console.error('Error parsing subcategories JSON for category:', row.name, parseError);
        }
      }

      return {
        id: row.id,
        name: row.name,
        description: row.description || '',
        subcategories,
        position: row.position || 0
      };
    });

    console.log('Transformed categories:', categories);
    return categories;

  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
};

export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> => {
  try {
    const { data, error } = await supabase
      .from('service_hierarchy')
      .insert({
        name: category.name,
        description: category.description,
        subcategories: JSON.stringify(category.subcategories || []),
        position: category.position || 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create service category: ${error.message}`);
    }

    // Transform the returned data
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      subcategories: data.subcategories ? JSON.parse(data.subcategories) : [],
      position: data.position || 0
    };
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
      .from('service_hierarchy')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to update service category: ${error.message}`);
    }

    // Transform the returned data
    return {
      id: data.id,
      name: data.name,
      description: data.description || '',
      subcategories: data.subcategories ? JSON.parse(data.subcategories) : [],
      position: data.position || 0
    };
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .delete()
      .eq('id', id);

    if (error) {
      throw new Error(`Failed to delete service category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const saveServiceCategory = createServiceCategory;

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  try {
    // Fetch the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('subcategories')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch category: ${fetchError.message}`);
    }

    // Parse subcategories and remove the specified one
    const subcategories = category.subcategories ? JSON.parse(category.subcategories) : [];
    const updatedSubcategories = subcategories.filter((sub: any) => sub.id !== subcategoryId);

    // Update the category with the new subcategories
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) {
      throw new Error(`Failed to delete subcategory: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw error;
  }
};

export const deleteServiceJob = async (categoryId: string, subcategoryId: string, jobId: string): Promise<void> => {
  try {
    // Fetch the current category
    const { data: category, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('subcategories')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch category: ${fetchError.message}`);
    }

    // Parse subcategories and update the specified one
    const subcategories = category.subcategories ? JSON.parse(category.subcategories) : [];
    const updatedSubcategories = subcategories.map((sub: any) => {
      if (sub.id === subcategoryId) {
        return {
          ...sub,
          jobs: (sub.jobs || []).filter((job: any) => job.id !== jobId)
        };
      }
      return sub;
    });

    // Update the category with the new subcategories
    const { error: updateError } = await supabase
      .from('service_hierarchy')
      .update({ subcategories: JSON.stringify(updatedSubcategories) })
      .eq('id', categoryId);

    if (updateError) {
      throw new Error(`Failed to delete job: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw error;
  }
};

export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  try {
    if (type === 'category') {
      await deleteServiceCategory(itemId);
    } else {
      // For subcategories and jobs, we need more context to identify which category they belong to
      // This is a simplified implementation - in practice, you might need to search through all categories
      throw new Error('Removing duplicates for subcategories and jobs requires category context');
    }
  } catch (error) {
    console.error('Error removing duplicate item:', error);
    throw error;
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[], 
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const total = categories.length;
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Check if category already exists
      const { data: existing } = await supabase
        .from('service_hierarchy')
        .select('id')
        .eq('name', category.name)
        .single();

      if (existing) {
        // Update existing category
        await updateServiceCategory(existing.id, category);
      } else {
        // Create new category
        await createServiceCategory(category);
      }

      // Report progress
      if (onProgress) {
        onProgress(((i + 1) / total) * 100);
      }
    }
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw error;
  }
};
