
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";

// Interface for duplicate items with enhanced matching
export interface DuplicateItem {
  name: string;
  type: 'category' | 'subcategory' | 'job';
  matchType: 'exact' | 'exact_words' | 'partial' | 'similar';
  similarity: number; // 0-100 percentage
  occurrences: {
    id: string;
    path: string;
    itemId: string;
    normalizedName: string;
  }[];
}

// Enhanced duplicate search options
export interface DuplicateSearchOptions {
  exactMatch: boolean;
  exactWords: boolean;
  partialMatch: boolean;
  similarityThreshold: number; // 0-100
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

// Default search options
export const defaultSearchOptions: DuplicateSearchOptions = {
  exactMatch: true,
  exactWords: true,
  partialMatch: false,
  similarityThreshold: 80,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

/**
 * Normalize text for comparison
 */
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  // Clean up extra spaces
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

/**
 * Extract words from text
 */
const extractWords = (text: string, minLength: number = 3): string[] => {
  return text
    .split(/\s+/)
    .filter(word => word.length >= minLength)
    .map(word => word.toLowerCase());
};

/**
 * Calculate similarity between two strings using Levenshtein distance
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 100 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len2 + 1).fill(null).map(() => Array(len1 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[0][i] = i;
  for (let j = 0; j <= len2; j++) matrix[j][0] = j;
  
  for (let j = 1; j <= len2; j++) {
    for (let i = 1; i <= len1; i++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1,     // deletion
        matrix[j - 1][i] + 1,     // insertion
        matrix[j - 1][i - 1] + cost // substitution
      );
    }
  }
  
  const maxLen = Math.max(len1, len2);
  const distance = matrix[len2][len1];
  return Math.round(((maxLen - distance) / maxLen) * 100);
};

/**
 * Check if two texts match based on exact words
 */
const hasExactWordMatch = (text1: string, text2: string, options: DuplicateSearchOptions): boolean => {
  const words1 = extractWords(normalizeText(text1, options), options.minWordLength);
  const words2 = extractWords(normalizeText(text2, options), options.minWordLength);
  
  // Check if all words from the shorter text are in the longer text
  const [shorter, longer] = words1.length <= words2.length ? [words1, words2] : [words2, words1];
  
  return shorter.every(word => longer.includes(word)) && shorter.length > 0;
};

/**
 * Determine match type and similarity
 */
const analyzeMatch = (name1: string, name2: string, options: DuplicateSearchOptions): {
  matchType: DuplicateItem['matchType'];
  similarity: number;
  isMatch: boolean;
} => {
  const normalized1 = normalizeText(name1, options);
  const normalized2 = normalizeText(name2, options);
  
  // Exact match
  if (normalized1 === normalized2) {
    return { matchType: 'exact', similarity: 100, isMatch: true };
  }
  
  // Exact words match
  if (options.exactWords && hasExactWordMatch(name1, name2, options)) {
    const similarity = calculateSimilarity(normalized1, normalized2);
    return { matchType: 'exact_words', similarity, isMatch: true };
  }
  
  // Similarity-based matching
  const similarity = calculateSimilarity(normalized1, normalized2);
  
  if (similarity >= options.similarityThreshold) {
    if (similarity >= 90) {
      return { matchType: 'similar', similarity, isMatch: true };
    } else if (options.partialMatch && similarity >= options.similarityThreshold) {
      return { matchType: 'partial', similarity, isMatch: true };
    }
  }
  
  return { matchType: 'partial', similarity, isMatch: false };
};

/**
 * Enhanced service duplicates finder
 */
export const findServiceDuplicates = (
  categories: ServiceMainCategory[], 
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  const allItems: Array<{
    name: string;
    normalizedName: string;
    type: 'category' | 'subcategory' | 'job';
    id: string;
    path: string;
    itemId: string;
  }> = [];
  
  // Collect all items
  categories.forEach(category => {
    const categoryNormalized = normalizeText(category.name, options);
    allItems.push({
      name: category.name,
      normalizedName: categoryNormalized,
      type: 'category',
      id: category.id,
      path: category.name,
      itemId: category.id
    });
    
    category.subcategories.forEach(subcategory => {
      const subcategoryNormalized = normalizeText(subcategory.name, options);
      allItems.push({
        name: subcategory.name,
        normalizedName: subcategoryNormalized,
        type: 'subcategory',
        id: subcategory.id,
        path: `${category.name} > ${subcategory.name}`,
        itemId: subcategory.id
      });
      
      subcategory.jobs.forEach(job => {
        const jobNormalized = normalizeText(job.name, options);
        allItems.push({
          name: job.name,
          normalizedName: jobNormalized,
          type: 'job',
          id: job.id,
          path: `${category.name} > ${subcategory.name} > ${job.name}`,
          itemId: job.id
        });
      });
    });
  });
  
  // Find duplicates
  const duplicateGroups: Map<string, DuplicateItem> = new Map();
  
  for (let i = 0; i < allItems.length; i++) {
    for (let j = i + 1; j < allItems.length; j++) {
      const item1 = allItems[i];
      const item2 = allItems[j];
      
      // Skip if different types (unless exact match)
      if (item1.type !== item2.type && !options.exactMatch) continue;
      
      const matchResult = analyzeMatch(item1.name, item2.name, options);
      
      if (matchResult.isMatch) {
        const groupKey = `${item1.name}_${item2.name}`.toLowerCase();
        const reverseGroupKey = `${item2.name}_${item1.name}`.toLowerCase();
        
        // Check if we already have this group
        let existingGroup = duplicateGroups.get(groupKey) || duplicateGroups.get(reverseGroupKey);
        
        if (!existingGroup) {
          existingGroup = {
            name: item1.name,
            type: item1.type,
            matchType: matchResult.matchType,
            similarity: matchResult.similarity,
            occurrences: [
              {
                id: item1.id,
                path: item1.path,
                itemId: item1.itemId,
                normalizedName: item1.normalizedName
              }
            ]
          };
          duplicateGroups.set(groupKey, existingGroup);
        }
        
        // Add the second item if not already present
        const alreadyExists = existingGroup.occurrences.some(
          occ => occ.itemId === item2.itemId
        );
        
        if (!alreadyExists) {
          existingGroup.occurrences.push({
            id: item2.id,
            path: item2.path,
            itemId: item2.itemId,
            normalizedName: item2.normalizedName
          });
        }
      }
    }
  }
  
  // Filter out groups with less than 2 occurrences and sort by similarity
  return Array.from(duplicateGroups.values())
    .filter(group => group.occurrences.length >= 2)
    .sort((a, b) => b.similarity - a.similarity);
};

/**
 * Generate enhanced recommendations for handling duplicates
 */
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found with the current search criteria.");
    recommendations.push("Try adjusting the similarity threshold or enabling partial matching to find more potential duplicates.");
    return recommendations;
  }
  
  const exactMatches = duplicates.filter(d => d.matchType === 'exact').length;
  const exactWordMatches = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarMatches = duplicates.filter(d => d.matchType === 'similar').length;
  const partialMatches = duplicates.filter(d => d.matchType === 'partial').length;
  
  if (exactMatches > 0) {
    recommendations.push(`Found ${exactMatches} exact duplicates that should be merged immediately.`);
  }
  
  if (exactWordMatches > 0) {
    recommendations.push(`Found ${exactWordMatches} items with exact word matches - review for potential consolidation.`);
  }
  
  if (similarMatches > 0) {
    recommendations.push(`Found ${similarMatches} highly similar items that may need renaming or merging.`);
  }
  
  if (partialMatches > 0) {
    recommendations.push(`Found ${partialMatches} partially similar items - review manually to determine if they're related.`);
  }
  
  // Add category-specific recommendations
  const categoryDuplicates = duplicates.filter(d => d.type === 'category').length;
  const subcategoryDuplicates = duplicates.filter(d => d.type === 'subcategory').length;
  const jobDuplicates = duplicates.filter(d => d.type === 'job').length;
  
  if (categoryDuplicates > 0) {
    recommendations.push(`Review ${categoryDuplicates} category duplicates for potential hierarchy restructuring.`);
  }
  
  if (subcategoryDuplicates > 0) {
    recommendations.push(`Consider consolidating ${subcategoryDuplicates} subcategory duplicates to simplify navigation.`);
  }
  
  if (jobDuplicates > 0) {
    recommendations.push(`Standardize ${jobDuplicates} job duplicates to ensure consistent pricing and descriptions.`);
  }
  
  return recommendations;
};
