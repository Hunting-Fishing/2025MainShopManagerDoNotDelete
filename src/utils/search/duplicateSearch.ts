
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

export interface DuplicateOccurrence {
  id: string;        // A unique identifier for this occurrence
  path: string;      // Path in the hierarchy (e.g., "Category > Subcategory")
  itemId: string;    // The actual item ID in the database
}

export interface DuplicateItem {
  type: 'category' | 'subcategory' | 'job';
  name: string;
  occurrences: DuplicateOccurrence[];
}

export function findDuplicateItems(categories: ServiceMainCategory[]): DuplicateItem[] {
  const duplicates: Record<string, DuplicateItem> = {};
  
  // Normalize text for comparison (lowercase, trim whitespace)
  const normalizeText = (text: string): string => text.toLowerCase().trim();
  
  // Check for duplicate categories
  categories.forEach(category => {
    const normalizedName = normalizeText(category.name);
    
    if (!duplicates[`category:${normalizedName}`]) {
      duplicates[`category:${normalizedName}`] = {
        type: 'category',
        name: category.name,
        occurrences: []
      };
    }
    
    duplicates[`category:${normalizedName}`].occurrences.push({
      id: `cat-${category.id}`,
      path: category.name,
      itemId: category.id
    });
    
    // Check for duplicate subcategories across the entire hierarchy
    category.subcategories.forEach(subcategory => {
      const normalizedSubName = normalizeText(subcategory.name);
      
      if (!duplicates[`subcategory:${normalizedSubName}`]) {
        duplicates[`subcategory:${normalizedSubName}`] = {
          type: 'subcategory',
          name: subcategory.name,
          occurrences: []
        };
      }
      
      duplicates[`subcategory:${normalizedSubName}`].occurrences.push({
        id: `sub-${subcategory.id}`,
        path: `${category.name} > ${subcategory.name}`,
        itemId: subcategory.id
      });
      
      // Check for duplicate jobs/services across the entire hierarchy
      subcategory.jobs.forEach(job => {
        const normalizedJobName = normalizeText(job.name);
        
        if (!duplicates[`job:${normalizedJobName}`]) {
          duplicates[`job:${normalizedJobName}`] = {
            type: 'job',
            name: job.name,
            occurrences: []
          };
        }
        
        duplicates[`job:${normalizedJobName}`].occurrences.push({
          id: `job-${job.id}`,
          path: `${category.name} > ${subcategory.name} > ${job.name}`,
          itemId: job.id
        });
      });
    });
  });
  
  // Filter out non-duplicates (items with only one occurrence)
  return Object.values(duplicates).filter(item => item.occurrences.length > 1);
}
