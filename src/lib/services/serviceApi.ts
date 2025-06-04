
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
        .order('position', { ascending: true }),
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
              estimatedTime: job.estimated_time,
              price: job.price,
              subcategory_id: job.subcategory_id
            } as ServiceJob));

          return {
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            jobs: subcategoryJobs,
            category_id: subcategory.category_id
          } as ServiceSubcategory;
        });

      return {
        id: category.id,
        name: category.name,
        description: category.description,
        subcategories: categorySubcategories,
        position: category.position
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
