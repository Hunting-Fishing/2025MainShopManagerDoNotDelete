
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories...');
    
    // First, try to fetch categories with a simplified query structure
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select(`
        id,
        name,
        description,
        service_subcategories (
          id,
          name,
          description,
          service_jobs (
            id,
            name,
            description,
            estimated_time,
            price
          )
        )
      `)
      .order('name', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching service categories:', categoriesError);
      return [];
    }

    if (!categories || categories.length === 0) {
      console.warn('No service categories found in database');
      return [];
    }

    console.log('Raw categories data:', categories);

    // Transform the data to match our ServiceMainCategory type with error handling
    const transformedCategories: ServiceMainCategory[] = categories.map(category => {
      // Safely handle subcategories
      const subcategories = Array.isArray(category.service_subcategories) 
        ? category.service_subcategories 
        : [];

      return {
        id: category.id,
        name: category.name || 'Unnamed Category',
        description: category.description || undefined,
        subcategories: subcategories.map(subcategory => {
          // Safely handle jobs
          const jobs = Array.isArray(subcategory.service_jobs) 
            ? subcategory.service_jobs 
            : [];

          return {
            id: subcategory.id,
            name: subcategory.name || 'Unnamed Subcategory',
            description: subcategory.description || undefined,
            category_id: category.id,
            jobs: jobs.map(job => ({
              id: job.id,
              name: job.name || 'Unnamed Job',
              description: job.description || undefined,
              estimatedTime: job.estimated_time || undefined,
              price: job.price ? Number(job.price) : undefined,
              subcategory_id: subcategory.id
            }))
          };
        })
      };
    });

    console.log('Transformed categories:', transformedCategories);
    return transformedCategories;
    
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    return [];
  }
}

export async function updateServiceCategory(
  categoryId: string, 
  updates: { name?: string; description?: string }
): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to update service category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
}

export async function deleteServiceCategory(categoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete service category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
}

export async function deleteServiceSubcategory(subcategoryId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      throw new Error(`Failed to delete service subcategory: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw error;
  }
}

export async function deleteServiceJob(jobId: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      throw new Error(`Failed to delete service job: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw error;
  }
}

// Additional helper functions for creating new services
export async function createServiceCategory(
  category: { name: string; description?: string; position?: number }
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert([category])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create service category: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error creating service category:', error);
    throw error;
  }
}

export async function createServiceSubcategory(
  subcategory: { 
    category_id: string; 
    name: string; 
    description?: string; 
    position?: number;
  }
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert([subcategory])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create service subcategory: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error creating service subcategory:', error);
    throw error;
  }
}

export async function createServiceJob(
  job: {
    subcategory_id: string;
    name: string;
    description?: string;
    estimated_time?: number;
    price?: number;
    position?: number;
  }
): Promise<string> {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .insert([job])
      .select('id')
      .single();

    if (error) {
      throw new Error(`Failed to create service job: ${error.message}`);
    }

    return data.id;
  } catch (error) {
    console.error('Error creating service job:', error);
    throw error;
  }
}
