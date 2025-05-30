
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export type MatchType = 'exact' | 'exact_words' | 'similar' | 'partial';
export type SearchScope = 'all' | 'categories' | 'subcategories' | 'jobs';
export type GroupBy = 'similarity' | 'category' | 'type';

export interface DuplicateSearchOptions {
  // Match type options
  exactMatch: boolean;
  exactWords: boolean;
  similarMatch: boolean;
  partialMatch: boolean;
  
  // Additional options for enhanced search
  matchTypes: MatchType[];
  ignoreSpecialChars: boolean;
  searchScope: SearchScope;
  groupBy: GroupBy;
  minGroupSize: number;
  
  // Similarity threshold
  similarityThreshold: number;
  ignoreCase: boolean;
  ignoreWhitespace: boolean;
  ignoreNumbers: boolean;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  exactMatch: true,
  exactWords: true,
  similarMatch: true,
  partialMatch: false,
  matchTypes: ['exact', 'exact_words', 'similar'],
  ignoreSpecialChars: true,
  searchScope: 'all',
  groupBy: 'similarity',
  minGroupSize: 2,
  similarityThreshold: 80,
  ignoreCase: true,
  ignoreWhitespace: true,
  ignoreNumbers: false,
};

export interface DuplicateOccurrence {
  id: string;
  path: string;
  itemId: string;
  normalizedName: string;
  categoryName: string;
  subcategoryName: string;
  type: 'category' | 'subcategory' | 'job';
}

export interface DuplicateItem {
  id: string;
  text: string;
  occurrences: DuplicateOccurrence[];
  matchType: MatchType;
  similarity: number;
}

// Helper function to normalize text based on options
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignoreWhitespace) {
    normalized = normalized.replace(/\s+/g, ' ').trim();
  }
  
  if (options.ignoreSpecialChars) {
    normalized = normalized.replace(/[^\w\s]/g, '');
  }
  
  if (options.ignoreNumbers) {
    normalized = normalized.replace(/\d+/g, '');
  }
  
  return normalized;
};

// Calculate similarity between two strings
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 100;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const distance = levenshteinDistance(longer, shorter);
  return Math.round((1 - distance / longer.length) * 100);
};

// Levenshtein distance algorithm
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

// Check if strings are exact word matches
const isExactWordMatch = (str1: string, str2: string): boolean => {
  const words1 = str1.toLowerCase().split(/\s+/).sort();
  const words2 = str2.toLowerCase().split(/\s+/).sort();
  
  if (words1.length !== words2.length) return false;
  
  return words1.every((word, index) => word === words2[index]);
};

// Determine match type between two strings
const getMatchType = (text1: string, text2: string, options: DuplicateSearchOptions): MatchType | null => {
  const norm1 = normalizeText(text1, options);
  const norm2 = normalizeText(text2, options);
  
  // Exact match
  if (options.exactMatch && norm1 === norm2) {
    return 'exact';
  }
  
  // Exact words match
  if (options.exactWords && isExactWordMatch(norm1, norm2)) {
    return 'exact_words';
  }
  
  // Similar match
  if (options.similarMatch) {
    const similarity = calculateSimilarity(norm1, norm2);
    if (similarity >= options.similarityThreshold) {
      return 'similar';
    }
  }
  
  // Partial match
  if (options.partialMatch) {
    if (norm1.includes(norm2) || norm2.includes(norm1)) {
      return 'partial';
    }
  }
  
  return null;
};

// Extract all searchable items from categories
const extractAllItems = (categories: ServiceMainCategory[]): DuplicateOccurrence[] => {
  const items: DuplicateOccurrence[] = [];
  
  categories.forEach(category => {
    // Add category
    items.push({
      id: `category-${category.id}`,
      path: category.name,
      itemId: category.id,
      normalizedName: category.name,
      categoryName: category.name,
      subcategoryName: '',
      type: 'category'
    });
    
    // Add subcategories
    category.subcategories?.forEach(subcategory => {
      items.push({
        id: `subcategory-${subcategory.id}`,
        path: `${category.name} > ${subcategory.name}`,
        itemId: subcategory.id,
        normalizedName: subcategory.name,
        categoryName: category.name,
        subcategoryName: subcategory.name,
        type: 'subcategory'
      });
      
      // Add jobs
      subcategory.jobs?.forEach(job => {
        items.push({
          id: `job-${job.id}`,
          path: `${category.name} > ${subcategory.name} > ${job.name}`,
          itemId: job.id,
          normalizedName: job.name,
          categoryName: category.name,
          subcategoryName: subcategory.name,
          type: 'job'
        });
      });
    });
  });
  
  return items;
};

// Filter items based on search scope
const filterItemsByScope = (items: DuplicateOccurrence[], scope: SearchScope): DuplicateOccurrence[] => {
  if (scope === 'all') return items;
  
  return items.filter(item => {
    switch (scope) {
      case 'categories': return item.type === 'category';
      case 'subcategories': return item.type === 'subcategory';
      case 'jobs': return item.type === 'job';
      default: return true;
    }
  });
};

// Main duplicate search function
export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  console.log('Starting duplicate search with options:', options);
  
  const allItems = extractAllItems(categories);
  const filteredItems = filterItemsByScope(allItems, options.searchScope);
  
  console.log(`Found ${filteredItems.length} items to analyze`);
  
  const duplicateGroups: Map<string, DuplicateOccurrence[]> = new Map();
  const processed = new Set<string>();
  
  // Group items by similarity
  filteredItems.forEach((item1, index) => {
    if (processed.has(item1.id)) return;
    
    const similarItems: DuplicateOccurrence[] = [item1];
    
    filteredItems.slice(index + 1).forEach(item2 => {
      if (processed.has(item2.id)) return;
      
      const matchType = getMatchType(item1.normalizedName, item2.normalizedName, options);
      if (matchType && options.matchTypes.includes(matchType)) {
        similarItems.push(item2);
        processed.add(item2.id);
      }
    });
    
    if (similarItems.length >= options.minGroupSize) {
      duplicateGroups.set(item1.normalizedName, similarItems);
      processed.add(item1.id);
    }
  });
  
  // Convert groups to DuplicateItem format
  const duplicateItems: DuplicateItem[] = [];
  let groupIndex = 0;
  
  duplicateGroups.forEach((occurrences, text) => {
    if (occurrences.length >= options.minGroupSize) {
      // Calculate match type and similarity for the group
      const firstItem = occurrences[0];
      const secondItem = occurrences[1];
      const matchType = getMatchType(firstItem.normalizedName, secondItem.normalizedName, options) || 'similar';
      const similarity = calculateSimilarity(firstItem.normalizedName, secondItem.normalizedName);
      
      duplicateItems.push({
        id: `duplicate-group-${groupIndex++}`,
        text: text,
        occurrences: occurrences,
        matchType: matchType,
        similarity: similarity
      });
    }
  });
  
  console.log(`Found ${duplicateItems.length} duplicate groups`);
  return duplicateItems;
};

// Generate recommendations based on duplicates found
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy appears to be well-organized.");
    return recommendations;
  }
  
  const exactCount = duplicates.filter(d => d.matchType === 'exact').length;
  const exactWordsCount = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarCount = duplicates.filter(d => d.matchType === 'similar').length;
  const partialCount = duplicates.filter(d => d.matchType === 'partial').length;
  
  if (exactCount > 0) {
    recommendations.push(`${exactCount} exact duplicates found - these should be merged immediately`);
  }
  
  if (exactWordsCount > 0) {
    recommendations.push(`${exactWordsCount} items with identical words found - consider standardizing naming`);
  }
  
  if (similarCount > 0) {
    recommendations.push(`${similarCount} similar items found - review for potential consolidation`);
  }
  
  if (partialCount > 0) {
    recommendations.push(`${partialCount} items with partial matches - may indicate inconsistent naming patterns`);
  }
  
  // Category-specific recommendations
  const categoryDuplicates = duplicates.filter(d => 
    d.occurrences.some(o => o.type === 'category')
  );
  
  if (categoryDuplicates.length > 0) {
    recommendations.push("Category duplicates detected - consider reorganizing your main service categories");
  }
  
  return recommendations;
};
