
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface DuplicateItem {
  name: string;
  type: 'category' | 'subcategory' | 'job';
  occurrences: Array<{
    itemId: string;
    parentId?: string;
    path: string;
  }>;
}

export function findServiceDuplicates(categories: ServiceMainCategory[]): DuplicateItem[] {
  const duplicates: DuplicateItem[] = [];
  const nameMap = new Map<string, Array<{ id: string; type: 'category' | 'subcategory' | 'job'; parentId?: string; path: string }>>();

  // Check category names
  categories.forEach((category) => {
    const key = category.name.toLowerCase();
    if (!nameMap.has(key)) {
      nameMap.set(key, []);
    }
    nameMap.get(key)!.push({
      id: category.id,
      type: 'category',
      path: category.name
    });

    // Check subcategory names
    category.subcategories?.forEach((subcategory) => {
      const subKey = subcategory.name.toLowerCase();
      if (!nameMap.has(subKey)) {
        nameMap.set(subKey, []);
      }
      nameMap.get(subKey)!.push({
        id: subcategory.id,
        type: 'subcategory',
        parentId: category.id,
        path: `${category.name} > ${subcategory.name}`
      });

      // Check job names
      subcategory.jobs?.forEach((job) => {
        const jobKey = job.name.toLowerCase();
        if (!nameMap.has(jobKey)) {
          nameMap.set(jobKey, []);
        }
        nameMap.get(jobKey)!.push({
          id: job.id,
          type: 'job',
          parentId: subcategory.id,
          path: `${category.name} > ${subcategory.name} > ${job.name}`
        });
      });
    });
  });

  // Find duplicates
  nameMap.forEach((occurrences, name) => {
    if (occurrences.length > 1) {
      duplicates.push({
        name,
        type: occurrences[0].type,
        occurrences: occurrences.map(occ => ({
          itemId: occ.id,
          parentId: occ.parentId,
          path: occ.path
        }))
      });
    }
  });

  return duplicates;
}

export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];

  if (duplicates.length === 0) {
    recommendations.push("No duplicates found! Your service hierarchy is well-organized.");
    return recommendations;
  }

  recommendations.push(`Found ${duplicates.length} duplicate item${duplicates.length > 1 ? 's' : ''} in your service hierarchy.`);
  
  const categoryDuplicates = duplicates.filter(d => d.type === 'category').length;
  const subcategoryDuplicates = duplicates.filter(d => d.type === 'subcategory').length;
  const jobDuplicates = duplicates.filter(d => d.type === 'job').length;

  if (categoryDuplicates > 0) {
    recommendations.push(`Consider merging or renaming ${categoryDuplicates} duplicate categor${categoryDuplicates > 1 ? 'ies' : 'y'}.`);
  }
  
  if (subcategoryDuplicates > 0) {
    recommendations.push(`Review ${subcategoryDuplicates} duplicate subcategor${subcategoryDuplicates > 1 ? 'ies' : 'y'} for consolidation.`);
  }
  
  if (jobDuplicates > 0) {
    recommendations.push(`${jobDuplicates} duplicate service${jobDuplicates > 1 ? 's' : ''} detected - consider standardizing naming.`);
  }

  return recommendations;
}
