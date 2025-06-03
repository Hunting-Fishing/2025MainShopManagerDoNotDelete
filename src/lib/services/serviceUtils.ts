import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

/**
 * Format estimated time from minutes to human-readable format
 */
export const formatEstimatedTime = (minutes: number): string => {
  if (!minutes || minutes <= 0) return 'N/A';
  
  if (minutes < 60) {
    return `${minutes} min`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (remainingMinutes === 0) {
    return `${hours}h`;
  }
  
  return `${hours}h ${remainingMinutes}m`;
};

/**
 * Format price as currency
 */
export const formatPrice = (price: number): string => {
  if (!price || price <= 0) return 'N/A';
  
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2
  }).format(price);
};

/**
 * Search through service categories by name or description
 */
export const searchServiceCategories = (
  categories: ServiceMainCategory[],
  searchTerm: string
): ServiceMainCategory[] => {
  if (!searchTerm.trim()) return categories;
  
  const lowercaseTerm = searchTerm.toLowerCase();
  
  return categories.filter((category) => {
    // Check if the category matches
    if (
      category.name.toLowerCase().includes(lowercaseTerm) ||
      (category.description && category.description.toLowerCase().includes(lowercaseTerm))
    ) {
      return true;
    }
    
    // Check if any subcategories match
    const matchingSubcategories = category.subcategories.filter((sub) => {
      if (
        sub.name.toLowerCase().includes(lowercaseTerm) ||
        (sub.description && sub.description.toLowerCase().includes(lowercaseTerm))
      ) {
        return true;
      }
      
      // Check if any jobs match
      return sub.jobs.some(
        (job) =>
          job.name.toLowerCase().includes(lowercaseTerm) ||
          (job.description && job.description.toLowerCase().includes(lowercaseTerm))
      );
    });
    
    return matchingSubcategories.length > 0;
  });
};

/**
 * Get all jobs from categories with search highlighting
 */
export const searchAllJobs = (
  categories: ServiceMainCategory[],
  searchTerm: string
): (ServiceJob & { searchMatch?: { score: number; matchType: string } })[] => {
  const jobs: (ServiceJob & { searchMatch?: { score: number; matchType: string } })[] = [];
  const lowercaseTerm = searchTerm.toLowerCase();

  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        let score = 0;
        let matchType = '';

        if (job.name.toLowerCase().includes(lowercaseTerm)) {
          score += 100;
          matchType = 'name';
        }
        if (job.description && job.description.toLowerCase().includes(lowercaseTerm)) {
          score += 50;
          matchType = matchType ? 'name+description' : 'description';
        }
        if (category.name.toLowerCase().includes(lowercaseTerm)) {
          score += 25;
          matchType = matchType ? matchType + '+category' : 'category';
        }
        if (subcategory.name.toLowerCase().includes(lowercaseTerm)) {
          score += 25;
          matchType = matchType ? matchType + '+subcategory' : 'subcategory';
        }

        if (score > 0) {
          jobs.push({
            ...job,
            searchMatch: { score, matchType }
          });
        }
      });
    });
  });

  return jobs.sort((a, b) => (b.searchMatch?.score || 0) - (a.searchMatch?.score || 0));
};

/**
 * Find duplicates in service categories based on name similarity
 */
export const findDuplicateCategories = (categories: ServiceMainCategory[]) => {
  const duplicates: { category1: ServiceMainCategory; category2: ServiceMainCategory; similarity: number }[] = [];
  
  for (let i = 0; i < categories.length; i++) {
    for (let j = i + 1; j < categories.length; j++) {
      const similarity = calculateStringSimilarity(categories[i].name, categories[j].name);
      if (similarity > 0.8) { // 80% similarity threshold
        duplicates.push({
          category1: categories[i],
          category2: categories[j],
          similarity
        });
      }
    }
  }
  
  return duplicates;
};

/**
 * Calculate string similarity using Levenshtein distance
 */
const calculateStringSimilarity = (str1: string, str2: string): number => {
  const a = str1.toLowerCase();
  const b = str2.toLowerCase();
  
  if (a === b) return 1;
  if (a.length === 0 || b.length === 0) return 0;
  
  const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(null));
  
  for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const indicator = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  const maxLength = Math.max(a.length, b.length);
  return (maxLength - matrix[b.length][a.length]) / maxLength;
};

/**
 * Validate service category data
 */
export const validateServiceCategory = (category: Partial<ServiceMainCategory>): string[] => {
  const errors: string[] = [];
  
  if (!category.name || category.name.trim().length === 0) {
    errors.push('Category name is required');
  }
  
  if (category.name && category.name.trim().length > 100) {
    errors.push('Category name must be less than 100 characters');
  }
  
  if (category.description && category.description.length > 500) {
    errors.push('Category description must be less than 500 characters');
  }
  
  return errors;
};

/**
 * Validate service job data
 */
export const validateServiceJob = (job: Partial<ServiceJob>): string[] => {
  const errors: string[] = [];
  
  if (!job.name || job.name.trim().length === 0) {
    errors.push('Job name is required');
  }
  
  if (job.name && job.name.trim().length > 200) {
    errors.push('Job name must be less than 200 characters');
  }
  
  if (job.price && job.price < 0) {
    errors.push('Price must be a positive number');
  }
  
  if (job.estimatedTime && job.estimatedTime < 0) {
    errors.push('Estimated time must be a positive number');
  }
  
  return errors;
};
