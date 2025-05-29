
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
