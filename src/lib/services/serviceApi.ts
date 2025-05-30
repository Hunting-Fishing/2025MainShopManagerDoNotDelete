import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  console.log('Fetching service categories from database...');
  
  const { data: categories, error: categoriesError } = await supabase
    .from('service_categories')
    .select(`
      *,
      subcategories:service_subcategories(
        *,
        jobs:service_jobs(*)
      )
    `)
    .order('position', { ascending: true });

  if (categoriesError) {
    console.error('Error fetching service categories:', categoriesError);
    throw new Error(`Failed to fetch service categories: ${categoriesError.message}`);
  }

  console.log(`Fetched ${categories?.length || 0} service categories`);
  return categories || [];
}

export async function bulkImportServices(
  categories: ServiceMainCategory[], 
  onProgress?: (progress: number) => void
): Promise<ServiceMainCategory[]> {
  console.log(`Starting bulk import of ${categories.length} service categories...`);
  
  const totalSteps = categories.reduce((sum, cat) => {
    return sum + 1 + cat.subcategories.length + cat.subcategories.reduce((jobSum, sub) => jobSum + sub.jobs.length, 0);
  }, 0);
  
  let completedSteps = 0;
  const updateProgress = () => {
    completedSteps++;
    const progress = Math.round((completedSteps / totalSteps) * 100);
    onProgress?.(progress);
  };

  try {
    const importedCategories: ServiceMainCategory[] = [];

    // Process categories in smaller batches to avoid blocking
    const BATCH_SIZE = 3;
    
    for (let i = 0; i < categories.length; i += BATCH_SIZE) {
      const batch = categories.slice(i, i + BATCH_SIZE);
      console.log(`Processing category batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(categories.length / BATCH_SIZE)}`);
      
      const batchPromises = batch.map(async (category) => {
        try {
          // Import category
          console.log(`Importing category: ${category.name}`);
          const { data: categoryData, error: categoryError } = await supabase
            .from('service_categories')
            .insert({
              name: category.name,
              description: category.description,
              position: category.position
            })
            .select()
            .single();

          if (categoryError) {
            if (categoryError.code === '23505') { // Unique constraint violation
              console.warn(`Category "${category.name}" already exists, skipping...`);
              updateProgress(); // Still count as completed
              return null;
            }
            throw categoryError;
          }

          updateProgress();

          // Import subcategories
          const importedSubcategories: ServiceSubcategory[] = [];
          
          for (const subcategory of category.subcategories) {
            console.log(`Importing subcategory: ${subcategory.name}`);
            
            const { data: subcategoryData, error: subcategoryError } = await supabase
              .from('service_subcategories')
              .insert({
                category_id: categoryData.id,
                name: subcategory.name,
                description: subcategory.description
              })
              .select()
              .single();

            if (subcategoryError) {
              if (subcategoryError.code === '23505') {
                console.warn(`Subcategory "${subcategory.name}" already exists, skipping...`);
                updateProgress();
                continue;
              }
              throw subcategoryError;
            }

            updateProgress();

            // Import jobs in batches
            const importedJobs: ServiceJob[] = [];
            const JOB_BATCH_SIZE = 10;
            
            for (let j = 0; j < subcategory.jobs.length; j += JOB_BATCH_SIZE) {
              const jobBatch = subcategory.jobs.slice(j, j + JOB_BATCH_SIZE);
              
              const jobInserts = jobBatch.map(job => ({
                subcategory_id: subcategoryData.id,
                name: job.name,
                description: job.description,
                estimated_time: job.estimatedTime,
                price: job.price
              }));

              const { data: jobsData, error: jobsError } = await supabase
                .from('service_jobs')
                .insert(jobInserts)
                .select();

              if (jobsError) {
                console.error(`Error inserting job batch:`, jobsError);
                // Continue with other jobs instead of failing completely
                jobBatch.forEach(() => updateProgress());
              } else {
                const mappedJobs = jobsData?.map(jobData => ({
                  id: jobData.id,
                  name: jobData.name,
                  description: jobData.description,
                  estimatedTime: jobData.estimated_time,
                  price: jobData.price
                })) || [];
                
                importedJobs.push(...mappedJobs);
                jobBatch.forEach(() => updateProgress());
              }

              // Small delay between job batches to prevent blocking
              if (j + JOB_BATCH_SIZE < subcategory.jobs.length) {
                await new Promise(resolve => setTimeout(resolve, 50));
              }
            }

            importedSubcategories.push({
              ...subcategoryData,
              jobs: importedJobs
            });
          }

          const importedCategory: ServiceMainCategory = {
            ...categoryData,
            subcategories: importedSubcategories
          };

          return importedCategory;
        } catch (error) {
          console.error(`Failed to import category "${category.name}":`, error);
          updateProgress(); // Still count as completed to avoid hanging
          return null;
        }
      });

      const batchResults = await Promise.all(batchPromises);
      const validResults = batchResults.filter(result => result !== null) as ServiceMainCategory[];
      importedCategories.push(...validResults);

      // Small delay between category batches
      if (i + BATCH_SIZE < categories.length) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }

    console.log(`Bulk import completed. Successfully imported ${importedCategories.length} categories.`);
    return importedCategories;

  } catch (error) {
    console.error('Bulk import failed:', error);
    throw new Error(`Bulk import failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function createServiceCategory(category: Omit<ServiceMainCategory, 'id' | 'subcategories'>): Promise<ServiceMainCategory> {
  const { data, error } = await supabase
    .from('service_categories')
    .insert(category)
    .select()
    .single();

  if (error) throw error;
  return { ...data, subcategories: [] };
}

export async function updateServiceCategory(id: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> {
  const { data, error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

export async function deleteServiceCategory(id: string): Promise<void> {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
}

export async function createServiceSubcategory(subcategory: Omit<ServiceSubcategory, 'id' | 'jobs'> & { categoryId: string }): Promise<ServiceSubcategory> {
  const { data, error } = await supabase
    .from('service_subcategories')
    .insert({
      category_id: subcategory.categoryId,
      name: subcategory.name,
      description: subcategory.description
    })
    .select()
    .single();

  if (error) throw error;
  return { ...data, jobs: [] };
}

export async function createServiceJob(job: Omit<ServiceJob, 'id'> & { subcategoryId: string }): Promise<ServiceJob> {
  const { data, error } = await supabase
    .from('service_jobs')
    .insert({
      subcategory_id: job.subcategoryId,
      name: job.name,
      description: job.description,
      estimated_time: job.estimatedTime,
      price: job.price
    })
    .select()
    .single();

  if (error) throw error;
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    estimatedTime: data.estimated_time,
    price: data.price
  };
}

export async function fetchRawServiceData(): Promise<any> {
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
}
