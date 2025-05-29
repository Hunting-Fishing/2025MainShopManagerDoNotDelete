
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    // Fetch service categories from the database
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
          service_jobs (
            id,
            name,
            description,
            estimated_time,
            price
          )
        )
      `)
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching service categories:', categoriesError);
      // Fallback to the common categories from the serviceHierarchy library
      const { commonServiceCategories } = await import('@/lib/serviceHierarchy');
      return commonServiceCategories;
    }

    if (!categories || categories.length === 0) {
      // If no categories in database, return the common ones
      const { commonServiceCategories } = await import('@/lib/serviceHierarchy');
      return commonServiceCategories;
    }

    // Transform database data to match our TypeScript interfaces
    const transformedCategories: ServiceMainCategory[] = categories.map((category: any) => ({
      id: category.id,
      name: category.name,
      description: category.description,
      position: category.position,
      subcategories: (category.service_subcategories || []).map((subcategory: any) => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        jobs: (subcategory.service_jobs || []).map((job: any) => ({
          id: job.id,
          name: job.name,
          description: job.description,
          estimatedTime: job.estimated_time,
          price: job.price
        }))
      }))
    }));

    return transformedCategories;
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    // Fallback to the common categories from the serviceHierarchy library
    const { commonServiceCategories } = await import('@/lib/serviceHierarchy');
    return commonServiceCategories;
  }
};

export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description,
        position: category.position
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service category:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      position: data.position,
      subcategories: []
    };
  } catch (error) {
    console.error('Error in createServiceCategory:', error);
    return null;
  }
};

export const updateServiceCategory = async (
  categoryId: string, 
  updates: Partial<Pick<ServiceMainCategory, 'name' | 'description' | 'position'>>
): Promise<ServiceMainCategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update(updates)
      .eq('id', categoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating service category:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      position: data.position,
      subcategories: []
    };
  } catch (error) {
    console.error('Error in updateServiceCategory:', error);
    return null;
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting service category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteServiceCategory:', error);
    return false;
  }
};

export const createServiceSubcategory = async (
  categoryId: string, 
  subcategory: Omit<ServiceSubcategory, 'id'>
): Promise<ServiceSubcategory | null> => {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert({
        category_id: categoryId,
        name: subcategory.name,
        description: subcategory.description
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service subcategory:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      jobs: []
    };
  } catch (error) {
    console.error('Error in createServiceSubcategory:', error);
    return null;
  }
};

export const deleteServiceSubcategory = async (subcategoryId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      console.error('Error deleting service subcategory:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteServiceSubcategory:', error);
    return false;
  }
};

export const createServiceJob = async (
  subcategoryId: string, 
  job: Omit<ServiceJob, 'id'>
): Promise<ServiceJob | null> => {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .insert({
        subcategory_id: subcategoryId,
        name: job.name,
        description: job.description,
        estimated_time: job.estimatedTime,
        price: job.price
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating service job:', error);
      return null;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estimatedTime: data.estimated_time,
      price: data.price
    };
  } catch (error) {
    console.error('Error in createServiceJob:', error);
    return null;
  }
};

export const deleteServiceJob = async (jobId: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting service job:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteServiceJob:', error);
    return false;
  }
};

export const fetchRawServiceData = async (): Promise<any> => {
  try {
    console.log('Fetching raw service data for debugging...');
    
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*');
    
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*');
    
    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('*');

    return {
      categories: categories || [],
      subcategories: subcategories || [],
      jobs: jobs || [],
      errors: {
        categoriesError,
        subcategoriesError,
        jobsError
      }
    };
  } catch (error) {
    console.error('Error in fetchRawServiceData:', error);
    return {
      categories: [],
      subcategories: [],
      jobs: [],
      errors: { fetchError: error }
    };
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    console.log('Starting bulk import of service categories...');
    const totalItems = categories.length;
    
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Create or update category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .upsert({
          name: category.name,
          description: category.description,
          position: category.position || i
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error importing category:', categoryError);
        continue;
      }

      // Import subcategories
      for (const subcategory of category.subcategories) {
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert({
            category_id: categoryData.id,
            name: subcategory.name,
            description: subcategory.description
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Error importing subcategory:', subcategoryError);
          continue;
        }

        // Import jobs
        for (const job of subcategory.jobs) {
          const { error: jobError } = await supabase
            .from('service_jobs')
            .upsert({
              subcategory_id: subcategoryData.id,
              name: job.name,
              description: job.description,
              estimated_time: job.estimatedTime,
              price: job.price
            });

          if (jobError) {
            console.error('Error importing job:', jobError);
          }
        }
      }

      // Update progress
      if (onProgress) {
        onProgress((i + 1) / totalItems);
      }
    }

    console.log('Bulk import completed successfully');
  } catch (error) {
    console.error('Error in bulkImportServiceCategories:', error);
    throw error;
  }
};
