
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { comprehensiveAutomotiveServices } from '@/data/comprehensiveServices';

/**
 * Fetch service categories from comprehensive automotive services data
 * This replaces the limited service data with a full automotive service catalog
 */
export const fetchServiceCategories = async (): Promise<ServiceMainCategory[]> => {
  try {
    // Simulate API delay for realistic behavior
    await new Promise(resolve => setTimeout(resolve, 100));
    
    console.log('Loading comprehensive automotive services...', {
      categoriesCount: comprehensiveAutomotiveServices.length,
      totalJobs: comprehensiveAutomotiveServices.reduce((total, cat) => 
        total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0)
    });
    
    return comprehensiveAutomotiveServices;
  } catch (error) {
    console.error('Error fetching service categories:', error);
    throw new Error('Failed to load service categories');
  }
};

/**
 * Get all service jobs flattened from categories
 */
export const fetchAllServiceJobs = async () => {
  const categories = await fetchServiceCategories();
  return categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => 
      subcategory.jobs.map(job => ({
        ...job,
        categoryName: category.name,
        subcategoryName: subcategory.name
      }))
    )
  );
};

/**
 * Search for services by name or description
 */
export const searchServices = async (query: string) => {
  const allJobs = await fetchAllServiceJobs();
  const lowercaseQuery = query.toLowerCase();
  
  return allJobs.filter(job => 
    job.name.toLowerCase().includes(lowercaseQuery) ||
    (job.description && job.description.toLowerCase().includes(lowercaseQuery)) ||
    job.categoryName.toLowerCase().includes(lowercaseQuery) ||
    job.subcategoryName.toLowerCase().includes(lowercaseQuery)
  );
};

/**
 * Update service category
 */
export const updateServiceCategory = async (categoryId: string, updates: Partial<ServiceMainCategory>) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Updated service category:', categoryId, updates);
    return { success: true };
  } catch (error) {
    console.error('Error updating service category:', error);
    throw new Error('Failed to update service category');
  }
};

/**
 * Delete service category
 */
export const deleteServiceCategory = async (categoryId: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Deleted service category:', categoryId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service category:', error);
    throw new Error('Failed to delete service category');
  }
};

/**
 * Delete service subcategory
 */
export const deleteServiceSubcategory = async (subcategoryId: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Deleted service subcategory:', subcategoryId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service subcategory:', error);
    throw new Error('Failed to delete service subcategory');
  }
};

/**
 * Delete service job
 */
export const deleteServiceJob = async (jobId: string) => {
  try {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 200));
    console.log('Deleted service job:', jobId);
    return { success: true };
  } catch (error) {
    console.error('Error deleting service job:', error);
    throw new Error('Failed to delete service job');
  }
};
