
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export type MatchType = 'exact' | 'exact_words' | 'similar' | 'fuzzy';
export type DuplicateType = 'category' | 'subcategory' | 'job';

export interface DuplicateOccurrence {
  itemId: string;
  name: string;
  type: DuplicateType;
  description?: string;
  parentCategory?: string;
  parentSubcategory?: string;
  categoryId?: string;
  subcategoryId?: string;
  path?: string;
}

export interface DuplicateItem {
  name: string;
  groupId: string;
  matchType: MatchType;
  similarityScore: number;
  occurrences: DuplicateOccurrence[];
}

export interface DuplicateSearchOptions {
  similarityThreshold: number;
  includeCategories: boolean;
  includeSubcategories: boolean;
  includeJobs: boolean;
  matchTypes: MatchType[];
  searchScope: 'all' | 'categories' | 'subcategories' | 'jobs';
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  similarityThreshold: 0.8,
  includeCategories: true,
  includeSubcategories: true,
  includeJobs: true,
  matchTypes: ['exact', 'exact_words', 'similar'],
  searchScope: 'all',
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

// Simple string similarity function using Levenshtein distance
function calculateSimilarity(str1: string, str2: string): number {
  const len1 = str1.length;
  const len2 = str2.length;
  
  if (len1 === 0) return len2 === 0 ? 1 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; j <= len2; j++) {
      const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
      matrix[i][j] = Math.min(
        matrix[i - 1][j] + 1,
        matrix[i][j - 1] + 1,
        matrix[i - 1][j - 1] + cost
      );
    }
  }
  
  const distance = matrix[len1][len2];
  return 1 - (distance / Math.max(len1, len2));
}

// Normalize text for comparison
function normalizeText(text: string, options: DuplicateSearchOptions): string {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  return normalized.trim();
}

// Check if two strings match exactly
function isExactMatch(str1: string, str2: string, options: DuplicateSearchOptions): boolean {
  const norm1 = normalizeText(str1, options);
  const norm2 = normalizeText(str2, options);
  return norm1 === norm2;
}

// Check if two strings have exact word matches
function hasExactWords(str1: string, str2: string, options: DuplicateSearchOptions): boolean {
  const norm1 = normalizeText(str1, options);
  const norm2 = normalizeText(str2, options);
  
  const words1 = norm1.split(/\s+/).filter(word => word.length >= options.minWordLength);
  const words2 = norm2.split(/\s+/).filter(word => word.length >= options.minWordLength);
  
  return words1.some(word1 => words2.some(word2 => word1 === word2));
}

// Determine match type between two strings
function getMatchType(str1: string, str2: string, options: DuplicateSearchOptions): MatchType | null {
  if (isExactMatch(str1, str2, options)) {
    return 'exact';
  }
  
  if (hasExactWords(str1, str2, options)) {
    return 'exact_words';
  }
  
  const similarity = calculateSimilarity(
    normalizeText(str1, options),
    normalizeText(str2, options)
  );
  
  if (similarity >= options.similarityThreshold) {
    return similarity > 0.9 ? 'similar' : 'fuzzy';
  }
  
  return null;
}

export function findServiceDuplicates(
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] {
  const items: Array<{
    id: string;
    name: string;
    type: DuplicateType;
    description?: string;
    parentCategory?: string;
    parentSubcategory?: string;
    categoryId?: string;
    subcategoryId?: string;
  }> = [];

  // Collect all items based on search scope
  categories.forEach(category => {
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      if (options.includeCategories) {
        items.push({
          id: category.id,
          name: category.name,
          type: 'category',
          description: category.description,
          categoryId: category.id
        });
      }
    }

    category.subcategories.forEach(subcategory => {
      if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
        if (options.includeSubcategories) {
          items.push({
            id: subcategory.id,
            name: subcategory.name,
            type: 'subcategory',
            description: subcategory.description,
            parentCategory: category.name,
            categoryId: category.id,
            subcategoryId: subcategory.id
          });
        }
      }

      if (options.searchScope === 'all' || options.searchScope === 'jobs') {
        if (options.includeJobs) {
          subcategory.jobs.forEach(job => {
            items.push({
              id: job.id,
              name: job.name,
              type: 'job',
              description: job.description,
              parentCategory: category.name,
              parentSubcategory: subcategory.name,
              categoryId: category.id,
              subcategoryId: subcategory.id
            });
          });
        }
      }
    });
  });

  // Find duplicates
  const duplicateGroups = new Map<string, DuplicateItem>();

  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];

      // Skip if same item
      if (item1.id === item2.id) continue;

      const matchType = getMatchType(item1.name, item2.name, options);
      
      if (matchType && options.matchTypes.includes(matchType)) {
        const similarity = calculateSimilarity(
          normalizeText(item1.name, options),
          normalizeText(item2.name, options)
        );

        // Create a group key based on the normalized names
        const groupKey = [item1.name, item2.name].sort().join('|');
        
        if (!duplicateGroups.has(groupKey)) {
          duplicateGroups.set(groupKey, {
            name: item1.name,
            groupId: groupKey,
            matchType,
            similarityScore: similarity,
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
            description: item1.description,
            parentCategory: item1.parentCategory,
            parentSubcategory: item1.parentSubcategory,
            categoryId: item1.categoryId,
            subcategoryId: item1.subcategoryId,
            path: buildItemPath(item1)
          });
        }

        // Add item2 if not already in occurrences
        if (!group.occurrences.some(occ => occ.itemId === item2.id)) {
          group.occurrences.push({
            itemId: item2.id,
            name: item2.name,
            type: item2.type,
            description: item2.description,
            parentCategory: item2.parentCategory,
            parentSubcategory: item2.parentSubcategory,
            categoryId: item2.categoryId,
            subcategoryId: item2.subcategoryId,
            path: buildItemPath(item2)
          });
        }

        // Update similarity score to be the highest found
        group.similarityScore = Math.max(group.similarityScore, similarity);
      }
    }
  }

  return Array.from(duplicateGroups.values()).filter(group => group.occurrences.length >= 2);
}

function buildItemPath(item: {
  type: DuplicateType;
  parentCategory?: string;
  parentSubcategory?: string;
  name: string;
}): string {
  const parts = [];
  
  if (item.parentCategory) {
    parts.push(item.parentCategory);
  }
  
  if (item.parentSubcategory) {
    parts.push(item.parentSubcategory);
  }
  
  parts.push(item.name);
  
  return parts.join(' > ');
}

export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];

  if (duplicates.length === 0) {
    recommendations.push("No duplicates found with current search criteria.");
    return recommendations;
  }

  const exactMatches = duplicates.filter(d => d.matchType === 'exact');
  const similarMatches = duplicates.filter(d => d.matchType === 'similar' || d.matchType === 'exact_words');

  if (exactMatches.length > 0) {
    recommendations.push(`Found ${exactMatches.length} exact duplicate groups that should be consolidated immediately.`);
  }

  if (similarMatches.length > 0) {
    recommendations.push(`Found ${similarMatches.length} similar items that may be duplicates and should be reviewed.`);
  }

  const categoryDuplicates = duplicates.filter(d => d.occurrences.some(occ => occ.type === 'category'));
  if (categoryDuplicates.length > 0) {
    recommendations.push(`Review ${categoryDuplicates.length} category-level duplicates to maintain clear service organization.`);
  }

  const jobDuplicates = duplicates.filter(d => d.occurrences.some(occ => occ.type === 'job'));
  if (jobDuplicates.length > 0) {
    recommendations.push(`Consider consolidating ${jobDuplicates.length} job-level duplicates to streamline service offerings.`);
  }

  return recommendations;
}
