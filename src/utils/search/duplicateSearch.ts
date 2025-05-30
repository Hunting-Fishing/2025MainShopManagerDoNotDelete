
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
  matchTypes: ['exact', 'exact_words', 'similar', 'partial'],
  similarityThreshold: 65,
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 2
};

export interface DuplicateOccurrence {
  itemId: string;
  itemName: string;
  itemType: 'category' | 'subcategory' | 'job';
  parentName?: string;
  parentId?: string;
}

export interface DuplicateItem {
  name: string;
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  similarity: number;
  occurrences: DuplicateOccurrence[];
}

// Enhanced string normalization
const normalizeString = (str: string, options: DuplicateSearchOptions): string => {
  let normalized = str;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, '');
  }
  
  // Remove extra whitespace
  normalized = normalized.replace(/\s+/g, ' ').trim();
  
  return normalized;
};

// Improved similarity calculation
const calculateSimilarity = (str1: string, str2: string): number => {
  if (str1 === str2) return 100;
  
  const longer = str1.length > str2.length ? str1 : str2;
  const shorter = str1.length > str2.length ? str2 : str1;
  
  if (longer.length === 0) return 100;
  
  // Calculate edit distance
  const editDistance = levenshteinDistance(longer, shorter);
  return Math.round(((longer.length - editDistance) / longer.length) * 100);
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

// Enhanced match type detection
const getMatchType = (str1: string, str2: string, similarity: number, options: DuplicateSearchOptions): string | null => {
  const norm1 = normalizeString(str1, options);
  const norm2 = normalizeString(str2, options);
  
  console.log(`Comparing "${norm1}" vs "${norm2}", similarity: ${similarity}%`);
  
  // Exact match
  if (options.matchTypes.includes('exact') && norm1 === norm2) {
    console.log(`  -> EXACT match found`);
    return 'exact';
  }
  
  // Exact words (all words match, possibly in different order)
  if (options.matchTypes.includes('exact_words')) {
    const words1 = norm1.split(' ').filter(w => w.length >= options.minWordLength).sort();
    const words2 = norm2.split(' ').filter(w => w.length >= options.minWordLength).sort();
    
    if (words1.length > 0 && words2.length > 0 && 
        JSON.stringify(words1) === JSON.stringify(words2)) {
      console.log(`  -> EXACT_WORDS match found`);
      return 'exact_words';
    }
  }
  
  // Similar match (high similarity score)
  if (options.matchTypes.includes('similar') && similarity >= options.similarityThreshold) {
    console.log(`  -> SIMILAR match found (${similarity}% >= ${options.similarityThreshold}%)`);
    return 'similar';
  }
  
  // Partial match (contains common significant words)
  if (options.matchTypes.includes('partial')) {
    const words1 = norm1.split(' ').filter(w => w.length >= options.minWordLength);
    const words2 = norm2.split(' ').filter(w => w.length >= options.minWordLength);
    
    if (words1.length > 0 && words2.length > 0) {
      const commonWords = words1.filter(w => words2.includes(w));
      const commonRatio = commonWords.length / Math.max(words1.length, words2.length);
      
      if (commonRatio >= 0.5) { // At least 50% of words are common
        console.log(`  -> PARTIAL match found (${Math.round(commonRatio * 100)}% common words)`);
        return 'partial';
      }
    }
  }
  
  console.log(`  -> No match found`);
  return null;
};

// Main duplicate search function
export const findServiceDuplicates = (categories: ServiceMainCategory[], options: DuplicateSearchOptions): DuplicateItem[] => {
  console.log('=== Starting Duplicate Search ===');
  console.log('Search options:', options);
  console.log('Categories to search:', categories.length);
  
  const duplicates: DuplicateItem[] = [];
  const items: Array<{ id: string; name: string; type: 'category' | 'subcategory' | 'job'; parentName?: string; parentId?: string }> = [];
  
  // Collect all items based on search scope
  categories.forEach(category => {
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      items.push({
        id: category.id,
        name: category.name,
        type: 'category'
      });
    }
    
    category.subcategories.forEach(subcategory => {
      if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
        items.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          parentName: category.name,
          parentId: category.id
        });
      }
      
      subcategory.jobs.forEach(job => {
        if (options.searchScope === 'all' || options.searchScope === 'jobs') {
          items.push({
            id: job.id,
            name: job.name,
            type: 'job',
            parentName: `${category.name} > ${subcategory.name}`,
            parentId: subcategory.id
          });
        }
      });
    });
  });
  
  console.log(`Collected ${items.length} items to analyze`);
  
  // Group items by match type
  const matchGroups: Record<string, DuplicateOccurrence[]> = {};
  
  // Compare all items with each other
  for (let i = 0; i < items.length; i++) {
    for (let j = i + 1; j < items.length; j++) {
      const item1 = items[i];
      const item2 = items[j];
      
      // Skip comparison if items are the same
      if (item1.id === item2.id) continue;
      
      const similarity = calculateSimilarity(
        normalizeString(item1.name, options),
        normalizeString(item2.name, options)
      );
      
      const matchType = getMatchType(item1.name, item2.name, similarity, options);
      
      if (matchType) {
        // Use the normalized name as the group key
        const groupKey = `${normalizeString(item1.name, options)}_${normalizeString(item2.name, options)}_${matchType}`;
        
        if (!matchGroups[groupKey]) {
          matchGroups[groupKey] = [];
        }
        
        // Add both items to the group if not already present
        const existingIds = matchGroups[groupKey].map(occ => occ.itemId);
        
        if (!existingIds.includes(item1.id)) {
          matchGroups[groupKey].push({
            itemId: item1.id,
            itemName: item1.name,
            itemType: item1.type,
            parentName: item1.parentName,
            parentId: item1.parentId
          });
        }
        
        if (!existingIds.includes(item2.id)) {
          matchGroups[groupKey].push({
            itemId: item2.id,
            itemName: item2.name,
            itemType: item2.type,
            parentName: item2.parentName,
            parentId: item2.parentId
          });
        }
      }
    }
  }
  
  // Convert groups to DuplicateItem format
  Object.entries(matchGroups).forEach(([groupKey, occurrences]) => {
    if (occurrences.length >= 2) {
      // Extract match type from group key
      const matchType = groupKey.split('_').pop() as 'exact' | 'exact_words' | 'similar' | 'partial';
      
      // Calculate average similarity for the group
      let totalSimilarity = 0;
      let comparisons = 0;
      
      for (let i = 0; i < occurrences.length; i++) {
        for (let j = i + 1; j < occurrences.length; j++) {
          totalSimilarity += calculateSimilarity(
            normalizeString(occurrences[i].itemName, options),
            normalizeString(occurrences[j].itemName, options)
          );
          comparisons++;
        }
      }
      
      const averageSimilarity = comparisons > 0 ? Math.round(totalSimilarity / comparisons) : 100;
      
      duplicates.push({
        name: occurrences[0].itemName, // Use the first occurrence as representative name
        matchType,
        similarity: averageSimilarity,
        occurrences
      });
    }
  });
  
  console.log(`Found ${duplicates.length} duplicate groups:`);
  duplicates.forEach((dup, index) => {
    console.log(`  ${index + 1}. "${dup.name}" (${dup.matchType}, ${dup.similarity}%) - ${dup.occurrences.length} occurrences`);
  });
  
  // Sort by similarity (descending) and then by number of occurrences (descending)
  return duplicates.sort((a, b) => {
    if (b.similarity !== a.similarity) {
      return b.similarity - a.similarity;
    }
    return b.occurrences.length - a.occurrences.length;
  });
};

export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy appears to be well-organized.");
    return recommendations;
  }
  
  const exactMatches = duplicates.filter(d => d.matchType === 'exact');
  const similarMatches = duplicates.filter(d => d.matchType === 'similar');
  const partialMatches = duplicates.filter(d => d.matchType === 'partial');
  
  if (exactMatches.length > 0) {
    recommendations.push(`Found ${exactMatches.length} exact duplicate(s). These should be merged immediately.`);
  }
  
  if (similarMatches.length > 0) {
    recommendations.push(`Found ${similarMatches.length} similar item(s). Review these for potential consolidation.`);
  }
  
  if (partialMatches.length > 0) {
    recommendations.push(`Found ${partialMatches.length} partial match(es). Consider if these represent the same service.`);
  }
  
  recommendations.push(`Total potential duplicates: ${duplicates.length}`);
  
  return recommendations;
};
