import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

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
  searchScope: 'all' | 'categories' | 'subcategories' | 'jobs';
  matchTypes: string[];
  ignoreCase: boolean;
  ignorePunctuation: boolean;
  minWordLength: number;
}

export const defaultSearchOptions: DuplicateSearchOptions = {
  similarityThreshold: 80,
  searchScope: 'all',
  matchTypes: ['exact', 'exact_words', 'similar'],
  ignoreCase: true,
  ignorePunctuation: true,
  minWordLength: 3
};

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

const calculateSimilarity = (text1: string, text2: string): number => {
  // Simple Levenshtein distance-based similarity
  const len1 = text1.length;
  const len2 = text2.length;
  
  if (len1 === 0) return len2 === 0 ? 100 : 0;
  if (len2 === 0) return 0;
  
  const matrix = Array(len1 + 1).fill(null).map(() => Array(len2 + 1).fill(null));
  
  for (let i = 0; i <= len1; i++) matrix[i][0] = i;
  for (let j = 0; j <= len2; j++) matrix[0][j] = j;
  
  for (let i = 1; i <= len1; i++) {
    for (let j = 1; i <= len2; j++) {
      if (text1[i - 1] === text2[j - 1]) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j - 1] + 1
        );
      }
    }
  }
  
  const distance = matrix[len1][len2];
  const maxLen = Math.max(len1, len2);
  return Math.round(((maxLen - distance) / maxLen) * 100);
};

const buildItemPath = (
  item: { name: string; type: 'category' | 'subcategory' | 'job' },
  categories: ServiceMainCategory[]
): string => {
  if (item.type === 'category') {
    return item.name;
  }
  
  for (const category of categories) {
    if (item.type === 'subcategory') {
      const subcategory = category.subcategories.find(sub => sub.name === item.name);
      if (subcategory) {
        return `${category.name} > ${item.name}`;
      }
    } else if (item.type === 'job') {
      for (const subcategory of category.subcategories) {
        const job = subcategory.jobs.find(j => j.name === item.name);
        if (job) {
          return `${category.name} > ${subcategory.name} > ${item.name}`;
        }
      }
    }
  }
  
  return item.name;
};

export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  const duplicates: DuplicateItem[] = [];
  const items: Array<{ name: string; type: 'category' | 'subcategory' | 'job'; id: string }> = [];
  
  // Collect all items based on search scope
  if (options.searchScope === 'all' || options.searchScope === 'categories') {
    categories.forEach(category => {
      items.push({ name: category.name, type: 'category', id: category.id });
    });
  }
  
  if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        items.push({ name: subcategory.name, type: 'subcategory', id: subcategory.id });
      });
    });
  }
  
  if (options.searchScope === 'all' || options.searchScope === 'jobs') {
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          items.push({ name: job.name, type: 'job', id: job.id });
        });
      });
    });
  }
  
  // Find duplicates
  const processed = new Set<string>();
  
  for (let i = 0; i < items.length; i++) {
    if (processed.has(items[i].id)) continue;
    
    const currentItem = items[i];
    const normalizedCurrent = normalizeText(currentItem.name, options);
    const matches: DuplicateOccurrence[] = [];
    
    for (let j = i + 1; j < items.length; j++) {
      if (processed.has(items[j].id)) continue;
      
      const compareItem = items[j];
      const normalizedCompare = normalizeText(compareItem.name, options);
      
      let matchType: 'exact' | 'exact_words' | 'similar' | 'partial' | null = null;
      let similarity = 0;
      
      // Check for exact match
      if (options.matchTypes.includes('exact') && normalizedCurrent === normalizedCompare) {
        matchType = 'exact';
        similarity = 100;
      }
      // Check for exact words match
      else if (options.matchTypes.includes('exact_words')) {
        const words1 = normalizedCurrent.split(/\s+/).filter(w => w.length >= options.minWordLength);
        const words2 = normalizedCompare.split(/\s+/).filter(w => w.length >= options.minWordLength);
        
        if (words1.length > 0 && words2.length > 0 && 
            words1.every(w => words2.includes(w)) && words2.every(w => words1.includes(w))) {
          matchType = 'exact_words';
          similarity = 95;
        }
      }
      
      // Check for similar match
      if (!matchType && options.matchTypes.includes('similar')) {
        similarity = calculateSimilarity(normalizedCurrent, normalizedCompare);
        if (similarity >= options.similarityThreshold) {
          matchType = 'similar';
        }
      }
      
      // Check for partial match
      if (!matchType && options.matchTypes.includes('partial')) {
        if (normalizedCurrent.includes(normalizedCompare) || normalizedCompare.includes(normalizedCurrent)) {
          matchType = 'partial';
          similarity = Math.max(similarity, 70);
        }
      }
      
      if (matchType) {
        if (matches.length === 0) {
          matches.push({
            itemId: currentItem.id,
            name: currentItem.name,
            type: currentItem.type,
            path: buildItemPath(currentItem, categories)
          });
        }
        
        matches.push({
          itemId: compareItem.id,
          name: compareItem.name,
          type: compareItem.type,
          path: buildItemPath(compareItem, categories)
        });
        
        processed.add(compareItem.id);
      }
    }
    
    if (matches.length > 1) {
      duplicates.push({
        matchType: matches.length > 1 ? (matches[1] as any).matchType || 'similar' : 'similar',
        similarity: Math.max(...matches.map(() => similarity)),
        occurrences: matches
      });
      processed.add(currentItem.id);
    }
  }
  
  return duplicates;
};

export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];
  
  if (duplicates.length === 0) {
    recommendations.push("No duplicates found. Your service hierarchy is well-organized.");
    return recommendations;
  }
  
  const exactMatches = duplicates.filter(d => d.matchType === 'exact').length;
  const exactWordMatches = duplicates.filter(d => d.matchType === 'exact_words').length;
  const similarMatches = duplicates.filter(d => d.matchType === 'similar').length;
  
  if (exactMatches > 0) {
    recommendations.push(`Found ${exactMatches} exact duplicate(s). Consider consolidating these immediately.`);
  }
  
  if (exactWordMatches > 0) {
    recommendations.push(`Found ${exactWordMatches} word-based duplicate(s). Review for potential consolidation.`);
  }
  
  if (similarMatches > 0) {
    recommendations.push(`Found ${similarMatches} similar item(s). Consider standardizing naming conventions.`);
  }
  
  if (duplicates.length > 10) {
    recommendations.push("Large number of duplicates detected. Consider implementing naming standards.");
  }
  
  return recommendations;
};
