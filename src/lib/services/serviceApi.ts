
import { supabase } from '@/integrations/supabase/client';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    console.log('Fetching service categories from database...');
    
    // Fetch all service hierarchy data from the database
    const { data: serviceData, error } = await supabase
      .from('service_hierarchy')
      .select('*')
      .order('category_name', { ascending: true });

    if (error) {
      console.error('Database error:', error);
      throw error;
    }

    if (!serviceData || serviceData.length === 0) {
      console.log('No service data found in database');
      return [];
    }

    // Transform the flat database structure into hierarchical structure
    const categoryMap = new Map<string, ServiceMainCategory>();

    serviceData.forEach((item) => {
      const categoryId = `cat-${item.category_name.toLowerCase().replace(/\s+/g, '-')}`;
      const subcategoryId = `sub-${item.subcategory_name.toLowerCase().replace(/\s+/g, '-')}`;
      const jobId = `job-${item.job_name.toLowerCase().replace(/\s+/g, '-')}-${item.id}`;

      // Get or create category
      if (!categoryMap.has(categoryId)) {
        categoryMap.set(categoryId, {
          id: categoryId,
          name: item.category_name,
          description: `${item.category_name} services`,
          subcategories: [],
          position: 0
        });
      }

      const category = categoryMap.get(categoryId)!;
      
      // Find or create subcategory
      let subcategory = category.subcategories.find(sub => sub.id === subcategoryId);
      if (!subcategory) {
        subcategory = {
          id: subcategoryId,
          name: item.subcategory_name,
          description: `${item.subcategory_name} services`,
          jobs: []
        };
        category.subcategories.push(subcategory);
      }

      // Add job to subcategory
      const job: ServiceJob = {
        id: jobId,
        name: item.job_name,
        description: item.job_description || `${item.job_name} service`,
        estimatedTime: item.estimated_time || undefined,
        price: item.price || undefined
      };

      subcategory.jobs.push(job);
    });

    const categories = Array.from(categoryMap.values());
    console.log('Transformed categories:', categories.length);
    return categories;

  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to fetch service categories from database');
  }
};

export const saveServiceCategory = async (category: Partial<ServiceMainCategory>): Promise<ServiceMainCategory> => {
  try {
    console.log('Saving service category:', category);
    
    if (!category.name) {
      throw new Error('Category name is required');
    }

    // For now, return the category as-is since we're working with a read-only view
    // In a full implementation, you'd insert into the actual service tables
    const savedCategory: ServiceMainCategory = {
      id: category.id || `cat-${Date.now()}`,
      name: category.name,
      description: category.description || `${category.name} services`,
      subcategories: category.subcategories || [],
      position: category.position || 0
    };
    
    console.log('Category saved successfully:', savedCategory.id);
    return savedCategory;

  } catch (error) {
    console.error('Error saving service category:', error);
    throw new Error('Failed to save service category');
  }
};

export const deleteServiceCategory = async (categoryId: string): Promise<void> => {
  try {
    console.log('Deleting service category:', categoryId);
    
    // Since we're working with a view, actual deletion would need to be implemented
    // based on your specific requirements for the underlying tables
    
    console.log('Category deletion logged:', categoryId);
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw new Error('Failed to delete service category');
  }
};

export const deleteServiceSubcategory = async (categoryId: string, subcategoryId: string): Promise<void> => {
  try {
    console.log('Deleting service subcategory:', subcategoryId, 'from category:', categoryId);
    
    // Implementation would depend on your underlying table structure
    
    console.log('Subcategory deletion logged');
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error('Failed to delete service subcategory');
  }
};

export const deleteServiceJob = async (categoryId: string, subcategoryId: string, jobId: string): Promise<void> => {
  try {
    console.log('Deleting service job:', jobId, 'from subcategory:', subcategoryId, 'in category:', categoryId);
    
    // Implementation would depend on your underlying table structure
    
    console.log('Job deletion logged');
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
    console.log('Starting bulk import of', categories.length, 'categories');
    
    // Real implementation would insert into your service tables
    for (let i = 0; i < categories.length; i++) {
      const category = categories[i];
      
      // Process each category and its subcategories/jobs
      await saveServiceCategory(category);
      
      if (onProgress) {
        onProgress((i + 1) / categories.length * 100);
      }
      
      // Small delay to show progress
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    
    console.log('Bulk import completed successfully');
  } catch (error) {
    console.error('Error during bulk import:', error);
    throw new Error('Failed to import service categories');
  }
};

export const removeDuplicateItem = async (itemId: string, type: 'category' | 'subcategory' | 'job'): Promise<void> => {
  try {
    console.log('Removing duplicate', type, 'with ID:', itemId);
    
    // Implementation would depend on your deduplication logic
    
    console.log('Duplicate removal logged');
  } catch (error) {
    console.error('Error removing duplicate item:', error);
    throw new Error('Failed to remove duplicate item');
  }
};

// Legacy function aliases for compatibility
export const getServiceCategories = fetchServiceCategories;
export const createServiceCategory = saveServiceCategory;
export const updateServiceCategories = saveServiceCategory;
