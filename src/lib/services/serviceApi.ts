
import { supabase } from '@/lib/supabase';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export async function fetchServiceCategories(): Promise<ServiceMainCategory[]> {
  console.log('Fetching service categories from database...');

  // Fetch all related data in parallel
  const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
    supabase.from('service_categories').select('*').order('position', { ascending: true }),
    supabase.from('service_subcategories').select('*'),
    supabase.from('service_jobs').select('*')
  ]);

  if (categoriesResult.error) {
    console.error('Error fetching service categories:', categoriesResult.error);
    throw new Error(`Failed to fetch service categories: ${categoriesResult.error.message}`);
  }

  const categories = categoriesResult.data || [];
  const subcategories = subcategoriesResult.data || [];
  const jobs = jobsResult.data || [];

  // Build the hierarchical structure
  const hierarchicalCategories: ServiceMainCategory[] = categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    position: category.position,
    subcategories: subcategories
      .filter(sub => sub.category_id === category.id)
      .map(sub => ({
        id: sub.id,
        name: sub.name,
        description: sub.description,
        jobs: jobs
          .filter(job => job.subcategory_id === sub.id)
          .map(job => ({
            id: job.id,
            name: job.name,
            description: job.description,
            estimatedTime: job.estimated_time,
            price: job.price
          }))
      }))
  }));

  console.log('Fetched service categories:', hierarchicalCategories);
  return hierarchicalCategories;
}

export async function updateServiceCategory(id: string, updates: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> {
  console.log('Updating service category:', id, updates);
  
  const { data, error } = await supabase
    .from('service_categories')
    .update({
      name: updates.name,
      description: updates.description,
      position: updates.position
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating service category:', error);
    throw new Error(`Failed to update service category: ${error.message}`);
  }

  console.log('Updated service category:', data);
  
  // Return with empty subcategories since we're only updating the category
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    position: data.position,
    subcategories: []
  };
}

export async function deleteServiceCategory(id: string): Promise<void> {
  console.log('Deleting service category:', id);
  
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service category:', error);
    throw new Error(`Failed to delete service category: ${error.message}`);
  }

  console.log('Deleted service category:', id);
}

export async function deleteServiceSubcategory(id: string): Promise<void> {
  console.log('Deleting service subcategory:', id);
  
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error(`Failed to delete service subcategory: ${error.message}`);
  }

  console.log('Deleted service subcategory:', id);
}

export async function deleteServiceJob(id: string): Promise<void> {
  console.log('Deleting service job:', id);
  
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting service job:', error);
    throw new Error(`Failed to delete service job: ${error.message}`);
  }

  console.log('Deleted service job:', id);
}

export async function bulkImportServiceCategories(
  categories: ServiceMainCategory[], 
  onProgress?: (progress: number) => void
): Promise<void> {
  console.log('Starting bulk import of service categories...');
  
  let progress = 0;
  const totalSteps = categories.length;

  for (const category of categories) {
    // Insert category
    const { data: categoryData, error: categoryError } = await supabase
      .from('service_categories')
      .upsert({
        name: category.name,
        description: category.description,
        position: category.position || 1
      }, { onConflict: 'name' })
      .select()
      .single();

    if (categoryError) {
      console.error('Error inserting category:', categoryError);
      throw new Error(`Failed to insert category ${category.name}: ${categoryError.message}`);
    }

    // Insert subcategories
    for (const subcategory of category.subcategories) {
      const { data: subcategoryData, error: subcategoryError } = await supabase
        .from('service_subcategories')
        .upsert({
          category_id: categoryData.id,
          name: subcategory.name,
          description: subcategory.description
        }, { onConflict: 'name,category_id' })
        .select()
        .single();

      if (subcategoryError) {
        console.error('Error inserting subcategory:', subcategoryError);
        throw new Error(`Failed to insert subcategory ${subcategory.name}: ${subcategoryError.message}`);
      }

      // Insert jobs
      for (const job of subcategory.jobs) {
        const { error: jobError } = await supabase
          .from('service_jobs')
          .upsert({
            subcategory_id: subcategoryData.id,
            name: job.name,
            description: job.description,
            estimated_time: job.estimatedTime,
            price: job.price
          }, { onConflict: 'name,subcategory_id' });

        if (jobError) {
          console.error('Error inserting job:', jobError);
          throw new Error(`Failed to insert job ${job.name}: ${jobError.message}`);
        }
      }
    }

    progress++;
    if (onProgress) {
      onProgress((progress / totalSteps) * 100);
    }
  }

  console.log('Bulk import completed successfully');
}

export async function fetchRawServiceData() {
  console.log('Fetching raw service data from all tables...');
  
  try {
    const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_categories').select('*'),
      supabase.from('service_subcategories').select('*'),
      supabase.from('service_jobs').select('*')
    ]);

    const rawData = {
      categories: categoriesResult.data || [],
      subcategories: subcategoriesResult.data || [],
      jobs: jobsResult.data || [],
      errors: {
        categories: categoriesResult.error,
        subcategories: subcategoriesResult.error,
        jobs: jobsResult.error
      }
    };

    console.log('Raw service data:', rawData);
    return rawData;
  } catch (error) {
    console.error('Error fetching raw service data:', error);
    throw error;
  }
}
