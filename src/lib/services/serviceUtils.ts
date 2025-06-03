
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { enhancedSearch, sortByRelevance } from '@/utils/search/enhancedSearch';

/**
 * Search through service categories with enhanced brake line support
 */
export function searchServiceCategories(
  categories: ServiceMainCategory[],
  query: string
): ServiceMainCategory[] {
  if (!query.trim()) return categories;
  
  const results: ServiceMainCategory[] = [];
  
  for (const category of categories) {
    // Check if category matches
    const categoryMatch = enhancedSearch(category.name, query) || 
                         (category.description ? enhancedSearch(category.description, query) : null);
    
    const matchingSubcategories = [];
    
    for (const subcategory of category.subcategories) {
      // Check if subcategory matches
      const subcategoryMatch = enhancedSearch(subcategory.name, query) || 
                              (subcategory.description ? enhancedSearch(subcategory.description, query) : null);
      
      // Get matching jobs with enhanced search
      const matchingJobs = sortByRelevance(subcategory.jobs, query);
      
      // Include subcategory if it matches, has matching jobs, or category matches
      if (subcategoryMatch || matchingJobs.length > 0 || categoryMatch) {
        matchingSubcategories.push({
          ...subcategory,
          jobs: matchingJobs.length > 0 ? matchingJobs : subcategory.jobs
        });
      }
    }
    
    // Include category if it matches or has matching subcategories
    if (categoryMatch || matchingSubcategories.length > 0) {
      results.push({
        ...category,
        subcategories: matchingSubcategories
      });
    }
  }
  
  return results;
}

/**
 * Get all jobs that match a search query across all categories
 */
export function searchAllJobs(categories: ServiceMainCategory[], query: string): ServiceJob[] {
  const allJobs = categories.flatMap(category => 
    category.subcategories.flatMap(subcategory => subcategory.jobs)
  );
  
  return sortByRelevance(allJobs, query);
}

/**
 * Validate service data integrity
 */
export function validateServiceData(categories: ServiceMainCategory[]): boolean {
  try {
    for (const category of categories) {
      if (!category.id || !category.name || !category.subcategories) {
        console.error('Invalid category data:', category);
        return false;
      }
      
      for (const subcategory of category.subcategories) {
        if (!subcategory.id || !subcategory.name || !subcategory.jobs) {
          console.error('Invalid subcategory data:', subcategory);
          return false;
        }
        
        for (const job of subcategory.jobs) {
          if (!job.id || !job.name) {
            console.error('Invalid job data:', job);
            return false;
          }
        }
      }
    }
    
    console.log('Service data validation passed:', {
      categories: categories.length,
      totalJobs: categories.reduce((total, cat) => 
        total + cat.subcategories.reduce((subTotal, sub) => subTotal + sub.jobs.length, 0), 0)
    });
    
    return true;
  } catch (error) {
    console.error('Service data validation failed:', error);
    return false;
  }
}
