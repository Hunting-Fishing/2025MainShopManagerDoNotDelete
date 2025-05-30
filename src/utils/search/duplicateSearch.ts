import { ServiceMainCategory } from "@/types/serviceHierarchy";

export interface DuplicateOccurrence {
  itemId: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
}

export interface DuplicateItem {
  groupId: string;
  name: string;
  matchType: 'exact' | 'exact_words' | 'similar';
  occurrences: DuplicateOccurrence[];
  score: number;
}

export interface DuplicateSearchOptions {
  exactMatch: boolean;
  exactWordsMatch: boolean;
  similarityMatch: boolean;
  similarityThreshold: number;
  checkCategories: boolean;
  checkSubcategories: boolean;
  checkJobs: boolean;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  exactMatch: true,
  exactWordsMatch: true,
  similarityMatch: true,
  similarityThreshold: 0.8,
  checkCategories: true,
  checkSubcategories: true,
  checkJobs: true
};

export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  const duplicateGroups = new Map<string, DuplicateOccurrence[]>();
  
  // Collect all items with their parent information
  const allItems: DuplicateOccurrence[] = [];
  
  categories.forEach(category => {
    // Add category itself
    if (options.checkCategories) {
      allItems.push({
        itemId: category.id,
        name: category.name,
        type: 'category',
        parentCategory: category.name,
        description: category.description
      });
    }
    
    category.subcategories.forEach(subcategory => {
      // Add subcategory
      if (options.checkSubcategories) {
        allItems.push({
          itemId: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          parentCategory: category.name,
          parentSubcategory: subcategory.name,
          description: subcategory.description
        });
      }
      
      // Add jobs
      if (options.checkJobs) {
        subcategory.jobs.forEach(job => {
          allItems.push({
            itemId: job.id,
            name: job.name,
            type: 'job',
            parentCategory: category.name,
            parentSubcategory: subcategory.name,
            description: job.description
          });
        });
      }
    });
  });
  
  // Find duplicates using various matching strategies
  const processedItems = new Set<string>();
  
  allItems.forEach((item, index) => {
    if (processedItems.has(item.itemId)) return;
    
    const matches: DuplicateOccurrence[] = [item];
    processedItems.add(item.itemId);
    
    // Check against remaining items
    for (let i = index + 1; i < allItems.length; i++) {
      const otherItem = allItems[i];
      if (processedItems.has(otherItem.itemId)) continue;
      
      const matchType = getMatchType(item.name, otherItem.name, options);
      if (matchType) {
        matches.push(otherItem);
        processedItems.add(otherItem.itemId);
      }
    }
    
    // If we found matches, create a duplicate group
    if (matches.length > 1) {
      const groupKey = matches.map(m => m.name).sort().join('|');
      duplicateGroups.set(groupKey, matches);
    }
  });
  
  // Convert to DuplicateItem format
  const duplicateItems: DuplicateItem[] = [];
  let groupIndex = 1;
  
  duplicateGroups.forEach((occurrences, groupKey) => {
    const firstItem = occurrences[0];
    const matchType = getMatchType(occurrences[0].name, occurrences[1].name, options) || 'similar';
    
    duplicateItems.push({
      groupId: `group-${groupIndex++}`,
      name: firstItem.name,
      matchType,
      occurrences,
      score: calculateDuplicateScore(occurrences, matchType)
    });
  });
  
  // Sort by score (highest first) and then by number of occurrences
  return duplicateItems.sort((a, b) => {
    if (a.score !== b.score) return b.score - a.score;
    return b.occurrences.length - a.occurrences.length;
  });
};

function getMatchType(
  name1: string,
  name2: string,
  options: DuplicateSearchOptions
): 'exact' | 'exact_words' | 'similar' | null {
  const normalized1 = normalizeString(name1);
  const normalized2 = normalizeString(name2);
  
  // Exact match
  if (options.exactMatch && normalized1 === normalized2) {
    return 'exact';
  }
  
  // Exact words match (all words present in both)
  if (options.exactWordsMatch) {
    const words1 = new Set(normalized1.split(' ').filter(w => w.length > 2));
    const words2 = new Set(normalized2.split(' ').filter(w => w.length > 2));
    const intersection = new Set([...words1].filter(x => words2.has(x)));
    
    if (intersection.size > 0 && intersection.size === Math.min(words1.size, words2.size)) {
      return 'exact_words';
    }
  }
  
  // Similar match based on threshold
  if (options.similarityMatch) {
    const similarity = calculateSimilarity(normalized1, normalized2);
    if (similarity >= options.similarityThreshold) {
      return 'similar';
    }
  }
  
  return null;
}

function normalizeString(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function calculateSimilarity(str1: string, str2: string): number {
  // Simple Jaccard similarity for now
  const words1 = new Set(str1.split(' '));
  const words2 = new Set(str2.split(' '));
  const intersection = new Set([...words1].filter(x => words2.has(x)));
  const union = new Set([...words1, ...words2]);
  
  return union.size === 0 ? 0 : intersection.size / union.size;
}

function calculateDuplicateScore(
  occurrences: DuplicateOccurrence[],
  matchType: 'exact' | 'exact_words' | 'similar'
): number {
  let baseScore = 0;
  
  switch (matchType) {
    case 'exact': baseScore = 100; break;
    case 'exact_words': baseScore = 80; break;
    case 'similar': baseScore = 60; break;
  }
  
  // Boost score based on number of occurrences
  const occurrenceBonus = Math.min(occurrences.length * 10, 50);
  
  // Boost score if items are in different categories (more problematic)
  const categories = new Set(occurrences.map(o => o.parentCategory));
  const categoryBonus = categories.size > 1 ? 20 : 0;
  
  return baseScore + occurrenceBonus + categoryBonus;
}

export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("✅ No duplicates found - your service hierarchy is well organized!");
    return recommendations;
  }
  
  const exactDuplicates = duplicates.filter(d => d.matchType === 'exact');
  const wordDuplicates = duplicates.filter(d => d.matchType === 'exact_words');
  const similarDuplicates = duplicates.filter(d => d.matchType === 'similar');
  
  if (exactDuplicates.length > 0) {
    recommendations.push(
      `🚨 Found ${exactDuplicates.length} exact duplicates that should be merged immediately`
    );
  }
  
  if (wordDuplicates.length > 0) {
    recommendations.push(
      `⚠️ Found ${wordDuplicates.length} services with identical key words - consider consolidating`
    );
  }
  
  if (similarDuplicates.length > 0) {
    recommendations.push(
      `💡 Found ${similarDuplicates.length} similar services - review for potential standardization`
    );
  }
  
  // Category-specific recommendations
  const categoryGroups = new Map<string, DuplicateItem[]>();
  duplicates.forEach(duplicate => {
    duplicate.occurrences.forEach(occurrence => {
      const category = occurrence.parentCategory || 'Unknown';
      if (!categoryGroups.has(category)) {
        categoryGroups.set(category, []);
      }
      categoryGroups.get(category)!.push(duplicate);
    });
  });
  
  categoryGroups.forEach((items, category) => {
    if (items.length > 2) {
      recommendations.push(
        `📂 "${category}" category has ${items.length} duplicate groups - focus cleanup here`
      );
    }
  });
  
  return recommendations;
};
