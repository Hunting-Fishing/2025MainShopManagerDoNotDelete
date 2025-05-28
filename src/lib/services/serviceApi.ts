
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  console.log('Fetching service categories from database...');
  
  const { data, error } = await supabase
    .from('service_hierarchy')
    .select('*')
    .order('position', { ascending: true });

  if (error) {
    console.error('Error fetching service categories:', error);
    throw error;
  }

  if (!data || data.length === 0) {
    console.log('No service categories found in database');
    return [];
  }

  console.log('Raw service hierarchy data:', data);

  // Transform the database data into the expected format
  const transformedCategories: ServiceMainCategory[] = data.map(item => {
    let subcategories: ServiceSubcategory[] = [];
    
    try {
      // Parse the subcategories JSON if it exists
      if (item.subcategories && typeof item.subcategories === 'string') {
        subcategories = JSON.parse(item.subcategories);
      } else if (item.subcategories && typeof item.subcategories === 'object') {
        subcategories = item.subcategories;
      }
      
      // Ensure each subcategory has proper structure
      subcategories = subcategories.map(sub => ({
        id: sub.id || `sub-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        name: sub.name || 'Unnamed Subcategory',
        description: sub.description,
        jobs: (sub.jobs || []).map((job: any) => ({
          id: job.id || `job-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: job.name || 'Unnamed Service',
          description: job.description,
          estimatedTime: job.estimatedTime || job.estimated_time,
          price: job.price
        }))
      }));
    } catch (parseError) {
      console.error('Error parsing subcategories for category:', item.name, parseError);
      subcategories = [];
    }

    return {
      id: item.id,
      name: item.name,
      description: item.description,
      subcategories,
      position: item.position
    };
  });

  console.log('Transformed categories:', transformedCategories);
  return transformedCategories;
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  console.log('Starting bulk import of service categories...');
  
  for (let i = 0; i < categories.length; i++) {
    const category = categories[i];
    
    // Convert subcategories to JSON string for storage
    const subcategoriesJson = JSON.stringify(category.subcategories);
    
    const { error } = await supabase
      .from('service_hierarchy')
      .upsert({
        id: category.id,
        name: category.name,
        description: category.description,
        subcategories: subcategoriesJson,
        position: category.position || i + 1
      });

    if (error) {
      console.error('Error importing category:', category.name, error);
      throw error;
    }

    if (onProgress) {
      onProgress(((i + 1) / categories.length) * 100);
    }
  }
  
  console.log('Bulk import completed successfully');
};

export const updateServiceCategory = async (category: ServiceMainCategory): Promise<void> => {
  const subcategoriesJson = JSON.stringify(category.subcategories);
  
  const { error } = await supabase
    .from('service_hierarchy')
    .update({
      name: category.name,
      description: category.description,
      subcategories: subcategoriesJson,
      position: category.position
    })
    .eq('id', category.id);

  if (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  const { error } = await supabase
    .from('service_hierarchy')
    .delete()
    .eq('id', categoryId);

  if (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> => {
  const subcategoriesJson = JSON.stringify(category.subcategories);
  
  const { data, error } = await supabase
    .from('service_hierarchy')
    .insert({
      name: category.name,
      description: category.description,
      subcategories: subcategoriesJson,
      position: category.position
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating service category:', error);
    throw error;
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    subcategories: category.subcategories,
    position: data.position
  };
};
