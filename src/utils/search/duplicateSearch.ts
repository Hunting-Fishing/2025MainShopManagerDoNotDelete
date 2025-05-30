
import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface DuplicateOccurrence {
  itemId: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  path: string;
}

export interface DuplicateItem {
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  similarity: number;
  occurrences: DuplicateOccurrence[];
}

export interface DuplicateSearchOptions {
  similarityThreshold: number;
  enableExactMatch: boolean;
  enableExactWordsMatch: boolean;
  enableSimilarMatch: boolean;
  enablePartialMatch: boolean;
  caseSensitive: boolean;
  ignoreCommonWords: boolean;
  minWordLength: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  similarityThreshold: 80,
  enableExactMatch: true,
  enableExactWordsMatch: true,
  enableSimilarMatch: true,
  enablePartialMatch: false,
  caseSensitive: false,
  ignoreCommonWords: true,
  minWordLength: 3,
};

// Helper function to calculate string similarity
function calculateSimilarity(str1: string, str2: string): number {
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  const distance = levenshteinDistance(longer, shorter);
  return ((longer.length - distance) / longer.length) * 100;
}

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

// Helper function to build path for an item
function buildPath(category: ServiceMainCategory, subcategoryId?: string, jobId?: string): string {
  let path = category.name;
  
  if (subcategoryId) {
    const subcategory = category.subcategories?.find(sub => sub.id === subcategoryId);
    if (subcategory) {
      path += ` > ${subcategory.name}`;
      
      if (jobId) {
        const job = subcategory.jobs?.find(job => job.id === jobId);
        if (job) {
          path += ` > ${job.name}`;
        }
      }
    }
  }
  
  return path;
}

export function findServiceDuplicates(
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions
): DuplicateItem[] {
  const duplicates: DuplicateItem[] = [];
  const processedItems: Array<{
    id: string;
    name: string;
    type: 'category' | 'subcategory' | 'job';
    path: string;
    categoryId: string;
    subcategoryId?: string;
  }> = [];

  // Collect all items with their paths
  categories.forEach(category => {
    processedItems.push({
      id: category.id,
      name: category.name,
      type: 'category',
      path: category.name,
      categoryId: category.id
    });

    category.subcategories?.forEach(subcategory => {
      processedItems.push({
        id: subcategory.id,
        name: subcategory.name,
        type: 'subcategory',
        path: buildPath(category, subcategory.id),
        categoryId: category.id,
        subcategoryId: subcategory.id
      });

      subcategory.jobs?.forEach(job => {
        processedItems.push({
          id: job.id,
          name: job.name,
          type: 'job',
          path: buildPath(category, subcategory.id, job.id),
          categoryId: category.id,
          subcategoryId: subcategory.id
        });
      });
    });
  });

  // Find duplicates
  for (let i = 0; i < processedItems.length; i++) {
    for (let j = i + 1; j < processedItems.length; j++) {
      const item1 = processedItems[i];
      const item2 = processedItems[j];
      
      const name1 = options.caseSensitive ? item1.name : item1.name.toLowerCase();
      const name2 = options.caseSensitive ? item2.name : item2.name.toLowerCase();
      
      let matchType: 'exact' | 'exact_words' | 'similar' | 'partial' | null = null;
      let similarity = 0;
      
      // Exact match
      if (options.enableExactMatch && name1 === name2) {
        matchType = 'exact';
        similarity = 100;
      }
      // Exact words match (same words, different order)
      else if (options.enableExactWordsMatch) {
        const words1 = name1.split(/\s+/).sort();
        const words2 = name2.split(/\s+/).sort();
        if (words1.join(' ') === words2.join(' ')) {
          matchType = 'exact_words';
          similarity = 95;
        }
      }
      
      // Similar match
      if (!matchType && options.enableSimilarMatch) {
        similarity = calculateSimilarity(name1, name2);
        if (similarity >= options.similarityThreshold) {
          matchType = 'similar';
        }
      }
      
      // Partial match
      if (!matchType && options.enablePartialMatch) {
        if (name1.includes(name2) || name2.includes(name1)) {
          matchType = 'partial';
          similarity = Math.max(
            (name2.length / name1.length) * 100,
            (name1.length / name2.length) * 100
          );
        }
      }
      
      if (matchType) {
        // Check if this duplicate group already exists
        let existingDuplicate = duplicates.find(dup => 
          dup.matchType === matchType &&
          dup.occurrences.some(occ => occ.itemId === item1.id || occ.itemId === item2.id)
        );
        
        if (existingDuplicate) {
          // Add to existing group if not already present
          if (!existingDuplicate.occurrences.some(occ => occ.itemId === item1.id)) {
            existingDuplicate.occurrences.push({
              itemId: item1.id,
              name: item1.name,
              type: item1.type,
              path: item1.path
            });
          }
          if (!existingDuplicate.occurrences.some(occ => occ.itemId === item2.id)) {
            existingDuplicate.occurrences.push({
              itemId: item2.id,
              name: item2.name,
              type: item2.type,
              path: item2.path
            });
          }
        } else {
          // Create new duplicate group
          duplicates.push({
            matchType,
            similarity: Math.round(similarity),
            occurrences: [
              {
                itemId: item1.id,
                name: item1.name,
                type: item1.type,
                path: item1.path
              },
              {
                itemId: item2.id,
                name: item2.name,
                type: item2.type,
                path: item2.path
              }
            ]
          });
        }
      }
    }
  }
  
  return duplicates;
}

export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];
  
  const exactCount = duplicates.filter(d => d.matchType === 'exact').length;
  const exactWordsCount = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarCount = duplicates.filter(d => d.matchType === 'similar').length;
  
  if (exactCount > 0) {
    recommendations.push(`Found ${exactCount} exact duplicate${exactCount > 1 ? 's' : ''} - these should be merged immediately`);
  }
  
  if (exactWordsCount > 0) {
    recommendations.push(`Found ${exactWordsCount} name${exactWordsCount > 1 ? 's' : ''} with same words in different order - consider standardizing`);
  }
  
  if (similarCount > 0) {
    recommendations.push(`Found ${similarCount} similar name${similarCount > 1 ? 's' : ''} - review for potential consolidation`);
  }
  
  if (duplicates.length === 0) {
    recommendations.push('No duplicates found with current search criteria');
  }
  
  return recommendations;
}
