
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
