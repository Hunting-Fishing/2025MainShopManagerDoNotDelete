
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const getServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (error) {
      console.error('Error fetching service categories:', error);
      throw error;
    }

    // Ensure that data and data.categories are not null before returning
    return data?.categories || [];
  } catch (error) {
    console.error('Error in getServiceCategories:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const fetchServiceCategories = getServiceCategories;

export const updateServiceCategories = async (categories: ServiceMainCategory[]): Promise<void> => {
  try {
    const { data, error } = await supabase
      .from('service_categories')
      .update({ categories: categories })
      .single();

    if (error) {
      console.error('Error updating service categories:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateServiceCategories:', error);
    throw error;
  }
};

export const createServiceCategory = async (newCategory: ServiceMainCategory): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];

    // Add the new category
    const updatedCategories = [...categories, newCategory];

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error creating service category:', error);
    throw error;
  }
};

// Alias for backward compatibility
export const saveServiceCategory = createServiceCategory;

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];

    // Remove the category
    const updatedCategories = categories.filter(cat => cat.id !== categoryId);

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw error;
  }
};

export const deleteServiceSubcategory = async (subcategoryId: string): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];

    // Find and remove the subcategory
    const updatedCategories = categories.map(category => ({
      ...category,
      subcategories: category.subcategories.filter(sub => sub.id !== subcategoryId)
    }));

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw error;
  }
};

export const deleteServiceJob = async (jobId: string): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];

    // Find and remove the job
    const updatedCategories = categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job => job.id !== jobId)
      }))
    }));

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw error;
  }
};

export const updateCategoryPosition = async (categoryId: string, newPosition: number): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];

    // Find the category to update
    const updatedCategories = categories.map(category => {
      if (category.id === categoryId) {
        return { ...category, position: newPosition };
      }
      return category;
    });

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error updating category position:', error);
    throw error;
  }
};

export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  try {
    // Get current service categories
    const { data: currentData, error: fetchError } = await supabase
      .from('service_categories')
      .select('categories')
      .single();

    if (fetchError) throw fetchError;

    const categories: ServiceMainCategory[] = currentData?.categories || [];
    let updatedCategories = [...categories];

    if (type === 'category') {
      // Remove the category
      updatedCategories = updatedCategories.filter(cat => cat.id !== itemId);
    } else if (type === 'subcategory') {
      // Find and remove the subcategory
      updatedCategories = updatedCategories.map(category => ({
        ...category,
        subcategories: category.subcategories.filter(sub => sub.id !== itemId)
      }));
    } else if (type === 'job') {
      // Find and remove the job
      updatedCategories = updatedCategories.map(category => ({
        ...category,
        subcategories: category.subcategories.map(subcategory => ({
          ...subcategory,
          jobs: subcategory.jobs.filter(job => job.id !== itemId)
        }))
      }));
    }

    // Update the database
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: updatedCategories })
      .single();

    if (updateError) throw updateError;
  } catch (error) {
    console.error('Error removing duplicate item:', error);
    throw error;
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[], 
  progressCallback?: (progress: number) => void
): Promise<void> => {
  try {
    // Simulate progress for bulk import
    if (progressCallback) progressCallback(10);
    
    // Update the database with new categories
    const { error: updateError } = await supabase
      .from('service_categories')
      .update({ categories: categories })
      .single();

    if (updateError) throw updateError;
    
    if (progressCallback) progressCallback(100);
  } catch (error) {
    console.error('Error bulk importing service categories:', error);
    throw error;
  }
};
