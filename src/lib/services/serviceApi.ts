
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
      if (item.subcategories) {
        if (typeof item.subcategories === 'string') {
          subcategories = JSON.parse(item.subcategories);
        } else if (Array.isArray(item.subcategories)) {
          subcategories = item.subcategories as ServiceSubcategory[];
        } else if (typeof item.subcategories === 'object') {
          // Handle case where it's already an object but not an array
          subcategories = item.subcategories as ServiceSubcategory[];
        }
      }
      
      // Ensure each subcategory has proper structure
      subcategories = (subcategories || []).map(sub => ({
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

export const saveServiceCategory = async (category: ServiceMainCategory): Promise<void> => {
  return updateServiceCategory(category);
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

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  // Get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    console.error('Error fetching category for subcategory deletion:', fetchError);
    throw fetchError;
  }

  // Parse subcategories and remove the target one
  let subcategories: ServiceSubcategory[] = [];
  try {
    if (category.subcategories) {
      if (typeof category.subcategories === 'string') {
        subcategories = JSON.parse(category.subcategories);
      } else {
        subcategories = category.subcategories as ServiceSubcategory[];
      }
    }
  } catch (error) {
    console.error('Error parsing subcategories:', error);
    subcategories = [];
  }

  // Filter out the subcategory to delete
  const updatedSubcategories = subcategories.filter(sub => sub.id !== subcategoryId);

  // Update the category with the new subcategories
  const { error: updateError } = await supabase
    .from('service_hierarchy')
    .update({
      subcategories: JSON.stringify(updatedSubcategories)
    })
    .eq('id', categoryId);

  if (updateError) {
    console.error('Error updating category after subcategory deletion:', updateError);
    throw updateError;
  }
};

export const deleteServiceJob = async (categoryId: string, subcategoryId: string, jobId: string): Promise<void> => {
  // Get the current category
  const { data: category, error: fetchError } = await supabase
    .from('service_hierarchy')
    .select('*')
    .eq('id', categoryId)
    .single();

  if (fetchError) {
    console.error('Error fetching category for job deletion:', fetchError);
    throw fetchError;
  }

  // Parse subcategories
  let subcategories: ServiceSubcategory[] = [];
  try {
    if (category.subcategories) {
      if (typeof category.subcategories === 'string') {
        subcategories = JSON.parse(category.subcategories);
      } else {
        subcategories = category.subcategories as ServiceSubcategory[];
      }
    }
  } catch (error) {
    console.error('Error parsing subcategories:', error);
    subcategories = [];
  }

  // Find the subcategory and remove the job
  const updatedSubcategories = subcategories.map(sub => {
    if (sub.id === subcategoryId) {
      return {
        ...sub,
        jobs: sub.jobs.filter(job => job.id !== jobId)
      };
    }
    return sub;
  });

  // Update the category with the new subcategories
  const { error: updateError } = await supabase
    .from('service_hierarchy')
    .update({
      subcategories: JSON.stringify(updatedSubcategories)
    })
    .eq('id', categoryId);

  if (updateError) {
    console.error('Error updating category after job deletion:', updateError);
    throw updateError;
  }
};

export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  if (type === 'category') {
    return deleteServiceCategory(itemId);
  }
  
  // For subcategories and jobs, we need more context about which category they belong to
  // This is a simplified implementation - in a real app you'd need to track parent relationships
  throw new Error(`Removing ${type} duplicates requires additional context about parent categories`);
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
