
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

/**
 * Fetch service categories from the database
 */
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories from database...');
    
    // Fetch all categories, subcategories, and jobs in separate queries
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

    if (categoriesResult.error) throw categoriesResult.error;
    if (subcategoriesResult.error) throw subcategoriesResult.error;
    if (jobsResult.error) throw jobsResult.error;

    // Build the hierarchical structure
    const hierarchicalCategories: ServiceMainCategory[] = categoriesResult.data.map(category => {
      const categorySubcategories = subcategoriesResult.data
        .filter(sub => sub.category_id === category.id)
        .map(subcategory => {
          const subcategoryJobs = jobsResult.data
            .filter(job => job.subcategory_id === subcategory.id)
            .map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              estimatedTime: job.estimated_time,
              price: job.price
            } as ServiceJob));

          return {
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            jobs: subcategoryJobs
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

    console.log('Successfully loaded service categories from database:', {
      categoriesCount: hierarchicalCategories.length,
      totalJobs: hierarchicalCategories.reduce((total, cat) => 
        total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0)
    });

    return hierarchicalCategories;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to load service categories from database');
  }
};

/**
 * Get all service jobs flattened from categories
 */
export const fetchAllServiceJobs = async () => {
  const categories = await fetchServiceCategories();
  return categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => 
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name
      }))
    )
  );
};

/**
 * Search for services by name or description
 */
export const searchServices = async (query: string) => {
  const allJobs = await fetchAllServiceJobs();
  const lowercaseQuery = query.toLowerCase();
  
  return allJobs.filter(job => 
    job.name.toLowerCase().includes(lowercaseQuery) ||
    (job.description && job.description.toLowerCase().includes(lowercaseQuery)) ||
    job.categoryName.toLowerCase().includes(lowercaseQuery) ||
    job.subcategoryName.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Create a new service category
 */
export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id' | 'subcategories'>) => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description,
        position: category.position || 0
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Created service category:', data);
    return { success: true, category: data };
  } catch (error) {
    console.error('Error creating service category:', error);
    throw new Error('Failed to create service category');
  }
};

/**
 * Update service category
 */
export const updateServiceCategory = async (categoryId: string, updates: Partial<ServiceMainCategory>) => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update({
        name: updates.name,
        description: updates.description,
        position: updates.position
      })
      .eq('id', categoryId)
      .select()
      .single();

    if (error) throw error;

    console.log('Updated service category:', categoryId, updates);
    return { success: true, category: data };
  } catch (error) {
    console.error('Error updating service category:', error);
    throw new Error('Failed to update service category');
  }
};

/**
 * Delete service category
 */
export const deleteServiceCategory = async (categoryId: string) => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) throw error;

    console.log('Deleted service category:', categoryId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw new Error('Failed to delete service category');
  }
};

/**
 * Create a new service subcategory
 */
export const createServiceSubcategory = async (subcategory: Omit<ServiceSubcategory, 'id' | 'jobs'> & { category_id: string }) => {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert({
        category_id: subcategory.category_id,
        name: subcategory.name,
        description: subcategory.description
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Created service subcategory:', data);
    return { success: true, subcategory: data };
  } catch (error) {
    console.error('Error creating service subcategory:', error);
    throw new Error('Failed to create service subcategory');
  }
};

/**
 * Update service subcategory
 */
export const updateServiceSubcategory = async (subcategoryId: string, updates: Partial<ServiceSubcategory>) => {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .update({
        name: updates.name,
        description: updates.description
      })
      .eq('id', subcategoryId)
      .select()
      .single();

    if (error) throw error;

    console.log('Updated service subcategory:', subcategoryId, updates);
    return { success: true, subcategory: data };
  } catch (error) {
    console.error('Error updating service subcategory:', error);
    throw new Error('Failed to update service subcategory');
  }
};

/**
 * Delete service subcategory
 */
export const deleteServiceSubcategory = async (subcategoryId: string) => {
  try {
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) throw error;

    console.log('Deleted service subcategory:', subcategoryId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error('Failed to delete service subcategory');
  }
};

/**
 * Create a new service job
 */
export const createServiceJob = async (job: Omit<ServiceJob, 'id'> & { subcategory_id: string }) => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .insert({
        subcategory_id: job.subcategory_id,
        name: job.name,
        description: job.description,
        estimated_time: job.estimatedTime,
        price: job.price
      })
      .select()
      .single();

    if (error) throw error;

    console.log('Created service job:', data);
    return { success: true, job: data };
  } catch (error) {
    console.error('Error creating service job:', error);
    throw new Error('Failed to create service job');
  }
};

/**
 * Update service job
 */
export const updateServiceJob = async (jobId: string, updates: Partial<ServiceJob>) => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .update({
        name: updates.name,
        description: updates.description,
        estimated_time: updates.estimatedTime,
        price: updates.price
      })
      .eq('id', jobId)
      .select()
      .single();

    if (error) throw error;

    console.log('Updated service job:', jobId, updates);
    return { success: true, job: data };
  } catch (error) {
    console.error('Error updating service job:', error);
    throw new Error('Failed to update service job');
  }
};

/**
 * Delete service job
 */
export const deleteServiceJob = async (jobId: string) => {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) throw error;

    console.log('Deleted service job:', jobId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw new Error('Failed to delete service job');
  }
};
