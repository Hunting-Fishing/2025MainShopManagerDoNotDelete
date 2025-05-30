
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface DuplicateSearchOptions {
  // Match type controls
  exactMatch: boolean;
  exactWords: boolean;
  similarMatch: boolean;
  partialMatch: boolean;
  
  // Similarity threshold (0-1)
  similarityThreshold: number;
  
  // Text processing options
  ignoreCase: boolean;
  ignoreSpecialChars: boolean;
  ignorePunctuation: boolean;
  
  // Word filtering
  minWordLength: number;
  
  // Search scope
  searchScope: ('categories' | 'subcategories' | 'jobs')[];
  
  // Result grouping
  groupBy: 'similarity' | 'category' | 'type';
  minGroupSize: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  exactMatch: true,
  exactWords: true,
  similarMatch: true,
  partialMatch: false,
  similarityThreshold: 0.8,
  ignoreCase: true,
  ignoreSpecialChars: true,
  ignorePunctuation: true,
  minWordLength: 3,
  searchScope: ['categories', 'subcategories', 'jobs'],
  groupBy: 'similarity',
  minGroupSize: 2
};

export interface DuplicateOccurrence {
  id: string;
  path: string;
  itemId: string;
  normalizedName: string;
  categoryName?: string;
  subcategoryName?: string;
  type: 'category' | 'subcategory' | 'job';
}

export interface DuplicateItem {
  id: string;
  text: string;
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  similarity: number;
  occurrences: DuplicateOccurrence[];
}

// Text processing utilities
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignoreSpecialChars) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[.,;:!?'"()[\]{}]/g, ' ');
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

const getWords = (text: string, minLength: number): string[] => {
  return text.split(/\s+/).filter(word => word.length >= minLength);
};

// Similarity calculation
const calculateSimilarity = (text1: string, text2: string): number => {
  if (text1 === text2) return 1.0;
  
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;
  
  if (longer.length === 0) return 1.0;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return (longer.length - editDistance) / longer.length;
};

const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + indicator // substitution
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Extract all items from categories
const extractItems = (categories: ServiceMainCategory[], options: DuplicateSearchOptions) => {
  const items: Array<{
    id: string;
    name: string;
    type: 'category' | 'subcategory' | 'job';
    categoryName?: string;
    subcategoryName?: string;
    path: string;
  }> = [];
  
  categories.forEach(category => {
    if (options.searchScope.includes('categories')) {
      items.push({
        id: category.id,
        name: category.name,
        type: 'category',
        categoryName: category.name,
        path: category.name
      });
    }
    
    category.subcategories?.forEach(subcategory => {
      if (options.searchScope.includes('subcategories')) {
        items.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          categoryName: category.name,
          subcategoryName: subcategory.name,
          path: `${category.name} > ${subcategory.name}`
        });
      }
      
      subcategory.jobs?.forEach(job => {
        if (options.searchScope.includes('jobs')) {
          items.push({
            id: job.id,
            name: job.name,
            type: 'job',
            categoryName: category.name,
            subcategoryName: subcategory.name,
            path: `${category.name} > ${subcategory.name} > ${job.name}`
          });
        }
      });
    });
  });
  
  return items;
};

// Main duplicate search function
export const findServiceDuplicates = (
  categories: ServiceMainCategory[], 
  options: DuplicateSearchOptions
): DuplicateItem[] => {
  const items = extractItems(categories, options);
  const duplicateGroups = new Map<string, DuplicateOccurrence[]>();
  
  // Process each item
  for (let i = 0; i < items.length; i++) {
    const item1 = items[i];
    const normalized1 = normalizeText(item1.name, options);
    
    for (let j = i + 1; j < items.length; j++) {
      const item2 = items[j];
      const normalized2 = normalizeText(item2.name, options);
      
      let matchType: DuplicateItem['matchType'] | null = null;
      let similarity = 0;
      
      // Check for exact match
      if (options.exactMatch && normalized1 === normalized2) {
        matchType = 'exact';
        similarity = 1.0;
      }
      // Check for exact words match
      else if (options.exactWords) {
        const words1 = getWords(normalized1, options.minWordLength);
        const words2 = getWords(normalized2, options.minWordLength);
        
        if (words1.length > 0 && words2.length > 0) {
          const commonWords = words1.filter(word => words2.includes(word));
          const wordSimilarity = (commonWords.length * 2) / (words1.length + words2.length);
          
          if (wordSimilarity >= 0.8) {
            matchType = 'exact_words';
            similarity = wordSimilarity;
          }
        }
      }
      // Check for similar match
      else if (options.similarMatch) {
        similarity = calculateSimilarity(normalized1, normalized2);
        if (similarity >= options.similarityThreshold) {
          matchType = 'similar';
        }
      }
      // Check for partial match
      else if (options.partialMatch) {
        if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
          matchType = 'partial';
          similarity = Math.max(normalized2.length / normalized1.length, normalized1.length / normalized2.length);
        }
      }
      
      if (matchType) {
        const groupKey = `${Math.min(i, j)}-${Math.max(i, j)}`;
        
        if (!duplicateGroups.has(groupKey)) {
          duplicateGroups.set(groupKey, []);
        }
        
        const group = duplicateGroups.get(groupKey)!;
        
        // Add first item if not already added
        if (!group.some(g => g.itemId === item1.id)) {
          group.push({
            id: item1.id,
            path: item1.path,
            itemId: item1.id,
            normalizedName: normalized1,
            categoryName: item1.categoryName,
            subcategoryName: item1.subcategoryName,
            type: item1.type
          });
        }
        
        // Add second item if not already added
        if (!group.some(g => g.itemId === item2.id)) {
          group.push({
            id: item2.id,
            path: item2.path,
            itemId: item2.id,
            normalizedName: normalized2,
            categoryName: item2.categoryName,
            subcategoryName: item2.subcategoryName,
            type: item2.type
          });
        }
      }
    }
  }
  
  // Convert to DuplicateItem format
  const duplicates: DuplicateItem[] = [];
  let duplicateId = 1;
  
  duplicateGroups.forEach((occurrences, key) => {
    if (occurrences.length >= options.minGroupSize) {
      const firstOccurrence = occurrences[0];
      const secondOccurrence = occurrences[1];
      
      const similarity = calculateSimilarity(
        firstOccurrence.normalizedName,
        secondOccurrence.normalizedName
      );
      
      let matchType: DuplicateItem['matchType'] = 'similar';
      if (similarity === 1.0) matchType = 'exact';
      else if (similarity >= 0.9) matchType = 'exact_words';
      else if (similarity >= 0.7) matchType = 'similar';
      else matchType = 'partial';
      
      duplicates.push({
        id: `duplicate-${duplicateId++}`,
        text: firstOccurrence.normalizedName,
        matchType,
        similarity,
        occurrences
      });
    }
  });
  
  return duplicates;
};

export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy appears to be well-organized.");
    return recommendations;
  }
  
  const exactDuplicates = duplicates.filter(d => d.matchType === 'exact');
  const wordDuplicates = duplicates.filter(d => d.matchType === 'exact_words');
  const similarDuplicates = duplicates.filter(d => d.matchType === 'similar');
  
  if (exactDuplicates.length > 0) {
    recommendations.push(`Found ${exactDuplicates.length} exact duplicate(s). Consider removing or merging these immediately.`);
  }
  
  if (wordDuplicates.length > 0) {
    recommendations.push(`Found ${wordDuplicates.length} items with identical words. Review for potential consolidation.`);
  }
  
  if (similarDuplicates.length > 0) {
    recommendations.push(`Found ${similarDuplicates.length} similar items. Consider standardizing naming conventions.`);
  }
  
  if (duplicates.length > 10) {
    recommendations.push("High number of duplicates detected. Consider implementing naming standards and regular audits.");
  }
  
  return recommendations;
};
