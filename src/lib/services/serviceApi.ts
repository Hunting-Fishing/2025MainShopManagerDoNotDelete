
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { getServiceCategories } from '@/lib/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    // For now, return the static service categories from serviceHierarchy
    // In the future, this could be enhanced to fetch from database
    return getServiceCategories();
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories');
  }
};

export const saveServiceCategory = async (category: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  try {
    // For now, return a mock saved category
    // In a real implementation, this would save to database
    const savedCategory: ServiceMainCategory = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name || '',
      description: category.description,
      subcategories: category.subcategories || [],
      position: category.position || 0
    };
    
    return savedCategory;
  } catch (error) {
    console.error('Error saving service category:', error);
    throw new Error('Failed to save service category');
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    // For now, this is a mock implementation
    // In a real implementation, this would delete from database
    console.log('Deleting service category:', categoryId);
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw new Error('Failed to delete service category');
  }
};

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  try {
    // For now, this is a mock implementation
    // In a real implementation, this would delete from database
    console.log('Deleting service subcategory:', subcategoryId, 'from category:', categoryId);
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error('Failed to delete service subcategory');
  }
};

export const deleteServiceJob = async (categoryId: string, subcategoryId: string, jobId: string): Promise<void> => {
  try {
    // For now, this is a mock implementation
    // In a real implementation, this would delete from database
    console.log('Deleting service job:', jobId, 'from subcategory:', subcategoryId, 'in category:', categoryId);
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw new Error('Failed to delete service job');
  }
};

export const bulkImportServiceCategories = async (
  categories: ServiceMainCategory[], 
  onProgress?: (progress: number) => void
): Promise<void> => {
  try {
    // Mock implementation for bulk import
    for (let i = 0; i < categories.length; i++) {
      // Simulate processing time
      await new Promise(resolve => setTimeout(resolve, 100));
      
      if (onProgress) {
        onProgress((i + 1) / categories.length * 100);
      }
    }
    
    console.log('Bulk import completed for', categories.length, 'categories');
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw new Error('Failed to import service categories');
  }
};

export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  try {
    // Mock implementation for removing duplicates
    console.log('Removing duplicate', type, 'with ID:', itemId);
  } catch (error) {
    console.error('Error removing duplicate item:', error);
    throw new Error('Failed to remove duplicate item');
  }
};

// Legacy function for compatibility
export const getServiceCategories = fetchServiceCategories;
export const createServiceCategory = saveServiceCategory;
export const updateServiceCategories = saveServiceCategory;
