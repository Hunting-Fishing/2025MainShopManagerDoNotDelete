import { ServiceMainCategory } from '@/types/serviceHierarchy';

// Mock data - this would normally come from Supabase
const mockServiceData = {
  categories: [
    {
      id: "1",
      name: "Oil Change & Maintenance", 
      description: "Regular maintenance services",
      display_order: 1,
      is_active: true,
      subcategories: [
        {
          id: "1-1",
          name: "Oil Changes",
          description: "Oil change services",
          category_id: "1", 
          display_order: 1,
          jobs: [
            { 
              id: "1-1-1", 
              name: "Standard Oil Change", 
              description: "Standard oil change service",
              subcategory_id: "1-1",
              category_id: "1",
              base_price: 35,
              estimated_duration: 30,
              skill_level: "basic",
              display_order: 1,
              is_active: true,
              estimatedTime: 30,
              price: 35
            },
            { 
              id: "1-1-2", 
              name: "Synthetic Oil Change", 
              description: "Synthetic oil change service",
              subcategory_id: "1-1",
              category_id: "1",
              base_price: 65,
              estimated_duration: 30,
              skill_level: "basic",
              display_order: 2,
              is_active: true,
              estimatedTime: 30,
              price: 65
            }
          ]
        }
      ]
    }
  ]
};

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('🔄 Fetching service categories from mock data...');
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const categories = mockServiceData.categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      display_order: category.display_order,
      is_active: category.is_active,
      subcategories: category.subcategories.map(subcategory => ({
        id: subcategory.id,
        name: subcategory.name,
        description: subcategory.description,
        category_id: subcategory.category_id,
        display_order: subcategory.display_order,
        jobs: subcategory.jobs.map(job => ({
          id: job.id,
          name: job.name,
          description: job.description,
          subcategory_id: job.subcategory_id,
          category_id: job.category_id,
          base_price: job.base_price,
          estimated_duration: job.estimated_duration,
          skill_level: job.skill_level,
          display_order: job.display_order,
          is_active: job.is_active,
          // Keep backward compatibility fields
          estimatedTime: job.estimatedTime,
          price: job.price
        }))
      }))
    }));

    console.log('✅ Service categories loaded:', {
      categoriesCount: categories.length,
      totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
      totalJobs: categories.reduce((sum, cat) => sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0)
    });

    return categories;
  } catch (error) {
    console.error('❌ Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories');
  }
};

// Deprecated - use fetchServiceCategories instead
export const getServiceCategories = fetchServiceCategories;

// Helper function to get a flattened list of all jobs
export const fetchAllServiceJobs = async (): Promise<ServiceJob[]> => {
  const categories = await fetchServiceCategories();
  return categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => subcategory.jobs)
  );
};

// Helper function to search jobs by name
export const searchServiceJobs = async (query: string): Promise<ServiceJob[]> => {
  const allJobs = await fetchAllServiceJobs();
  return allJobs.filter(job => 
    job.name.toLowerCase().includes(query.toLowerCase()) ||
    (job.description && job.description.toLowerCase().includes(query.toLowerCase()))
  );
};

// Update functions for service management
export const updateServiceCategory = async (id: string, updates: Partial<{ name: string; description: string; position: number }>) => {
  const { error } = await supabase
    .from('service_categories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceSubcategory = async (id: string, updates: Partial<{ name: string; description: string }>) => {
  const { error } = await supabase
    .from('service_subcategories')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

export const updateServiceJob = async (id: string, updates: Partial<{ name: string; description: string; estimated_time: number; price: number }>) => {
  const { error } = await supabase
    .from('service_jobs')
    .update(updates)
    .eq('id', id);
  
  if (error) throw error;
};

// Delete functions for service management
export const deleteServiceCategory = async (id: string) => {
  const { error } = await supabase
    .from('service_categories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceSubcategory = async (id: string) => {
  const { error } = await supabase
    .from('service_subcategories')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};

export const deleteServiceJob = async (id: string) => {
  const { error } = await supabase
    .from('service_jobs')
    .delete()
    .eq('id', id);
  
  if (error) throw error;
};
