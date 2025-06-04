
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory } from '@/types/serviceHierarchy';

// Live database service functions
export const fetchServiceCategoriesFromDB = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('🔄 Fetching service categories from database...');
    
    // Fetch categories with subcategories and jobs
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select(`
        id,
        name,
        description,
        position,
        is_active
      `)
      .eq('is_active', true)
      .order('position');

    if (categoriesError) throw categoriesError;

    if (!categories || categories.length === 0) {
      console.log('📋 No categories found in database, using fallback data');
      return [];
    }

    // Fetch subcategories for all categories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select(`
        id,
        name,
        description,
        category_id,
        position
      `)
      .order('position');

    if (subcategoriesError) throw subcategoriesError;

    // Fetch jobs for all subcategories
    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select(`
        id,
        name,
        description,
        subcategory_id,
        price,
        estimated_time,
        skill_level,
        position,
        is_active
      `)
      .eq('is_active', true)
      .order('position');

    if (jobsError) throw jobsError;

    // Build the hierarchy
    const result: ServiceMainCategory[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      display_order: category.position,
      is_active: category.is_active,
      subcategories: (subcategories || [])
        .filter(sub => sub.category_id === category.id)
        .map(subcategory => ({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description,
          category_id: subcategory.category_id,
          display_order: subcategory.position,
          jobs: (jobs || [])
            .filter(job => job.subcategory_id === subcategory.id)
            .map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              subcategory_id: job.subcategory_id,
              category_id: subcategory.category_id, // Get from subcategory since jobs table doesn't have category_id
              base_price: job.price,
              estimated_duration: job.estimated_time,
              skill_level: job.skill_level,
              display_order: job.position,
              is_active: job.is_active,
              // Backward compatibility fields
              estimatedTime: job.estimated_time,
              price: job.price
            }))
        }))
    }));

    console.log('✅ Service categories loaded from database:', {
      categoriesCount: result.length,
      totalSubcategories: result.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      totalJobs: result.reduce((sum, cat) => sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0)
    });

    return result;
  } catch (error) {
    console.error('❌ Error fetching service categories from database:', error);
    throw new Error('Failed to fetch service categories from database');
  }
};

// Check if database has service data
export const checkServiceDataExists = async (): Promise<boolean> => {
  try {
    const { count, error } = await supabase
      .from('service_categories')
      .select('*', { count: 'exact', head: true });
    
    if (error) throw error;
    return (count || 0) > 0;
  } catch (error) {
    console.error('Error checking service data:', error);
    return false;
  }
};
