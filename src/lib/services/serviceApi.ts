
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

/**
 * Centralized service data fetching - single source of truth
 * This should be the ONLY function used to fetch service categories
 */
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('🔄 Fetching service categories from Supabase...');
    
    // Fetch all data in parallel for better performance
    const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase
        .from('service_categories')
        .select('*')
        .order('display_order', { ascending: true }),
      supabase
        .from('service_subcategories')
        .select('*')
        .order('name', { ascending: true }),
      supabase
        .from('service_jobs')
        .select('*')
        .order('name', { ascending: true })
    ]);

    // Check for errors
    if (categoriesResult.error) {
      console.error('❌ Error fetching categories:', categoriesResult.error);
      throw categoriesResult.error;
    }
    if (subcategoriesResult.error) {
      console.error('❌ Error fetching subcategories:', subcategoriesResult.error);
      throw subcategoriesResult.error;
    }
    if (jobsResult.error) {
      console.error('❌ Error fetching jobs:', jobsResult.error);
      throw jobsResult.error;
    }

    const categories = categoriesResult.data || [];
    const subcategories = subcategoriesResult.data || [];
    const jobs = jobsResult.data || [];

    console.log('✅ Service data fetched:', {
      categories: categories.length,
      subcategories: subcategories.length,
      jobs: jobs.length
    });

    // Build hierarchical structure
    const hierarchicalCategories: ServiceMainCategory[] = categories.map(category => {
      const categorySubcategories = subcategories
        .filter(sub => sub.category_id === category.id)
        .map(subcategory => {
          const subcategoryJobs = jobs
            .filter(job => job.subcategory_id === subcategory.id)
            .map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              estimatedTime: job.estimated_duration,
              price: job.base_price,
              subcategory_id: job.subcategory_id,
              category_id: job.category_id,
              base_price: job.base_price,
              estimated_duration: job.estimated_duration,
              skill_level: job.skill_level,
              display_order: job.display_order,
              is_active: job.is_active
            } as ServiceJob));

          return {
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            jobs: subcategoryJobs,
            category_id: subcategory.category_id,
            display_order: subcategory.display_order
          } as ServiceSubcategory;
        });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        subcategories: categorySubcategories,
        display_order: category.display_order,
        is_active: category.is_active,
        position: category.display_order // for backward compatibility
      } as ServiceMainCategory;
    });

    console.log('🏗️ Built hierarchical structure with', hierarchicalCategories.length, 'categories');
    return hierarchicalCategories;

  } catch (error) {
    console.error('❌ Failed to fetch service categories:', error);
    throw new Error(`Failed to fetch service categories: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
};

// Deprecated - use fetchServiceCategories instead
export const getServiceCategories = fetchServiceCategories;

// Helper function to get a flattened list of all jobs
export const fetchAllServiceJobs = async (): Promise<ServiceJob[]> => {
  const categories = await fetchServiceCategories();
  return categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => subcategory.jobs)
  );
};

// Helper function to search jobs by name
export const searchServiceJobs = async (query: string): Promise<ServiceJob[]> => {
  const allJobs = await fetchAllServiceJobs();
  return allJobs.filter(job => 
    job.name.toLowerCase().includes(query.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(query.toLowerCase()))
  );
};

// Update functions for service management
export const updateServiceCategory = async (id: string, updates: Partial<{ name: string; description: string; position: number }>) => {
  const { error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceSubcategory = async (id: string, updates: Partial<{ name: string; description: string }>) => {
  const { error } = await supabase
    .from('service_subcategories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceJob = async (id: string, updates: Partial<{ name: string; description: string; estimated_time: number; price: number }>) => {
  const { error } = await supabase
    .from('service_jobs')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

// Delete functions for service management
export const deleteServiceCategory = async (id: string) => {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceSubcategory = async (id: string) => {
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceJob = async (id: string) => {
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
