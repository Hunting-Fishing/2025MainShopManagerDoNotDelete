
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    // Fetch all categories, subcategories, and jobs in separate queries
    const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
      supabase.from('service_categories').select('*').order('position'),
      supabase.from('service_subcategories').select('*'),
      supabase.from('service_jobs').select('*')
    ]);

    if (categoriesResult.error) throw categoriesResult.error;
    if (subcategoriesResult.error) throw subcategoriesResult.error;
    if (jobsResult.error) throw jobsResult.error;

    const categories = categoriesResult.data || [];
    const subcategories = subcategoriesResult.data || [];
    const jobs = jobsResult.data || [];

    // Build the hierarchical structure
    return categories.map(category => ({
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
          category_id: sub.category_id,
          jobs: jobs
            .filter(job => job.subcategory_id === sub.id)
            .map(job => ({
              id: job.id,
              name: job.name,
              description: job.description,
              estimatedTime: job.estimated_time,
              price: job.price,
              subcategory_id: job.subcategory_id
            }))
        }))
    }));
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }
};

export const createServiceCategory = async (categoryData: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  const { data, error } = await supabase
    .from('service_categories')
    .insert({
      name: categoryData.name,
      description: categoryData.description,
      position: categoryData.position
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    position: data.position,
    subcategories: []
  };
};

export const updateServiceCategory = async (id: string, categoryData: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  const { data, error } = await supabase
    .from('service_categories')
    .update({
      name: categoryData.name,
      description: categoryData.description,
      position: categoryData.position
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    position: data.position,
    subcategories: []
  };
};

export const deleteServiceCategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchServiceSubcategories = async (categoryId: string): Promise<ServiceSubcategory[]> => {
  const { data, error } = await supabase
    .from('service_subcategories')
    .select('*')
    .eq('category_id', categoryId);

  if (error) throw error;
  
  return (data || []).map(sub => ({
    id: sub.id,
    name: sub.name,
    description: sub.description,
    category_id: sub.category_id,
    jobs: []
  }));
};

export const createServiceSubcategory = async (subcategoryData: Partial<ServiceSubcategory>): Promise<ServiceSubcategory> => {
  const { data, error } = await supabase
    .from('service_subcategories')
    .insert({
      name: subcategoryData.name,
      description: subcategoryData.description,
      category_id: subcategoryData.category_id
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    jobs: []
  };
};

export const updateServiceSubcategory = async (id: string, subcategoryData: Partial<ServiceSubcategory>): Promise<ServiceSubcategory> => {
  const { data, error } = await supabase
    .from('service_subcategories')
    .update({
      name: subcategoryData.name,
      description: subcategoryData.description,
      category_id: subcategoryData.category_id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    category_id: data.category_id,
    jobs: []
  };
};

export const deleteServiceSubcategory = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const fetchServiceJobs = async (subcategoryId: string): Promise<ServiceJob[]> => {
  const { data, error } = await supabase
    .from('service_jobs')
    .select('*')
    .eq('subcategory_id', subcategoryId);

  if (error) throw error;
  
  return (data || []).map(job => ({
    id: job.id,
    name: job.name,
    description: job.description,
    estimatedTime: job.estimated_time,
    price: job.price,
    subcategory_id: job.subcategory_id
  }));
};

export const createServiceJob = async (jobData: Partial<ServiceJob>): Promise<ServiceJob> => {
  const { data, error } = await supabase
    .from('service_jobs')
    .insert({
      name: jobData.name,
      description: jobData.description,
      estimated_time: jobData.estimatedTime,
      price: jobData.price,
      subcategory_id: jobData.subcategory_id
    })
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    estimatedTime: data.estimated_time,
    price: data.price,
    subcategory_id: data.subcategory_id
  };
};

export const updateServiceJob = async (id: string, jobData: Partial<ServiceJob>): Promise<ServiceJob> => {
  const { data, error } = await supabase
    .from('service_jobs')
    .update({
      name: jobData.name,
      description: jobData.description,
      estimated_time: jobData.estimatedTime,
      price: jobData.price,
      subcategory_id: jobData.subcategory_id
    })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  
  return {
    id: data.id,
    name: data.name,
    description: data.description,
    estimatedTime: data.estimated_time,
    price: data.price,
    subcategory_id: data.subcategory_id
  };
};

export const deleteServiceJob = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);

  if (error) throw error;
};

export const bulkImportServices = async (categories: ServiceMainCategory[]): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Starting bulk import of', categories.length, 'categories...');
    
    const BATCH_SIZE = 10;
    const DELAY_MS = 100;
    
    for (let i = 0; i < categories.length; i += BATCH_SIZE) {
      const batch = categories.slice(i, i + BATCH_SIZE);
      console.log(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(categories.length / BATCH_SIZE)}`);
      
      for (const category of batch) {
        // Insert category
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
          console.error('Error inserting category:', categoryError);
          continue;
        }

        // Insert subcategories
        for (const subcategory of category.subcategories) {
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
            console.error('Error inserting subcategory:', subcategoryError);
            continue;
          }

          // Insert jobs
          for (const job of subcategory.jobs) {
            const { error: jobError } = await supabase
              .from('service_jobs')
              .insert({
                name: job.name,
                description: job.description,
                estimated_time: job.estimatedTime,
                price: job.price,
                subcategory_id: subcategoryData.id
              });

            if (jobError) {
              console.error('Error inserting job:', jobError);
            }
          }
        }
      }
      
      // Add delay between batches
      if (i + BATCH_SIZE < categories.length) {
        await new Promise(resolve => setTimeout(resolve, DELAY_MS));
      }
    }

    console.log('Bulk import completed');
    return await fetchServiceCategories();
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw error;
  }
};

export const fetchRawServiceData = async () => {
  const [categoriesResult, subcategoriesResult, jobsResult] = await Promise.all([
    supabase.from('service_categories').select('*'),
    supabase.from('service_subcategories').select('*'),
    supabase.from('service_jobs').select('*')
  ]);

  return {
    categories: categoriesResult.data || [],
    subcategories: subcategoriesResult.data || [],
    jobs: jobsResult.data || []
  };
};
