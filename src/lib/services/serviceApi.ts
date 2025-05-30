import { supabase } from "@/lib/supabase";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { toast } from "sonner";

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  try {
    console.log('Fetching service categories from database...');
    
    const { data, error } = await supabase
      .from('service_categories')
      .select('*')
      .order('position');

    if (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }

    const serviceCategories: ServiceMainCategory[] = await Promise.all(
      data.map(async (category: any) => {
        const subcategories = await fetchServiceSubcategories(category.id);
        return {
          id: category.id,
          name: category.name,
          description: category.description,
          position: category.position,
          subcategories: subcategories,
        };
      })
    );
    
    console.log(`Fetched ${serviceCategories.length} service categories`);
    return serviceCategories;
  } catch (error) {
    console.error('Failed to fetch service categories:', error);
    throw error;
  }
}

export async function createServiceCategory(category: Omit<ServiceMainCategory, 'id' | 'subcategories'>): Promise<ServiceMainCategory | null> {
  try {
    console.log('Creating service category:', category);
    
    const { data, error } = await supabase
      .from('service_categories')
      .insert({
        name: category.name,
        description: category.description,
        position: category.position || 0
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating category:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      position: data.position,
      subcategories: []
    };
  } catch (error) {
    console.error('Failed to create service category:', error);
    return null;
  }
}

export async function updateServiceCategory(categoryId: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory | null> {
  try {
    console.log('Updating service category:', categoryId, updates);
    
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

    if (error) {
      console.error('Error updating category:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      position: data.position,
      subcategories: []
    };
  } catch (error) {
    console.error('Failed to update service category:', error);
    return null;
  }
}

export async function deleteServiceCategory(categoryId: string): Promise<void> {
  try {
    console.log('Deleting category:', categoryId);
    
    // First, delete all subcategories in this category
    const { error: subcategoriesError } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('category_id', categoryId);

    if (subcategoriesError) {
      console.error('Error deleting subcategories:', subcategoriesError);
      throw subcategoriesError;
    }

    // Then delete the category
    const { error } = await supabase
      .from('service_categories')
      .delete()
      .eq('id', categoryId);

    if (error) {
      console.error('Error deleting category:', error);
      throw error;
    }

    console.log('Category deleted successfully');
  } catch (error) {
    console.error('Failed to delete service category:', error);
    throw error;
  }
}

async function fetchServiceSubcategories(categoryId: string): Promise<ServiceSubcategory[]> {
  try {
      console.log(`Fetching subcategories for category ID: ${categoryId}`);

      const { data, error } = await supabase
          .from('service_subcategories')
          .select('*')
          .eq('category_id', categoryId);

      if (error) {
          console.error('Error fetching subcategories:', error);
          throw error;
      }

      const serviceSubcategories: ServiceSubcategory[] = await Promise.all(
        data.map(async (subcategory: any) => {
          const jobs = await fetchServiceJobs(subcategory.id);
          return {
            id: subcategory.id,
            name: subcategory.name,
            description: subcategory.description,
            jobs: jobs,
          };
        })
      );
      
      console.log(`Fetched ${serviceSubcategories.length} service subcategories`);
      return serviceSubcategories;
  } catch (error) {
      console.error('Failed to fetch service subcategories:', error);
      throw error;
  }
}

export async function createServiceSubcategory(subcategory: Omit<ServiceSubcategory, 'id' | 'jobs'>): Promise<ServiceSubcategory | null> {
  try {
    console.log('Creating service subcategory:', subcategory);
    
    const { data, error } = await supabase
      .from('service_subcategories')
      .insert({
        name: subcategory.name,
        description: subcategory.description,
        category_id: subcategory.category_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating subcategory:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      jobs: []
    };
  } catch (error) {
    console.error('Failed to create service subcategory:', error);
    return null;
  }
}

export async function updateServiceSubcategory(subcategoryId: string, updates: Partial<ServiceSubcategory>): Promise<ServiceSubcategory | null> {
  try {
    console.log('Updating service subcategory:', subcategoryId, updates);
    
    const { data, error } = await supabase
      .from('service_subcategories')
      .update({
        name: updates.name,
        description: updates.description
      })
      .eq('id', subcategoryId)
      .select()
      .single();

    if (error) {
      console.error('Error updating subcategory:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      jobs: []
    };
  } catch (error) {
    console.error('Failed to update service subcategory:', error);
    return null;
  }
}

export async function deleteServiceSubcategory(subcategoryId: string): Promise<void> {
  try {
    console.log('Deleting subcategory:', subcategoryId);
    
    // First delete all jobs in this subcategory
    const { error: jobsError } = await supabase
      .from('service_jobs')
      .delete()
      .eq('subcategory_id', subcategoryId);

    if (jobsError) {
      console.error('Error deleting jobs:', jobsError);
      throw jobsError;
    }

    // Then delete the subcategory
    const { error } = await supabase
      .from('service_subcategories')
      .delete()
      .eq('id', subcategoryId);

    if (error) {
      console.error('Error deleting subcategory:', error);
      throw error;
    }

    console.log('Subcategory deleted successfully');
  } catch (error) {
    console.error('Failed to delete subcategory:', error);
    throw error;
  }
}

async function fetchServiceJobs(subcategoryId: string): Promise<ServiceJob[]> {
  try {
      console.log(`Fetching jobs for subcategory ID: ${subcategoryId}`);

      const { data, error } = await supabase
          .from('service_jobs')
          .select('*')
          .eq('subcategory_id', subcategoryId);

      if (error) {
          console.error('Error fetching jobs:', error);
          throw error;
      }

      const serviceJobs: ServiceJob[] = data.map((job: any) => ({
        id: job.id,
        name: job.name,
        description: job.description,
        estimatedTime: job.estimated_time,
        price: job.price,
        subcategory_id: job.subcategory_id
      }));
      
      console.log(`Fetched ${serviceJobs.length} service jobs`);
      return serviceJobs;
  } catch (error) {
      console.error('Failed to fetch service jobs:', error);
      throw error;
  }
}

export async function createServiceJob(job: Omit<ServiceJob, 'id'>): Promise<ServiceJob | null> {
  try {
    console.log('Creating service job:', job);
    
    const { data, error } = await supabase
      .from('service_jobs')
      .insert({
        name: job.name,
        description: job.description,
        estimated_time: job.estimatedTime,
        price: job.price,
        subcategory_id: job.subcategory_id
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating job:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estimatedTime: data.estimated_time,
      price: data.price,
      subcategory_id: data.subcategory_id
    };
  } catch (error) {
    console.error('Failed to create service job:', error);
    return null;
  }
}

export async function updateServiceJob(jobId: string, updates: Partial<ServiceJob>): Promise<ServiceJob | null> {
  try {
    console.log('Updating service job:', jobId, updates);
    
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

    if (error) {
      console.error('Error updating job:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      estimatedTime: data.estimated_time,
      price: data.price,
      subcategory_id: data.subcategory_id
    };
  } catch (error) {
    console.error('Failed to update service job:', error);
    return null;
  }
}

export async function deleteServiceJob(jobId: string): Promise<void> {
  try {
    console.log('Deleting job:', jobId);
    
    const { error } = await supabase
      .from('service_jobs')
      .delete()
      .eq('id', jobId);

    if (error) {
      console.error('Error deleting job:', error);
      throw error;
    }

    console.log('Job deleted successfully');
  } catch (error) {
    console.error('Failed to delete service job:', error);
    throw error;
  }
}

export async function bulkImportServiceCategories(categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> {
  const results: ServiceMainCategory[] = [];
  const BATCH_SIZE = 10;
  
  try {
    console.log(`Starting bulk import of ${categories.length} categories...`);
    
    // Process categories in batches
    for (let i = 0; i < categories.length; i += BATCH_SIZE) {
      const batch = categories.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(categories.length / BATCH_SIZE)}`);
      
      for (const category of batch) {
        try {
          // Create main category
          const { data: categoryData, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              name: category.name,
              description: category.description,
              position: category.position || 0
            })
            .select()
            .single();

          if (categoryError) {
            console.error('Error creating category:', categoryError);
            continue;
          }

          const createdCategory: ServiceMainCategory = {
            id: categoryData.id,
            name: categoryData.name,
            description: categoryData.description,
            position: categoryData.position,
            subcategories: []
          };

          // Create subcategories
          for (const subcategory of category.subcategories) {
            try {
              const { data: subcategoryData, error: subcategoryError } = await supabase
                .from('service_subcategories')
                .insert({
                  name: subcategory.name,
                  description: subcategory.description,
                  category_id: categoryData.id
                })
                .select()
                .single();

              if (subcategoryError) {
                console.error('Error creating subcategory:', subcategoryError);
                continue;
              }

              const createdSubcategory: ServiceSubcategory = {
                id: subcategoryData.id,
                name: subcategoryData.name,
                description: subcategoryData.description,
                jobs: []
              };

              // Create jobs
              for (const job of subcategory.jobs) {
                try {
                  const { data: jobData, error: jobError } = await supabase
                    .from('service_jobs')
                    .insert({
                      name: job.name,
                      description: job.description,
                      estimated_time: job.estimatedTime,
                      price: job.price,
                      subcategory_id: subcategoryData.id
                    })
                    .select()
                    .single();

                  if (jobError) {
                    console.error('Error creating job:', jobError);
                    continue;
                  }

                  createdSubcategory.jobs.push({
                    id: jobData.id,
                    name: jobData.name,
                    description: jobData.description,
                    estimatedTime: jobData.estimated_time,
                    price: jobData.price,
                    subcategory_id: jobData.subcategory_id
                  });
                } catch (jobError) {
                  console.error('Failed to create job:', job.name, jobError);
                }
              }

              createdCategory.subcategories.push(createdSubcategory);
            } catch (subcategoryError) {
              console.error('Failed to create subcategory:', subcategory.name, subcategoryError);
            }
          }

          results.push(createdCategory);
          
          // Add a small delay to prevent overwhelming the database
          await new Promise(resolve => setTimeout(resolve, 100));
          
        } catch (categoryError) {
          console.error('Failed to create category:', category.name, categoryError);
        }
      }
      
      // Longer delay between batches
      if (i + BATCH_SIZE < categories.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }
    
    console.log(`Bulk import completed. Created ${results.length} categories.`);
    return results;
    
  } catch (error) {
    console.error('Bulk import failed:', error);
    throw error;
  }
}
