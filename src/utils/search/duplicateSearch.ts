
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface DuplicateSearchOptions {
  searchScope: 'all' | 'categories' | 'subcategories' | 'jobs';
  matchTypes: string[];
  similarityThreshold: number;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  searchScope: 'all',
  matchTypes: ['exact', 'similar'],
  similarityThreshold: 85,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

export interface DuplicateOccurrence {
  itemId: string;
  itemName: string;
  itemType: 'category' | 'subcategory' | 'job';
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
}

export interface DuplicateItem {
  groupId: string;
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  similarity: number;
  occurrences: DuplicateOccurrence[];
}

// Simple similarity calculation using string comparison
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return ((longer.length - editDistance) / longer.length) * 100;
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = [];
  
  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }
  
  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }
  
  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1
        );
      }
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Normalize text for comparison
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

// Extract all searchable items from categories
const extractSearchableItems = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions
): DuplicateOccurrence[] => {
  const items: DuplicateOccurrence[] = [];
  
  categories.forEach(category => {
    // Add category if scope allows
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      items.push({
        itemId: category.id,
        itemName: category.name,
        itemType: 'category',
        description: category.description
      });
    }
    
    // Add subcategories if scope allows
    if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
      category.subcategories.forEach(subcategory => {
        items.push({
          itemId: subcategory.id,
          itemName: subcategory.name,
          itemType: 'subcategory',
          parentCategory: category.name,
          description: subcategory.description
        });
        
        // Add jobs if scope allows
        if (options.searchScope === 'all' || options.searchScope === 'jobs') {
          subcategory.jobs.forEach(job => {
            items.push({
              itemId: job.id,
              itemName: job.name,
              itemType: 'job',
              parentCategory: category.name,
              parentSubcategory: subcategory.name,
              description: job.description
            });
          });
        }
      });
    }
  });
  
  return items;
};

// Find duplicates based on options
export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions
): DuplicateItem[] => {
  const items = extractSearchableItems(categories, options);
  const duplicates: DuplicateItem[] = [];
  const processedGroups = new Set<string>();
  
  // Compare each item with every other item
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      
      // Skip if already processed in a group
      const groupKey = [item1.itemId, item2.itemId].sort().join('-');
      if (processedGroups.has(groupKey)) continue;
      
      const normalized1 = normalizeText(item1.itemName, options);
      const normalized2 = normalizeText(item2.itemName, options);
      
      let matchType: 'exact' | 'exact_words' | 'similar' | 'partial' | null = null;
      let similarity = 0;
      
      // Check for exact match
      if (options.matchTypes.includes('exact') && normalized1 === normalized2) {
        matchType = 'exact';
        similarity = 100;
      }
      // Check for exact words match
      else if (options.matchTypes.includes('exact_words')) {
        const words1 = normalized1.split(' ').filter(w => w.length >= options.minWordLength);
        const words2 = normalized2.split(' ').filter(w => w.length >= options.minWordLength);
        
        if (words1.length > 0 && words2.length > 0) {
          const commonWords = words1.filter(w => words2.includes(w));
          if (commonWords.length === words1.length && commonWords.length === words2.length) {
            matchType = 'exact_words';
            similarity = 95;
          }
        }
      }
      // Check for similar match
      else if (options.matchTypes.includes('similar')) {
        similarity = calculateSimilarity(normalized1, normalized2);
        if (similarity >= options.similarityThreshold) {
          matchType = 'similar';
        }
      }
      // Check for partial match
      else if (options.matchTypes.includes('partial')) {
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
          matchType = 'partial';
          similarity = Math.max(
            (normalized2.length / normalized1.length) * 100,
            (normalized1.length / normalized2.length) * 100
          );
        }
      }
      
      // If we found a match, create or update duplicate group
      if (matchType) {
        const existingGroup = duplicates.find(dup => 
          dup.occurrences.some(occ => occ.itemId === item1.itemId || occ.itemId === item2.itemId)
        );
        
        if (existingGroup) {
          // Add to existing group if not already present
          if (!existingGroup.occurrences.find(occ => occ.itemId === item1.itemId)) {
            existingGroup.occurrences.push(item1);
          }
          if (!existingGroup.occurrences.find(occ => occ.itemId === item2.itemId)) {
            existingGroup.occurrences.push(item2);
          }
        } else {
          // Create new group
          duplicates.push({
            groupId: `group-${duplicates.length + 1}`,
            matchType,
            similarity,
            occurrences: [item1, item2]
          });
        }
        
        processedGroups.add(groupKey);
      }
    }
  }
  
  return duplicates;
};

// Generate recommendations based on found duplicates
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy is well-organized.");
    return recommendations;
  }
  
  const exactMatches = duplicates.filter(d => d.matchType === 'exact').length;
  const similarMatches = duplicates.filter(d => d.matchType === 'similar').length;
  
  if (exactMatches > 0) {
    recommendations.push(`Found ${exactMatches} exact duplicate(s). Consider merging these identical items.`);
  }
  
  if (similarMatches > 0) {
    recommendations.push(`Found ${similarMatches} similar item(s). Review these for potential consolidation.`);
  }
  
  recommendations.push("Use the remove buttons to clean up duplicates directly.");
  recommendations.push("Consider standardizing naming conventions to prevent future duplicates.");
  
  return recommendations;
};
