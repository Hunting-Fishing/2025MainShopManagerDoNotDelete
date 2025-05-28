
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { supabase } from '@/integrations/supabase/client';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories from database...');
    
    // First, let's try to fetch from service_hierarchy table
    const { data: hierarchyData, error: hierarchyError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .is('parent_id', null)
      .order('position', { ascending: true });

    if (hierarchyError) {
      console.error('Error fetching from service_hierarchy:', hierarchyError);
      // Fallback to empty array
      return [];
    }

    if (!hierarchyData || hierarchyData.length === 0) {
      console.log('No service hierarchy data found, trying service_categories...');
      
      // Try fetching from service_categories table
      const { data: categoriesData, error: categoriesError } = await supabase
        .from('service_categories')
        .select('*')
        .is('parent_id', null)
        .order('id');

      if (categoriesError) {
        console.error('Error fetching from service_categories:', categoriesError);
        return [];
      }

      if (!categoriesData || categoriesData.length === 0) {
        console.log('No service categories found in database');
        return [];
      }

      // Process service_categories data
      return await processServiceCategoriesData(categoriesData);
    }

    // Process service_hierarchy data
    return await processServiceHierarchyData(hierarchyData);

  } catch (error) {
    console.error('Failed to fetch service categories from database:', error);
    return [];
  }
};

const processServiceHierarchyData = async (hierarchyData: any[]): Promise<ServiceMainCategory[]> => {
  const categories: ServiceMainCategory[] = [];

  for (const category of hierarchyData) {
    // Fetch subcategories for this category
    const { data: subcategoriesData, error: subError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('parent_id', category.id);

    const subcategories = [];
    
    if (!subError && subcategoriesData) {
      for (const subcategory of subcategoriesData) {
        // Fetch jobs for this subcategory
        const { data: jobsData, error: jobsError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('parent_id', subcategory.id);

        const jobs = !jobsError && jobsData ? jobsData.map(job => ({
          id: job.id,
          name: job.name,
          description: job.description || undefined,
          price: job.price || undefined,
          estimatedTime: job.estimated_time || undefined
        })) : [];

        subcategories.push({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description || undefined,
          jobs
        });
      }
    }

    categories.push({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      position: category.position || undefined,
      subcategories
    });
  }

  return categories;
};

const processServiceCategoriesData = async (categoriesData: any[]): Promise<ServiceMainCategory[]> => {
  const categories: ServiceMainCategory[] = [];

  for (const category of categoriesData) {
    // Fetch subcategories for this category
    const { data: subcategoriesData, error: subError } = await supabase
      .from('service_categories')
      .select('*')
      .eq('parent_id', category.id);

    const subcategories = [];
    
    if (!subError && subcategoriesData) {
      for (const subcategory of subcategoriesData) {
        // Fetch jobs for this subcategory
        const { data: jobsData, error: jobsError } = await supabase
          .from('service_categories')
          .select('*')
          .eq('parent_id', subcategory.id);

        const jobs = !jobsError && jobsData ? jobsData.map(job => ({
          id: job.id,
          name: job.name,
          description: job.description || undefined,
          price: job.price || undefined,
          estimatedTime: job.estimated_time || undefined
        })) : [];

        subcategories.push({
          id: subcategory.id,
          name: subcategory.name,
          description: subcategory.description || undefined,
          jobs
        });
      }
    }

    categories.push({
      id: category.id,
      name: category.name,
      description: category.description || undefined,
      subcategories
    });
  }

  return categories;
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const totalSteps = categories.length * 3;
    let currentStep = 0;

    for (const category of categories) {
      // Try to insert into service_hierarchy first
      let categoryData;
      const { data: hierarchyData, error: hierarchyError } = await supabase
        .from('service_hierarchy')
        .insert({
          name: category.name,
          description: category.description,
          position: category.position
        })
        .select()
        .single();

      if (hierarchyError) {
        console.log('service_hierarchy not available, using service_categories');
        // Fallback to service_categories
        const { data: categoryFallback, error: categoryError } = await supabase
          .from('service_categories')
          .insert({
            name: category.name,
            description: category.description
          })
          .select()
          .single();

        if (categoryError) {
          console.error('Error inserting category:', categoryError);
          throw categoryError;
        }
        categoryData = categoryFallback;
      } else {
        categoryData = hierarchyData;
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
    // Try service_hierarchy first
    let { error } = await supabase
      .from('service_hierarchy')
      .upsert({
        id: category.id,
        name: category.name,
        description: category.description,
        position: category.position
      });

    if (error) {
      // Fallback to service_categories
      const { error: fallbackError } = await supabase
        .from('service_categories')
        .upsert({
          id: category.id,
          name: category.name,
          description: category.description
        });

      if (fallbackError) {
        console.error('Error saving service category:', fallbackError);
        throw fallbackError;
      }
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
    // Try service_categories first
    let { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', itemId);

    if (error && type === 'category') {
      // Try service_hierarchy for main categories
      const { error: hierarchyError } = await supabase
        .from('service_hierarchy')
        .delete()
        .eq('id', itemId);

      if (hierarchyError) {
        console.error(`Error removing duplicate ${type}:`, hierarchyError);
        throw hierarchyError;
      }
    } else if (error) {
      console.error(`Error removing duplicate ${type}:`, error);
      throw error;
    }

    console.log(`Removed duplicate ${type} with id:`, itemId);
  } catch (error) {
    console.error(`Failed to remove duplicate ${type}:`, error);
    throw error;
  }
};
