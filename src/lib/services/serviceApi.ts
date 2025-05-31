
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    // Fetch categories with their subcategories and jobs
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select(`
        id,
        name,
        description,
        position,
        service_subcategories (
          id,
          name,
          description,
          position,
          service_jobs (
            id,
            name,
            description,
            estimated_time,
            price,
            position
          )
        )
      `)
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching service categories:', categoriesError);
      return [];
    }

    if (!categories || categories.length === 0) {
      console.warn('No service categories found in database');
      return [];
    }

    // Transform the data to match our ServiceMainCategory type
    const transformedCategories: ServiceMainCategory[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      position: category.position || undefined,
      subcategories: (category.service_subcategories || [])
        .sort((a, b) => (a.position || 0) - (b.position || 0))
        .map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description || undefined,
          category_id: category.id,
          jobs: (subcategory.service_jobs || [])
            .sort((a, b) => (a.position || 0) - (b.position || 0))
            .map(job => ({
              id: job.id,
              name: job.name,
              description: job.description || undefined,
              estimatedTime: job.estimated_time || undefined,
              price: job.price ? Number(job.price) : undefined,
              subcategory_id: subcategory.id
            }))
        }))
    }));

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
