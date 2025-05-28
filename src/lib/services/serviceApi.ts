
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
