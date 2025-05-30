import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export type MatchType = 'exact' | 'exact_words' | 'similar' | 'partial';

export interface DuplicateSearchOptions {
  exactMatch: boolean;
  exactWords: boolean;
  similarMatch: boolean;
  partialMatch: boolean;
  similarityThreshold: number;
  minWordLength: number;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  ignoreSpecialChars: boolean;
  searchScope: 'all' | 'categories' | 'subcategories' | 'jobs';
  groupBy: 'name' | 'type';
  minGroupSize: number;
  matchTypes: MatchType[];
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  exactMatch: true,
  exactWords: true,
  similarMatch: true,
  partialMatch: false,
  similarityThreshold: 0.8,
  minWordLength: 3,
  ignoreCase: true,
  ignorePunctuation: true,
  ignoreSpecialChars: true,
  searchScope: 'all',
  groupBy: 'name',
  minGroupSize: 2,
  matchTypes: ['exact', 'exact_words', 'similar']
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
  matchType: MatchType;
  occurrences: DuplicateOccurrence[];
  similarity?: number;
}

function normalizeText(text: string, options: DuplicateSearchOptions): string {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[.,;:!?'"()-]/g, ' ');
  }
  
  if (options.ignoreSpecialChars) {
    normalized = normalized.replace(/[^a-zA-Z0-9\s]/g, ' ');
  }
  
  // Clean up extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
}

function calculateSimilarity(text1: string, text2: string): number {
  if (text1 === text2) return 1;
  
  const longer = text1.length > text2.length ? text1 : text2;
  const shorter = text1.length > text2.length ? text2 : text1;
  
  if (longer.length === 0) return 1;
  
  const distance = levenshteinDistance(longer, shorter);
  return (longer.length - distance) / longer.length;
}

function levenshteinDistance(str1: string, str2: string): number {
  const matrix = Array.from({ length: str2.length + 1 }, (_, i) => [i]);
  matrix[0] = Array.from({ length: str1.length + 1 }, (_, i) => i);

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2[i - 1] === str1[j - 1]) {
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

function extractWords(text: string, minLength: number): string[] {
  return text
    .split(/\s+/)
    .filter(word => word.length >= minLength);
}

function hasExactWordMatch(text1: string, text2: string, minWordLength: number): boolean {
  const words1 = extractWords(text1, minWordLength);
  const words2 = extractWords(text2, minWordLength);
  
  return words1.some(word1 => 
    words2.some(word2 => word1 === word2)
  );
}

export function findServiceDuplicates(
  categories: ServiceMainCategory[], 
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] {
  const items: Array<{
    id: string;
    text: string;
    normalizedText: string;
    path: string;
    type: 'category' | 'subcategory' | 'job';
    categoryName?: string;
    subcategoryName?: string;
  }> = [];

  // Collect all items based on search scope
  categories.forEach(category => {
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      items.push({
        id: category.id,
        text: category.name,
        normalizedText: normalizeText(category.name, options),
        path: category.name,
        type: 'category',
        categoryName: category.name
      });
    }

    category.subcategories?.forEach(subcategory => {
      if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
        items.push({
          id: subcategory.id,
          text: subcategory.name,
          normalizedText: normalizeText(subcategory.name, options),
          path: `${category.name} > ${subcategory.name}`,
          type: 'subcategory',
          categoryName: category.name,
          subcategoryName: subcategory.name
        });
      }

      subcategory.jobs?.forEach(job => {
        if (options.searchScope === 'all' || options.searchScope === 'jobs') {
          items.push({
            id: job.id,
            text: job.name,
            normalizedText: normalizeText(job.name, options),
            path: `${category.name} > ${subcategory.name} > ${job.name}`,
            type: 'job',
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        }
      });
    });
  });

  // Group items by normalized text or type
  const groups = new Map<string, typeof items>();
  
  items.forEach(item => {
    const groupKey = options.groupBy === 'type' 
      ? `${item.type}:${item.normalizedText}`
      : item.normalizedText;
    
    if (!groups.has(groupKey)) {
      groups.set(groupKey, []);
    }
    groups.get(groupKey)!.push(item);
  });

  const duplicates: DuplicateItem[] = [];

  // Find exact matches
  if (options.exactMatch) {
    groups.forEach((groupItems, key) => {
      if (groupItems.length >= options.minGroupSize) {
        duplicates.push({
          id: `exact-${key}`,
          text: groupItems[0].text,
          matchType: 'exact',
          occurrences: groupItems.map(item => ({
            id: item.id,
            path: item.path,
            itemId: item.id,
            normalizedName: item.normalizedText,
            categoryName: item.categoryName,
            subcategoryName: item.subcategoryName,
            type: item.type
          }))
        });
      }
    });
  }

  // Find word-based matches
  if (options.exactWords) {
    const processedPairs = new Set<string>();
    
    items.forEach((item1, i) => {
      items.slice(i + 1).forEach(item2 => {
        const pairKey = [item1.id, item2.id].sort().join('-');
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        if (item1.normalizedText !== item2.normalizedText && 
            hasExactWordMatch(item1.normalizedText, item2.normalizedText, options.minWordLength)) {
          
          const existingGroup = duplicates.find(d => 
            d.matchType === 'exact_words' && 
            d.occurrences.some(o => o.id === item1.id || o.id === item2.id)
          );

          if (existingGroup) {
            if (!existingGroup.occurrences.some(o => o.id === item1.id)) {
              existingGroup.occurrences.push({
                id: item1.id,
                path: item1.path,
                itemId: item1.id,
                normalizedName: item1.normalizedText,
                categoryName: item1.categoryName,
                subcategoryName: item1.subcategoryName,
                type: item1.type
              });
            }
            if (!existingGroup.occurrences.some(o => o.id === item2.id)) {
              existingGroup.occurrences.push({
                id: item2.id,
                path: item2.path,
                itemId: item2.id,
                normalizedName: item2.normalizedText,
                categoryName: item2.categoryName,
                subcategoryName: item2.subcategoryName,
                type: item2.type
              });
            }
          } else {
            duplicates.push({
              id: `exact_words-${pairKey}`,
              text: `${item1.text} / ${item2.text}`,
              matchType: 'exact_words',
              occurrences: [
                {
                  id: item1.id,
                  path: item1.path,
                  itemId: item1.id,
                  normalizedName: item1.normalizedText,
                  categoryName: item1.categoryName,
                  subcategoryName: item1.subcategoryName,
                  type: item1.type
                },
                {
                  id: item2.id,
                  path: item2.path,
                  itemId: item2.id,
                  normalizedName: item2.normalizedText,
                  categoryName: item2.categoryName,
                  subcategoryName: item2.subcategoryName,
                  type: item2.type
                }
              ]
            });
          }
        }
      });
    });
  }

  // Find similar matches
  if (options.similarMatch) {
    const processedPairs = new Set<string>();
    
    items.forEach((item1, i) => {
      items.slice(i + 1).forEach(item2 => {
        const pairKey = [item1.id, item2.id].sort().join('-');
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        if (item1.normalizedText !== item2.normalizedText) {
          const similarity = calculateSimilarity(item1.normalizedText, item2.normalizedText);
          
          if (similarity >= options.similarityThreshold) {
            duplicates.push({
              id: `similar-${pairKey}`,
              text: `${item1.text} / ${item2.text}`,
              matchType: 'similar',
              similarity,
              occurrences: [
                {
                  id: item1.id,
                  path: item1.path,
                  itemId: item1.id,
                  normalizedName: item1.normalizedText,
                  categoryName: item1.categoryName,
                  subcategoryName: item1.subcategoryName,
                  type: item1.type
                },
                {
                  id: item2.id,
                  path: item2.path,
                  itemId: item2.id,
                  normalizedName: item2.normalizedText,
                  categoryName: item2.categoryName,
                  subcategoryName: item2.subcategoryName,
                  type: item2.type
                }
              ]
            });
          }
        }
      });
    });
  }

  // Find partial matches (if enabled)
  if (options.partialMatch) {
    const processedPairs = new Set<string>();
    
    items.forEach((item1, i) => {
      items.slice(i + 1).forEach(item2 => {
        const pairKey = [item1.id, item2.id].sort().join('-');
        if (processedPairs.has(pairKey)) return;
        processedPairs.add(pairKey);

        if (item1.normalizedText !== item2.normalizedText) {
          const text1 = item1.normalizedText;
          const text2 = item2.normalizedText;
          
          if (text1.includes(text2) || text2.includes(text1)) {
            duplicates.push({
              id: `partial-${pairKey}`,
              text: `${item1.text} / ${item2.text}`,
              matchType: 'partial',
              occurrences: [
                {
                  id: item1.id,
                  path: item1.path,
                  itemId: item1.id,
                  normalizedName: item1.normalizedText,
                  categoryName: item1.categoryName,
                  subcategoryName: item1.subcategoryName,
                  type: item1.type
                },
                {
                  id: item2.id,
                  path: item2.path,
                  itemId: item2.id,
                  normalizedName: item2.normalizedText,
                  categoryName: item2.categoryName,
                  subcategoryName: item2.subcategoryName,
                  type: item2.type
                }
              ]
            });
          }
        }
      });
    });
  }

  return duplicates;
}

export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy appears to be well-organized.");
    return recommendations;
  }

  const exactCount = duplicates.filter(d => d.matchType === 'exact').length;
  const wordCount = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarCount = duplicates.filter(d => d.matchType === 'similar').length;
  const partialCount = duplicates.filter(d => d.matchType === 'partial').length;

  if (exactCount > 0) {
    recommendations.push(`${exactCount} exact duplicates found. Consider consolidating these items immediately.`);
  }

  if (wordCount > 0) {
    recommendations.push(`${wordCount} items with exact word matches found. Review these for potential consolidation.`);
  }

  if (similarCount > 0) {
    recommendations.push(`${similarCount} similar items found. These may represent the same service with different naming.`);
  }

  if (partialCount > 0) {
    recommendations.push(`${partialCount} partial matches found. These might be related services that could be grouped together.`);
  }

  recommendations.push("Review each group to determine if consolidation would improve your service organization.");
  
  return recommendations;
}
