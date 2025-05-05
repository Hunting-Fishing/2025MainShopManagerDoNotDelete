
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

// Interface for duplicate items
export interface DuplicateItem {
  name: string;
  type: 'category' | 'subcategory' | 'job';
  occurrences: {
    id: string;
    path: string; // Path showing where this item exists, e.g., "Category A > Subcategory B"
    itemId: string;
  }[];
}

/**
 * Finds duplicate service items across categories, subcategories, and jobs
 */
export const findServiceDuplicates = (categories: ServiceMainCategory[]): DuplicateItem[] => {
  // Maps to track names
  const nameMap: Record<string, {
    type: 'category' | 'subcategory' | 'job';
    occurrences: { id: string, path: string, itemId: string }[];
  }> = {};
  
  // Process all categories, subcategories and jobs
  categories.forEach(category => {
    // Check category names
    const categoryName = category.name.toLowerCase().trim();
    if (!nameMap[categoryName]) {
      nameMap[categoryName] = { 
        type: 'category', 
        occurrences: [] 
      };
    }
    nameMap[categoryName].occurrences.push({
      id: category.id,
      path: category.name,
      itemId: category.id
    });
    
    // Check subcategory names
    category.subcategories.forEach(subcategory => {
      const subcategoryName = subcategory.name.toLowerCase().trim();
      if (!nameMap[subcategoryName]) {
        nameMap[subcategoryName] = {
          type: 'subcategory',
          occurrences: []
        };
      }
      nameMap[subcategoryName].occurrences.push({
        id: subcategory.id,
        path: `${category.name} > ${subcategory.name}`,
        itemId: subcategory.id
      });
      
      // Check job names
      subcategory.jobs.forEach(job => {
        const jobName = job.name.toLowerCase().trim();
        if (!nameMap[jobName]) {
          nameMap[jobName] = {
            type: 'job',
            occurrences: []
          };
        }
        nameMap[jobName].occurrences.push({
          id: job.id,
          path: `${category.name} > ${subcategory.name} > ${job.name}`,
          itemId: job.id
        });
      });
    });
  });
  
  // Filter for duplicates only (more than 1 occurrence)
  const duplicates: DuplicateItem[] = [];
  
  Object.entries(nameMap).forEach(([name, info]) => {
    if (info.occurrences.length > 1) {
      duplicates.push({
        name: name,
        type: info.type,
        occurrences: info.occurrences
      });
    }
  });
  
  return duplicates;
};

/**
 * Generate recommendations for handling duplicates
 */
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length > 0) {
    recommendations.push("Consider consolidating duplicate items to maintain data consistency.");
    recommendations.push("Use more specific naming for similar services in different categories.");
    
    // Add specific recommendations based on duplicate types
    const categoryDuplicates = duplicates.filter(d => d.type === 'category').length;
    const subcategoryDuplicates = duplicates.filter(d => d.type === 'subcategory').length;
    const jobDuplicates = duplicates.filter(d => d.type === 'job').length;
    
    if (categoryDuplicates > 0) {
      recommendations.push(`Merge or rename ${categoryDuplicates} duplicate categories to avoid confusion.`);
    }
    
    if (subcategoryDuplicates > 0) {
      recommendations.push(`Review ${subcategoryDuplicates} duplicate subcategories, which may indicate overlapping service areas.`);
    }
    
    if (jobDuplicates > 0) {
      recommendations.push(`Standardize naming for ${jobDuplicates} duplicate services to ensure consistent pricing and descriptions.`);
    }
  } else {
    recommendations.push("No duplicates found. Your service hierarchy is well-organized.");
  }
  
  return recommendations;
};
