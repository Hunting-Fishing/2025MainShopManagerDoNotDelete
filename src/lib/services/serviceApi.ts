
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    // Fetch service categories with their subcategories and jobs
    const { data: categories, error: categoriesError } = await supabase
      .from('service_hierarchy')
      .select(`
        id,
        name,
        description,
        position,
        subcategories:service_categories!parent_id(
          id,
          name,
          description,
          jobs:service_categories!parent_id(
            id,
            name,
            description,
            price,
            estimated_time
          )
        )
      `)
      .is('parent_id', null)
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching service categories:', categoriesError);
      throw categoriesError;
    }

    if (!categories || categories.length === 0) {
      console.log('No service categories found in database, returning empty array');
      return [];
    }

    // Transform the data to match our TypeScript interfaces
    const transformedCategories: ServiceMainCategory[] = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      position: category.position || undefined,
      subcategories: (category.subcategories || []).map(subcategory => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description || undefined,
        jobs: (subcategory.jobs || []).map(job => ({
          id: job.id,
          name: job.name,
          description: job.description || undefined,
          price: job.price || undefined,
          estimatedTime: job.estimated_time || undefined
        }))
      }))
    }));

    console.log('Fetched service categories from database:', transformedCategories);
    return transformedCategories;

  } catch (error) {
    console.error('Failed to fetch service categories from database:', error);
    // Fallback to empty array instead of mock data
    return [];
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const totalSteps = categories.length * 3; // Rough estimate
    let currentStep = 0;

    for (const category of categories) {
      // Insert main category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_hierarchy')
        .insert({
          name: category.name,
          description: category.description,
          position: category.position
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        throw categoryError;
      }

      currentStep++;
      if (onProgress) onProgress(currentStep / totalSteps);

      // Insert subcategories
      for (const subcategory of category.subcategories) {
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_categories')
          .insert({
            name: subcategory.name,
            description: subcategory.description,
            parent_id: categoryData.id
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          throw subcategoryError;
        }

        currentStep++;
        if (onProgress) onProgress(currentStep / totalSteps);

        // Insert jobs
        for (const job of subcategory.jobs) {
          const { error: jobError } = await supabase
            .from('service_categories')
            .insert({
              name: job.name,
              description: job.description,
              price: job.price,
              estimated_time: job.estimatedTime,
              parent_id: subcategoryData.id
            });

          if (jobError) {
            console.error('Error inserting job:', jobError);
            throw jobError;
          }
        }

        currentStep++;
        if (onProgress) onProgress(currentStep / totalSteps);
      }
    }

    console.log('Bulk import completed successfully');
  } catch (error) {
    console.error('Bulk import failed:', error);
    throw error;
  }
};

export const saveServiceCategory = async (category: ServiceMainCategory): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .upsert({
        id: category.id,
        name: category.name,
        description: category.description,
        position: category.position
      });

    if (error) {
      console.error('Error saving service category:', error);
      throw error;
    }

    console.log('Service category saved successfully:', category.name);
  } catch (error) {
    console.error('Failed to save service category:', error);
    throw error;
  }
};

export const removeDuplicateItem = async (
  itemId: string, 
  type: 'category' | 'subcategory' | 'job'
): Promise<void> => {
  try {
    let tableName: string;
    
    if (type === 'category') {
      tableName = 'service_hierarchy';
    } else {
      tableName = 'service_categories';
    }

    const { error } = await supabase
      .from(tableName)
      .delete()
      .eq('id', itemId);

    if (error) {
      console.error(`Error removing duplicate ${type}:`, error);
      throw error;
    }

    console.log(`Removed duplicate ${type} with id:`, itemId);
  } catch (error) {
    console.error(`Failed to remove duplicate ${type}:`, error);
    throw error;
  }
};
