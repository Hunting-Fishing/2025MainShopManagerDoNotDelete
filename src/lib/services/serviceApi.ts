import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('position');

    if (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }

    return data as ServiceMainCategory[];
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
}

export async function createServiceCategory(category: Omit<ServiceMainCategory, 'id' | 'subcategories'>): Promise<ServiceMainCategory | null> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .insert([category])
      .select()
      .single();

    if (error) {
      console.error('Error creating service category:', error);
      throw error;
    }

    return data as ServiceMainCategory;
  } catch (error) {
    console.error('Failed to create service category:', error);
    return null;
  }
}

export async function updateServiceCategory(category: ServiceMainCategory): Promise<ServiceMainCategory | null> {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update(category)
      .eq('id', category.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service category:', error);
      throw error;
    }

    return data as ServiceMainCategory;
  } catch (error) {
    console.error('Failed to update service category:', error);
    return null;
  }
}

export async function deleteServiceCategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service category:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete service category:', error);
    return false;
  }
}

export async function fetchServiceSubcategories(categoryId: string): Promise<ServiceSubcategory[]> {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .select('*')
      .eq('category_id', categoryId);

    if (error) {
      console.error('Error fetching service subcategories:', error);
      throw error;
    }

    return data as ServiceSubcategory[];
  } catch (error) {
    console.error('Failed to fetch service subcategories:', error);
    throw error;
  }
}

export async function createServiceSubcategory(subcategory: Omit<ServiceSubcategory, 'id' | 'jobs'> & { category_id: string }): Promise<ServiceSubcategory | null> {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert([subcategory])
      .select()
      .single();

    if (error) {
      console.error('Error creating service subcategory:', error);
      throw error;
    }

    return data as ServiceSubcategory;
  } catch (error) {
    console.error('Failed to create service subcategory:', error);
    return null;
  }
}

export async function updateServiceSubcategory(subcategory: ServiceSubcategory): Promise<ServiceSubcategory | null> {
  try {
    const { data, error } = await supabase
      .from('service_subcategories')
      .update(subcategory)
      .eq('id', subcategory.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service subcategory:', error);
      throw error;
    }

    return data as ServiceSubcategory;
  } catch (error) {
    console.error('Failed to update service subcategory:', error);
    return null;
  }
}

export async function deleteServiceSubcategory(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service subcategory:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete service subcategory:', error);
    return false;
  }
}

export async function fetchServiceJobs(subcategoryId: string): Promise<ServiceJob[]> {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .select('*')
      .eq('subcategory_id', subcategoryId);

    if (error) {
      console.error('Error fetching service jobs:', error);
      throw error;
    }

    return data as ServiceJob[];
  } catch (error) {
    console.error('Failed to fetch service jobs:', error);
    throw error;
  }
}

export async function createServiceJob(job: Omit<ServiceJob, 'id'> & { subcategory_id: string }): Promise<ServiceJob | null> {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .insert([job])
      .select()
      .single();

    if (error) {
      console.error('Error creating service job:', error);
      throw error;
    }

    return data as ServiceJob;
  } catch (error) {
    console.error('Failed to create service job:', error);
    return null;
  }
}

export async function updateServiceJob(job: ServiceJob): Promise<ServiceJob | null> {
  try {
    const { data, error } = await supabase
      .from('service_jobs')
      .update(job)
      .eq('id', job.id)
      .select()
      .single();

    if (error) {
      console.error('Error updating service job:', error);
      throw error;
    }

    return data as ServiceJob;
  } catch (error) {
    console.error('Failed to update service job:', error);
    return null;
  }
}

export async function deleteServiceJob(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting service job:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to delete service job:', error);
    return false;
  }
}

// Add the missing bulkImportServices function
export async function bulkImportServices(categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> {
  console.log('Starting bulk import of services...');
  
  try {
    const importedCategories: ServiceMainCategory[] = [];
    
    for (const category of categories) {
      console.log(`Importing category: ${category.name}`);
      
      // Create the main category
      const { data: categoryData, error: categoryError } = await supabase
        .from('service_categories')
        .insert({
          name: category.name,
          description: category.description || '',
          position: category.position || 0,
          is_active: true
        })
        .select()
        .single();

      if (categoryError) {
        console.error('Error creating category:', categoryError);
        throw categoryError;
      }

      const importedCategory: ServiceMainCategory = {
        id: categoryData.id,
        name: categoryData.name,
        description: categoryData.description,
        position: categoryData.position,
        subcategories: []
      };

      // Import subcategories and jobs
      for (const subcategory of category.subcategories) {
        console.log(`Importing subcategory: ${subcategory.name}`);
        
        const { data: subcategoryData, error: subcategoryError } = await supabase
          .from('service_subcategories')
          .insert({
            name: subcategory.name,
            description: subcategory.description || '',
            category_id: categoryData.id,
            is_active: true
          })
          .select()
          .single();

        if (subcategoryError) {
          console.error('Error creating subcategory:', subcategoryError);
          throw subcategoryError;
        }

        const importedSubcategory: ServiceSubcategory = {
          id: subcategoryData.id,
          name: subcategoryData.name,
          description: subcategoryData.description,
          jobs: []
        };

        // Import jobs in batches
        const batchSize = 10;
        for (let i = 0; i < subcategory.jobs.length; i += batchSize) {
          const jobBatch = subcategory.jobs.slice(i, i + batchSize);
          
          const jobsToInsert = jobBatch.map(job => ({
            name: job.name,
            description: job.description || '',
            subcategory_id: subcategoryData.id,
            estimated_time: job.estimatedTime || 60,
            price: job.price || 50,
            is_active: true
          }));

          const { data: jobsData, error: jobsError } = await supabase
            .from('service_jobs')
            .insert(jobsToInsert)
            .select();

          if (jobsError) {
            console.error('Error creating jobs:', jobsError);
            throw jobsError;
          }

          // Add imported jobs to subcategory
          if (jobsData) {
            const importedJobs: ServiceJob[] = jobsData.map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              estimatedTime: job.estimated_time,
              price: job.price,
              subcategory_id: job.subcategory_id
            }));
            
            importedSubcategory.jobs.push(...importedJobs);
          }

          // Add delay between batches
          await new Promise(resolve => setTimeout(resolve, 100));
        }

        importedCategory.subcategories.push(importedSubcategory);
      }

      importedCategories.push(importedCategory);
      
      // Add delay between categories
      await new Promise(resolve => setTimeout(resolve, 200));
    }

    console.log('Bulk import completed successfully');
    return importedCategories;
    
  } catch (error) {
    console.error('Error in bulk import:', error);
    throw error;
  }
}

// Add the missing fetchRawServiceData function
export async function fetchRawServiceData() {
  console.log('Fetching raw service data...');
  
  try {
    const { data: categories, error: categoriesError } = await supabase
      .from('service_categories')
      .select('*')
      .order('position');

    const { data: subcategories, error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .select('*');

    const { data: jobs, error: jobsError } = await supabase
      .from('service_jobs')
      .select('*');

    if (categoriesError) throw categoriesError;
    if (subcategoriesError) throw subcategoriesError;
    if (jobsError) throw jobsError;

    return {
      categories: categories || [],
      subcategories: subcategories || [],
      jobs: jobs || []
    };
  } catch (error) {
    console.error('Error fetching raw service data:', error);
    throw error;
  }
}
