
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

// Helper function to safely parse JSON subcategories
function parseSubcategories(subcategoriesJson: any): ServiceSubcategory[] {
  if (!subcategoriesJson) return [];
  
  try {
    // If it's already an array, return it
    if (Array.isArray(subcategoriesJson)) {
      return subcategoriesJson as ServiceSubcategory[];
    }
    
    // If it's a string, parse it
    if (typeof subcategoriesJson === 'string') {
      const parsed = JSON.parse(subcategoriesJson);
      return Array.isArray(parsed) ? parsed as ServiceSubcategory[] : [];
    }
    
    // If it's an object, convert to array
    if (typeof subcategoriesJson === 'object') {
      return Object.values(subcategoriesJson) as ServiceSubcategory[];
    }
    
    return [];
  } catch (error) {
    console.error('Error parsing subcategories:', error);
    return [];
  }
}

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('service_hierarchy')
      .select('*')
      .order('position', { ascending: true });

    if (error) {
      console.error('Supabase error:', error);
      throw new Error(`Failed to fetch service categories: ${error.message}`);
    }

    if (!data || data.length === 0) {
      console.log('No service categories found in database');
      return [];
    }

    console.log('Raw database data:', data);

    const categories: ServiceMainCategory[] = data.map((item) => ({
      id: item.id,
      name: item.name || 'Unnamed Category',
      description: item.description,
      position: item.position,
      subcategories: parseSubcategories(item.subcategories)
    }));

    console.log('Transformed categories:', categories);
    return categories;
  } catch (error) {
    console.error('Error in fetchServiceCategories:', error);
    throw error;
  }
};

export const updateServiceCategory = async (category: ServiceMainCategory): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .update({
        name: category.name,
        description: category.description,
        subcategories: JSON.stringify(category.subcategories),
        position: category.position
      })
      .eq('id', category.id);

    if (error) {
      throw new Error(`Failed to update service category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating service category:', error);
    throw error;
  }
};

export const saveServiceCategory = async (category: ServiceMainCategory): Promise<void> => {
  return updateServiceCategory(category);
};

export const createServiceCategory = async (category: Omit<ServiceMainCategory, 'id'>): Promise<ServiceMainCategory> => {
  try {
    const { data, error } = await supabase
      .from('service_hierarchy')
      .insert({
        name: category.name,
        description: category.description,
        subcategories: JSON.stringify(category.subcategories || []),
        position: category.position || 0
      })
      .select()
      .single();

    if (error) {
      throw new Error(`Failed to create service category: ${error.message}`);
    }

    return {
      id: data.id,
      name: data.name,
      description: data.description,
      position: data.position,
      subcategories: parseSubcategories(data.subcategories)
    };
  } catch (error) {
    console.error('Error creating service category:', error);
    throw error;
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('service_hierarchy')
      .delete()
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete service category: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

export const updateServiceSubcategory = async (
  categoryId: string,
  subcategoryId: string,
  updatedSubcategory: ServiceSubcategory
): Promise<void> => {
  try {
    // First, fetch the current category
    const { data: categoryData, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch service category: ${fetchError.message}`);
    }

    const subcategories = parseSubcategories(categoryData.subcategories);
    
    // Find and update the subcategory
    const updatedSubcategories = subcategories.map(sub => 
      sub.id === subcategoryId ? updatedSubcategory : sub
    );

    // Update the category with the modified subcategories
    const { error } = await supabase
      .from('service_hierarchy')
      .update({
        subcategories: JSON.stringify(updatedSubcategories)
      })
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to update subcategory: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating service subcategory:', error);
    throw error;
  }
};

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  try {
    // First, fetch the current category
    const { data: categoryData, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch service category: ${fetchError.message}`);
    }

    const subcategories = parseSubcategories(categoryData.subcategories);
    
    // Filter out the subcategory to delete
    const updatedSubcategories = subcategories.filter(sub => sub.id !== subcategoryId);

    // Update the category with the filtered subcategories
    const { error } = await supabase
      .from('service_hierarchy')
      .update({
        subcategories: JSON.stringify(updatedSubcategories)
      })
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete subcategory: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw error;
  }
};

export const updateServiceJob = async (
  categoryId: string,
  subcategoryId: string,
  jobId: string,
  updatedJob: ServiceJob
): Promise<void> => {
  try {
    // First, fetch the current category
    const { data: categoryData, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch service category: ${fetchError.message}`);
    }

    const subcategories = parseSubcategories(categoryData.subcategories);
    
    // Find and update the job in the subcategory
    const updatedSubcategories = subcategories.map(sub => {
      if (sub.id === subcategoryId) {
        return {
          ...sub,
          jobs: sub.jobs.map(job => job.id === jobId ? updatedJob : job)
        };
      }
      return sub;
    });

    // Update the category with the modified subcategories
    const { error } = await supabase
      .from('service_hierarchy')
      .update({
        subcategories: JSON.stringify(updatedSubcategories)
      })
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to update service job: ${error.message}`);
    }
  } catch (error) {
    console.error('Error updating service job:', error);
    throw error;
  }
};

export const deleteServiceJob = async (
  categoryId: string,
  subcategoryId: string,
  jobId: string
): Promise<void> => {
  try {
    // First, fetch the current category
    const { data: categoryData, error: fetchError } = await supabase
      .from('service_hierarchy')
      .select('*')
      .eq('id', categoryId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch service category: ${fetchError.message}`);
    }

    const subcategories = parseSubcategories(categoryData.subcategories);
    
    // Find and remove the job from the subcategory
    const updatedSubcategories = subcategories.map(sub => {
      if (sub.id === subcategoryId) {
        return {
          ...sub,
          jobs: sub.jobs.filter(job => job.id !== jobId)
        };
      }
      return sub;
    });

    // Update the category with the modified subcategories
    const { error } = await supabase
      .from('service_hierarchy')
      .update({
        subcategories: JSON.stringify(updatedSubcategories)
      })
      .eq('id', categoryId);

    if (error) {
      throw new Error(`Failed to delete service job: ${error.message}`);
    }
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw error;
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[],
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    const total = categories.length;
    let completed = 0;

    for (const category of categories) {
      const { error } = await supabase
        .from('service_hierarchy')
        .upsert({
          id: category.id,
          name: category.name,
          description: category.description,
          subcategories: JSON.stringify(category.subcategories || []),
          position: category.position || 0
        });

      if (error) {
        throw new Error(`Failed to import category ${category.name}: ${error.message}`);
      }

      completed++;
      if (onProgress) {
        onProgress((completed / total) * 100);
      }
    }
  } catch (error) {
    console.error('Error in bulk import:', error);
    throw error;
  }
};

export const removeDuplicateItem = async (
  itemId: string,
  type: 'category' | 'subcategory' | 'job'
): Promise<void> => {
  // This is a placeholder implementation
  // In a real implementation, you would need additional context
  // like parent IDs to locate and remove the specific duplicate
  console.log(`Removing duplicate ${type} with ID: ${itemId}`);
  
  // For now, just return a resolved promise
  return Promise.resolve();
};
