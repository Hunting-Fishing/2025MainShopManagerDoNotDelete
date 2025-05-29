import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories from database...');
    
    // First, get all main categories
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .order('position', { ascending: true });

    if (categoriesError) {
      console.error('Error fetching categories:', categoriesError);
      throw categoriesError;
    }

    console.log('Found categories:', categories);

    if (!categories || categories.length === 0) {
      console.log('No categories found in database');
      return [];
    }

    // Then get all subcategories
    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*')
      .order('category_id', { ascending: true });

    if (subcategoriesError) {
      console.error('Error fetching subcategories:', subcategoriesError);
      throw subcategoriesError;
    }

    console.log('Found subcategories:', subcategories);

    // Then get all jobs
    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('*')
      .order('subcategory_id', { ascending: true });

    if (jobsError) {
      console.error('Error fetching jobs:', jobsError);
      throw jobsError;
    }

    console.log('Found jobs:', jobs);

    // Build the hierarchy
    const categoriesMap = new Map<string, ServiceMainCategory>();
    
    // Initialize categories
    categories.forEach(cat => {
      categoriesMap.set(cat.id, {
        id: cat.id,
        name: cat.name,
        description: cat.description,
        position: cat.position,
        subcategories: []
      });
    });

    // Add subcategories to categories
    const subcategoriesMap = new Map<string, ServiceSubcategory>();
    subcategories?.forEach(sub => {
      const subcategory: ServiceSubcategory = {
        id: sub.id,
        name: sub.name,
        description: sub.description,
        jobs: []
      };
      
      subcategoriesMap.set(sub.id, subcategory);
      
      const category = categoriesMap.get(sub.category_id);
      if (category) {
        category.subcategories.push(subcategory);
      }
    });

    // Add jobs to subcategories
    jobs?.forEach(job => {
      const jobObj: ServiceJob = {
        id: job.id,
        name: job.name,
        description: job.description,
        estimatedTime: job.estimated_time,
        price: job.price
      };
      
      const subcategory = subcategoriesMap.get(job.subcategory_id);
      if (subcategory) {
        subcategory.jobs.push(jobObj);
      }
    });

    const result = Array.from(categoriesMap.values());
    console.log('Built service hierarchy:', result);
    return result;

  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
}

export async function updateServiceCategory(category: ServiceMainCategory): Promise<void> {
  try {
    console.log('Updating service category:', category);
    
    const { error } = await supabase
      .from('service_categories')
      .update({
        name: category.name,
        description: category.description,
        position: category.position || 1
      })
      .eq('id', category.id);

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    console.log('Category updated successfully');
  } catch (error) {
    console.error('Failed to update service category:', error);
    throw error;
  }
}

export async function fetchRawServiceData() {
  try {
    console.log('Fetching raw service data for debugging...');
    
    const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('position', { ascending: true }),
      supabase.from('service_subcategories').select('*').order('category_id', { ascending: true }),
      supabase.from('service_jobs').select('*').order('subcategory_id', { ascending: true })
    ]);

    return {
      categories: categoriesResult.data || [],
      subcategories: subcategoriesResult.data || [],
      jobs: jobsResult.data || [],
      errors: {
        categories: categoriesResult.error,
        subcategories: subcategoriesResult.error,
        jobs: jobsResult.error
      }
    };
  } catch (error) {
    console.error('Failed to fetch raw service data:', error);
    throw error;
  }
}

export async function bulkImportServiceCategories(categories: ServiceMainCategory[], onProgress?: (progress: number) => void): Promise<void> {
  try {
    console.log('Starting bulk import of service categories:', categories);
    
    let processed = 0;
    const total = categories.length;
    
    for (const category of categories) {
      console.log('Processing category:', category.name);
      
      // Insert or update main category
      const { data: insertedCategory, error: categoryError } = await supabase
        .from('service_categories')
        .upsert({
          id: category.id,
          name: category.name,
          description: category.description,
          position: category.position || 1
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error inserting category:', categoryError);
        throw categoryError;
      }

      console.log('Inserted category:', insertedCategory);

      // Process subcategories
      for (const subcategory of category.subcategories) {
        console.log('Processing subcategory:', subcategory.name);
        
        const { data: insertedSubcategory, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .upsert({
            id: subcategory.id,
            category_id: insertedCategory.id,
            name: subcategory.name,
            description: subcategory.description
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Error inserting subcategory:', subcategoryError);
          throw subcategoryError;
        }

        console.log('Inserted subcategory:', insertedSubcategory);

        // Process jobs
        for (const job of subcategory.jobs) {
          console.log('Processing job:', job.name);
          
          const { error: jobError } = await supabase
            .from('service_jobs')
            .upsert({
              id: job.id,
              subcategory_id: insertedSubcategory.id,
              name: job.name,
              description: job.description,
              estimated_time: job.estimatedTime,
              price: job.price
            });

          if (jobError) {
            console.error('Error inserting job:', jobError);
            throw jobError;
          }

          console.log('Inserted job:', job.name);
        }
      }

      processed++;
      if (onProgress) {
        onProgress((processed / total) * 100);
      }
    }

    console.log('Bulk import completed successfully');
  } catch (error) {
    console.error('Bulk import failed:', error);
    throw error;
  }
}
