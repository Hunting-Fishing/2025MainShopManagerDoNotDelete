
// If this file exists, we need to make sure it contains the necessary types
// If it doesn't exist, we'll create it

/**
 * Types of matches that can be performed during duplicate search
 */
export type MatchType = 
  | "exact" 
  | "exact_words"
  | "similar" 
  | "partial";

/**
 * Search scope options for duplicate detection
 */
export type SearchScope = 
  | "all" 
  | "categories" 
  | "subcategories" 
  | "jobs";

/**
 * Options for configuring duplicate search behavior
 */
export interface DuplicateSearchOptions {
  searchScope: SearchScope;
  matchTypes: MatchType[];
  similarityThreshold: number;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

/**
 * Represents an occurrence of a duplicate item in the service hierarchy
 */
export interface DuplicateOccurrence {
  id: string;
  itemId: string;
  name: string;
  type: "category" | "subcategory" | "job";
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
}

/**
 * Represents a group of duplicate items found during search
 */
export interface DuplicateItem {
  name: string;
  groupId: string;
  matchType: MatchType;
  similarityScore: number;
  occurrences: DuplicateOccurrence[];
}

/**
 * Results from a duplicate search operation
 */
export interface DuplicateSearchResults {
  duplicates: DuplicateItem[];
  totalFound: number;
  searchOptions: DuplicateSearchOptions;
}

/**
 * Default search options for duplicate detection
 */
export const defaultSearchOptions: DuplicateSearchOptions = {
  searchScope: "all",
  matchTypes: ["exact", "similar"],
  similarityThreshold: 80,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

/**
 * Calculate similarity between two strings using a simple algorithm
 */
function calculateSimilarity(str1: string, str2: string, options: DuplicateSearchOptions): number {
  let s1 = str1;
  let s2 = str2;
  
  if (options.ignoreCase) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    s1 = s1.replace(/[^\w\s]/g, '');
    s2 = s2.replace(/[^\w\s]/g, '');
  }
  
  // Simple similarity calculation
  if (s1 === s2) return 100;
  
  const longer = s1.length > s2.length ? s1 : s2;
  const shorter = s1.length > s2.length ? s2 : s1;
  
  if (longer.length === 0) return 100;
  
  const editDistance = levenshteinDistance(longer, shorter);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
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
}

/**
 * Check if two strings match based on the specified match type
 */
function isMatch(str1: string, str2: string, matchType: MatchType, options: DuplicateSearchOptions): boolean {
  let s1 = str1;
  let s2 = str2;
  
  if (options.ignoreCase) {
    s1 = s1.toLowerCase();
    s2 = s2.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    s1 = s1.replace(/[^\w\s]/g, '');
    s2 = s2.replace(/[^\w\s]/g, '');
  }
  
  switch (matchType) {
    case 'exact':
      return s1 === s2;
    case 'exact_words':
      const words1 = s1.split(/\s+/).filter(w => w.length >= options.minWordLength);
      const words2 = s2.split(/\s+/).filter(w => w.length >= options.minWordLength);
      return words1.some(w1 => words2.some(w2 => w1 === w2));
    case 'similar':
      const similarity = calculateSimilarity(s1, s2, options);
      return similarity >= options.similarityThreshold;
    case 'partial':
      return s1.includes(s2) || s2.includes(s1);
    default:
      return false;
  }
}

/**
 * Find duplicate services in the service hierarchy
 */
export function findServiceDuplicates(categories: any[], options: DuplicateSearchOptions): DuplicateItem[] {
  const items: Array<{
    id: string;
    name: string;
    type: "category" | "subcategory" | "job";
    parentCategory?: string;
    parentSubcategory?: string;
    description?: string;
  }> = [];
  
  // Collect all items based on search scope
  categories.forEach(category => {
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      items.push({
        id: category.id,
        name: category.name,
        type: 'category',
        description: category.description
      });
    }
    
    category.subcategories?.forEach((subcategory: any) => {
      if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
        items.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          parentCategory: category.name,
          description: subcategory.description
        });
      }
      
      subcategory.jobs?.forEach((job: any) => {
        if (options.searchScope === 'all' || options.searchScope === 'jobs') {
          items.push({
            id: job.id,
            name: job.name,
            type: 'job',
            parentCategory: category.name,
            parentSubcategory: subcategory.name,
            description: job.description
          });
        }
      });
    });
  });
  
  const duplicateGroups: Map<string, DuplicateItem> = new Map();
  
  // Find duplicates
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      
      for (const matchType of options.matchTypes) {
        if (isMatch(item1.name, item2.name, matchType, options)) {
          const groupKey = `${item1.name}-${item2.name}`.toLowerCase();
          const similarity = calculateSimilarity(item1.name, item2.name, options);
          
          if (!duplicateGroups.has(groupKey)) {
            duplicateGroups.set(groupKey, {
              name: item1.name,
              groupId: groupKey,
              matchType,
              similarityScore: similarity,
              occurrences: [
                {
                  id: item1.id,
                  itemId: item1.id,
                  name: item1.name,
                  type: item1.type,
                  parentCategory: item1.parentCategory,
                  parentSubcategory: item1.parentSubcategory,
                  description: item1.description
                },
                {
                  id: item2.id,
                  itemId: item2.id,
                  name: item2.name,
                  type: item2.type,
                  parentCategory: item2.parentCategory,
                  parentSubcategory: item2.parentSubcategory,
                  description: item2.description
                }
              ]
            });
          } else {
            const existing = duplicateGroups.get(groupKey)!;
            if (!existing.occurrences.some(occ => occ.id === item2.id)) {
              existing.occurrences.push({
                id: item2.id,
                itemId: item2.id,
                name: item2.name,
                type: item2.type,
                parentCategory: item2.parentCategory,
                parentSubcategory: item2.parentSubcategory,
                description: item2.description
              });
            }
          }
          break; // Only match with the first matching type
        }
      }
    }
  }
  
  return Array.from(duplicateGroups.values());
}

/**
 * Generate recommendations for handling duplicates
 */
export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy is well-organized.");
    return recommendations;
  }
  
  const exactMatches = duplicates.filter(d => d.matchType === 'exact').length;
  const similarMatches = duplicates.filter(d => d.matchType === 'similar').length;
  
  if (exactMatches > 0) {
    recommendations.push(`Found ${exactMatches} exact duplicate(s). Consider merging or removing these immediately.`);
  }
  
  if (similarMatches > 0) {
    recommendations.push(`Found ${similarMatches} similar item(s). Review these for potential consolidation.`);
  }
  
  const categoryDuplicates = duplicates.filter(d => d.occurrences.some(o => o.type === 'category')).length;
  const subcategoryDuplicates = duplicates.filter(d => d.occurrences.some(o => o.type === 'subcategory')).length;
  const jobDuplicates = duplicates.filter(d => d.occurrences.some(o => o.type === 'job')).length;
  
  if (categoryDuplicates > 0) {
    recommendations.push(`${categoryDuplicates} category duplicate(s) found. Consider reorganizing your main categories.`);
  }
  
  if (subcategoryDuplicates > 0) {
    recommendations.push(`${subcategoryDuplicates} subcategory duplicate(s) found. Review subcategory organization.`);
  }
  
  if (jobDuplicates > 0) {
    recommendations.push(`${jobDuplicates} job duplicate(s) found. Consider standardizing job names.`);
  }
  
  recommendations.push("Review each duplicate group carefully before making changes to avoid losing important service variations.");
  
  return recommendations;
}
