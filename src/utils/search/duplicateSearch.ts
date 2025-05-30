
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export interface DuplicateOccurrence {
  itemId: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  categoryId?: string;
  subcategoryId?: string;
  path: string;
}

export interface DuplicateItem {
  groupId: string;
  name: string;
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  similarityScore: number;
  occurrences: DuplicateOccurrence[];
}

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
  matchTypes: ['exact', 'exact_words', 'similar'],
  similarityThreshold: 80,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

// Helper function to normalize text for comparison
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  return normalized.trim();
};

// Calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const distance = levenshteinDistance(longer, shorter);
  return Math.round(((longer.length - distance) / longer.length) * 100);
};

// Levenshtein distance calculation
const levenshteinDistance = (str1: string, str2: string): number => {
  const matrix = Array(str2.length + 1).fill(null).map(() => Array(str1.length + 1).fill(null));
  
  for (let i = 0; i <= str1.length; i++) matrix[0][i] = i;
  for (let j = 0; j <= str2.length; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= str2.length; j++) {
    for (let i = 1; i <= str1.length; i++) {
      const indicator = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,
        matrix[j - 1][i] + 1,
        matrix[j - 1][i - 1] + indicator
      );
    }
  }
  
  return matrix[str2.length][str1.length];
};

// Check if two strings match based on the given match type
const checkMatch = (str1: string, str2: string, matchType: string, options: DuplicateSearchOptions): { matches: boolean; score: number } => {
  const norm1 = normalizeText(str1, options);
  const norm2 = normalizeText(str2, options);
  
  switch (matchType) {
    case 'exact':
      return { matches: norm1 === norm2, score: norm1 === norm2 ? 100 : 0 };
    
    case 'exact_words':
      const words1 = norm1.split(/\s+/).filter(w => w.length >= options.minWordLength);
      const words2 = norm2.split(/\s+/).filter(w => w.length >= options.minWordLength);
      const matches = words1.some(w1 => words2.some(w2 => w1 === w2));
      return { matches, score: matches ? 90 : 0 };
    
    case 'similar':
      const similarity = calculateSimilarity(norm1, norm2);
      return { matches: similarity >= options.similarityThreshold, score: similarity };
    
    case 'partial':
      const partialMatch = norm1.includes(norm2) || norm2.includes(norm1);
      return { matches: partialMatch, score: partialMatch ? 70 : 0 };
    
    default:
      return { matches: false, score: 0 };
  }
};

// Extract all items from categories based on search scope
const extractItems = (categories: ServiceMainCategory[], scope: string): Array<{
  id: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  categoryId?: string;
  subcategoryId?: string;
  path: string;
}> => {
  const items: Array<{
    id: string;
    name: string;
    type: 'category' | 'subcategory' | 'job';
    categoryId?: string;
    subcategoryId?: string;
    path: string;
  }> = [];
  
  categories.forEach(category => {
    if (scope === 'all' || scope === 'categories') {
      items.push({
        id: category.id,
        name: category.name,
        type: 'category',
        path: category.name
      });
    }
    
    category.subcategories.forEach(subcategory => {
      if (scope === 'all' || scope === 'subcategories') {
        items.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          categoryId: category.id,
          path: `${category.name} > ${subcategory.name}`
        });
      }
      
      subcategory.jobs.forEach(job => {
        if (scope === 'all' || scope === 'jobs') {
          items.push({
            id: job.id,
            name: job.name,
            type: 'job',
            categoryId: category.id,
            subcategoryId: subcategory.id,
            path: `${category.name} > ${subcategory.name} > ${job.name}`
          });
        }
      });
    });
  });
  
  return items;
};

// Main function to find duplicates
export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  const items = extractItems(categories, options.searchScope);
  const duplicateGroups: Map<string, DuplicateItem> = new Map();
  
  // Compare each item with every other item
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      
      // Check each match type
      for (const matchType of options.matchTypes) {
        const { matches, score } = checkMatch(item1.name, item2.name, matchType, options);
        
        if (matches) {
          const groupKey = `${matchType}-${Math.min(i, j)}-${Math.max(i, j)}`;
          
          if (!duplicateGroups.has(groupKey)) {
            duplicateGroups.set(groupKey, {
              groupId: groupKey,
              name: item1.name,
              matchType: matchType as any,
              similarityScore: score,
              occurrences: []
            });
          }
          
          const group = duplicateGroups.get(groupKey)!;
          
          // Add item1 if not already in occurrences
          if (!group.occurrences.some(occ => occ.itemId === item1.id)) {
            group.occurrences.push({
              itemId: item1.id,
              name: item1.name,
              type: item1.type,
              categoryId: item1.categoryId,
              subcategoryId: item1.subcategoryId,
              path: item1.path
            });
          }
          
          // Add item2 if not already in occurrences
          if (!group.occurrences.some(occ => occ.itemId === item2.id)) {
            group.occurrences.push({
              itemId: item2.id,
              name: item2.name,
              type: item2.type,
              categoryId: item2.categoryId,
              subcategoryId: item2.subcategoryId,
              path: item2.path
            });
          }
          
          break; // Only add to the first matching type
        }
      }
    }
  }
  
  return Array.from(duplicateGroups.values()).filter(group => group.occurrences.length >= 2);
};

// Generate recommendations based on found duplicates
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy is well-organized!");
    return recommendations;
  }
  
  const exactDuplicates = duplicates.filter(d => d.matchType === 'exact');
  const similarDuplicates = duplicates.filter(d => d.matchType === 'similar');
  
  if (exactDuplicates.length > 0) {
    recommendations.push(`Found ${exactDuplicates.length} exact duplicate groups that should be merged immediately.`);
  }
  
  if (similarDuplicates.length > 0) {
    recommendations.push(`Found ${similarDuplicates.length} similar item groups that may need review for potential consolidation.`);
  }
  
  recommendations.push("Review each duplicate group carefully before making changes.");
  recommendations.push("Consider the context and specific use cases before merging items.");
  
  return recommendations;
};
