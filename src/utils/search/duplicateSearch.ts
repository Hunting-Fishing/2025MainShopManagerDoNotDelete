
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export type DuplicateMatchType = 'exact' | 'exact_words' | 'similar' | 'partial';
export type DuplicateSearchScope = 'all' | 'categories' | 'subcategories' | 'jobs';

export interface DuplicateSearchOptions {
  similarityThreshold: number;
  matchTypes?: DuplicateMatchType[];
  searchScope: DuplicateSearchScope;
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  similarityThreshold: 80,
  matchTypes: ['exact', 'exact_words', 'similar'],
  searchScope: 'all',
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

export interface DuplicateOccurrence {
  itemId: string;
  itemName: string;
  itemType: 'category' | 'subcategory' | 'job';
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
  estimatedTime?: number;
  price?: number;
}

export interface DuplicateItem {
  id: string;
  matchType: DuplicateMatchType;
  similarityScore: number;
  occurrences: DuplicateOccurrence[];
  category: string;
  categoryColor: string;
}

// Service category color mapping for automotive services
const categoryColors: Record<string, string> = {
  engine: '#ff6b35',
  cooling: '#4dabf7',
  electrical: '#ffd43b',
  brakes: '#ff8cc8',
  suspension: '#74c0fc',
  transmission: '#69db7c',
  exhaust: '#9775fa',
  fuel: '#ffa8a8',
  maintenance: '#ced4da',
  diagnostics: '#868e96',
  body: '#495057',
  interior: '#6c757d',
  default: '#adb5bd'
};

function getCategoryFromName(name: string): string {
  const normalizedName = name.toLowerCase();
  
  if (normalizedName.includes('engine') || normalizedName.includes('motor')) return 'engine';
  if (normalizedName.includes('cool') || normalizedName.includes('radiator')) return 'cooling';
  if (normalizedName.includes('electric') || normalizedName.includes('battery')) return 'electrical';
  if (normalizedName.includes('brake') || normalizedName.includes('pad')) return 'brakes';
  if (normalizedName.includes('suspension') || normalizedName.includes('shock')) return 'suspension';
  if (normalizedName.includes('transmission') || normalizedName.includes('gear')) return 'transmission';
  if (normalizedName.includes('exhaust') || normalizedName.includes('muffler')) return 'exhaust';
  if (normalizedName.includes('fuel') || normalizedName.includes('gas')) return 'fuel';
  if (normalizedName.includes('oil') || normalizedName.includes('filter')) return 'maintenance';
  if (normalizedName.includes('diagnostic') || normalizedName.includes('scan')) return 'diagnostics';
  if (normalizedName.includes('body') || normalizedName.includes('panel')) return 'body';
  if (normalizedName.includes('interior') || normalizedName.includes('seat')) return 'interior';
  
  return 'default';
}

function normalizeText(text: string, options: DuplicateSearchOptions): string {
  let normalized = text;
  
  if (options.ignoreCase) {
    normalized = normalized.toLowerCase();
  }
  
  if (options.ignorePunctuation) {
    normalized = normalized.replace(/[^\w\s]/g, ' ');
  }
  
  // Filter out words shorter than minimum length
  if (options.minWordLength > 1) {
    normalized = normalized
      .split(/\s+/)
      .filter(word => word.length >= options.minWordLength)
      .join(' ');
  }
  
  return normalized.trim();
}

function calculateSimilarity(text1: string, text2: string, options: DuplicateSearchOptions): number {
  const norm1 = normalizeText(text1, options);
  const norm2 = normalizeText(text2, options);
  
  // Exact match
  if (norm1 === norm2) return 100;
  
  // Exact words match
  const words1 = norm1.split(/\s+/);
  const words2 = norm2.split(/\s+/);
  
  if (words1.length === words2.length && 
      words1.every(word => words2.includes(word))) {
    return 90;
  }
  
  // Partial match based on common words
  const commonWords = words1.filter(word => words2.includes(word));
  const totalWords = Math.max(words1.length, words2.length);
  
  if (totalWords === 0) return 0;
  
  const similarity = (commonWords.length / totalWords) * 100;
  return Math.round(similarity);
}

function isMatchTypeEnabled(matchType: DuplicateMatchType, options: DuplicateSearchOptions): boolean {
  return options.matchTypes?.includes(matchType) ?? true;
}

export function findServiceDuplicates(
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] {
  const duplicates: DuplicateItem[] = [];
  const processed = new Set<string>();

  // Collect all items based on search scope
  const allItems: Array<{
    id: string;
    name: string;
    type: 'category' | 'subcategory' | 'job';
    parentCategory?: string;
    parentSubcategory?: string;
    description?: string;
    estimatedTime?: number;
    price?: number;
  }> = [];

  categories.forEach(category => {
    if (options.searchScope === 'all' || options.searchScope === 'categories') {
      allItems.push({
        id: category.id,
        name: category.name,
        type: 'category',
        description: category.description
      });
    }

    category.subcategories.forEach(subcategory => {
      if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
        allItems.push({
          id: subcategory.id,
          name: subcategory.name,
          type: 'subcategory',
          parentCategory: category.name,
          description: subcategory.description
        });
      }

      subcategory.jobs.forEach(job => {
        if (options.searchScope === 'all' || options.searchScope === 'jobs') {
          allItems.push({
            id: job.id,
            name: job.name,
            type: 'job',
            parentCategory: category.name,
            parentSubcategory: subcategory.name,
            description: job.description,
            estimatedTime: job.estimatedTime,
            price: job.price
          });
        }
      });
    });
  });

  // Find duplicates
  for (let i = 0; i < allItems.length; i++) {
    const item1 = allItems[i];
    
    if (processed.has(item1.id)) continue;
    
    const matches: DuplicateOccurrence[] = [];
    let maxSimilarity = 0;
    let matchType: DuplicateMatchType = 'partial';

    for (let j = i + 1; j < allItems.length; j++) {
      const item2 = allItems[j];
      
      if (processed.has(item2.id)) continue;
      
      const similarity = calculateSimilarity(item1.name, item2.name, options);
      
      if (similarity >= options.similarityThreshold) {
        let currentMatchType: DuplicateMatchType = 'partial';
        
        if (similarity === 100 && isMatchTypeEnabled('exact', options)) {
          currentMatchType = 'exact';
        } else if (similarity >= 90 && isMatchTypeEnabled('exact_words', options)) {
          currentMatchType = 'exact_words';
        } else if (similarity >= 80 && isMatchTypeEnabled('similar', options)) {
          currentMatchType = 'similar';
        } else if (isMatchTypeEnabled('partial', options)) {
          currentMatchType = 'partial';
        } else {
          continue; // Skip if this match type is not enabled
        }

        if (matches.length === 0) {
          // Add the first item as well
          matches.push({
            itemId: item1.id,
            itemName: item1.name,
            itemType: item1.type,
            parentCategory: item1.parentCategory,
            parentSubcategory: item1.parentSubcategory,
            description: item1.description,
            estimatedTime: item1.estimatedTime,
            price: item1.price
          });
        }

        matches.push({
          itemId: item2.id,
          itemName: item2.name,
          itemType: item2.type,
          parentCategory: item2.parentCategory,
          parentSubcategory: item2.parentSubcategory,
          description: item2.description,
          estimatedTime: item2.estimatedTime,
          price: item2.price
        });

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          matchType = currentMatchType;
        }

        processed.add(item2.id);
      }
    }

    if (matches.length > 1) {
      processed.add(item1.id);
      
      const category = getCategoryFromName(item1.name);
      
      duplicates.push({
        id: `duplicate_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        matchType,
        similarityScore: maxSimilarity,
        occurrences: matches,
        category,
        categoryColor: categoryColors[category]
      });
    }
  }

  return duplicates;
}

export function generateDuplicateRecommendations(duplicates: DuplicateItem[]): string[] {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy appears to be well-organized.");
    return recommendations;
  }

  const exactMatches = duplicates.filter(d => d.matchType === 'exact').length;
  const exactWordMatches = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarMatches = duplicates.filter(d => d.matchType === 'similar').length;

  if (exactMatches > 0) {
    recommendations.push(`Found ${exactMatches} exact duplicate(s). These should be merged immediately.`);
  }

  if (exactWordMatches > 0) {
    recommendations.push(`Found ${exactWordMatches} exact word match(es). Review for potential consolidation.`);
  }

  if (similarMatches > 0) {
    recommendations.push(`Found ${similarMatches} similar item(s). Consider standardizing naming conventions.`);
  }

  const categoryStats = duplicates.reduce((acc, dup) => {
    acc[dup.category] = (acc[dup.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const topCategories = Object.entries(categoryStats)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 3);

  if (topCategories.length > 0) {
    recommendations.push(`Most duplicates found in: ${topCategories.map(([cat, count]) => `${cat} (${count})`).join(', ')}`);
  }

  return recommendations;
}
