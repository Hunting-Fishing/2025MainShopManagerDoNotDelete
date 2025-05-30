import { ServiceMainCategory } from '@/types/serviceHierarchy';

export interface DuplicateOccurrence {
  itemId: string;
  name: string;
  type: 'category' | 'subcategory' | 'job';
  categoryId?: string;
  categoryName?: string;
  subcategoryId?: string;
  subcategoryName?: string;
  parentCategory?: string;
  parentSubcategory?: string;
  description?: string;
}

export interface DuplicateItem {
  groupId: string;
  name: string;
  matchType: 'exact' | 'exact_words' | 'similar' | 'partial';
  occurrences: DuplicateOccurrence[];
  similarityScore?: number;
}

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

/**
 * Normalizes text for comparison by removing punctuation and converting to lowercase
 */
const normalizeText = (text: string, options: DuplicateSearchOptions): string => {
  let normalizedText = text;
  if (options.ignorePunctuation) {
    normalizedText = normalizedText.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()]/g, "");
  }
  if (options.ignoreCase) {
    normalizedText = normalizedText.toLowerCase();
  }
  return normalizedText.trim();
};

/**
 * Calculates the similarity between two strings using the Sørensen–Dice coefficient.
 */
const calculateSimilarity = (str1: string, str2: string): number => {
  const set1 = new Set(str1);
  const set2 = new Set(str2);
  const intersectionSize = [...set1].filter(x => set2.has(x)).length;
  const unionSize = set1.size + set2.size;

  return (2 * intersectionSize) / unionSize * 100;
};

/**
 * Generates recommendations for resolving duplicate services
 */
export const generateDuplicateRecommendations = (duplicates: DuplicateItem[]): string[] => {
  const recommendations: string[] = [];

  if (duplicates.length > 0) {
    recommendations.push(
      "Review the duplicate services and consolidate them into a single service."
    );
    recommendations.push(
      "Consider renaming or rephrasing the duplicate services to make them unique."
    );
    recommendations.push(
      "Evaluate the pricing and estimated time for each duplicate service and adjust accordingly."
    );
  } else {
    recommendations.push("No duplicate services found.");
  }

  return recommendations;
};

/**
 * Find duplicate services in the service hierarchy
 */
export const findServiceDuplicates = (
  categories: ServiceMainCategory[],
  options: DuplicateSearchOptions = defaultSearchOptions
): DuplicateItem[] => {
  console.log('Starting duplicate search with options:', options);
  console.log('Categories to search:', categories.length);
  
  const duplicates: DuplicateItem[] = [];
  const processedItems = new Map<string, DuplicateOccurrence[]>();
  let groupIdCounter = 1;

  // Helper function to add occurrence
  const addOccurrence = (normalizedName: string, occurrence: DuplicateOccurrence, matchType: 'exact' | 'exact_words' | 'similar' | 'partial') => {
    if (!processedItems.has(normalizedName)) {
      processedItems.set(normalizedName, []);
    }
    processedItems.get(normalizedName)!.push(occurrence);
  };

  // Process categories
  if (options.searchScope === 'all' || options.searchScope === 'categories') {
    categories.forEach(category => {
      const normalizedName = normalizeText(category.name, options);
      if (normalizedName.length >= options.minWordLength) {
        addOccurrence(normalizedName, {
          itemId: category.id,
          name: category.name,
          type: 'category',
          categoryId: category.id,
          categoryName: category.name,
          description: category.description
        }, 'exact');
      }
    });
  }

  // Process subcategories
  if (options.searchScope === 'all' || options.searchScope === 'subcategories') {
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const normalizedName = normalizeText(subcategory.name, options);
        if (normalizedName.length >= options.minWordLength) {
          addOccurrence(normalizedName, {
            itemId: subcategory.id,
            name: subcategory.name,
            type: 'subcategory',
            categoryId: category.id,
            categoryName: category.name,
            subcategoryId: subcategory.id,
            subcategoryName: subcategory.name,
            parentCategory: category.name,
            description: subcategory.description
          }, 'exact');
        }
      });
    });
  }

  // Process jobs
  if (options.searchScope === 'all' || options.searchScope === 'jobs') {
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(job => {
          const normalizedName = normalizeText(job.name, options);
          if (normalizedName.length >= options.minWordLength) {
            addOccurrence(normalizedName, {
              itemId: job.id,
              name: job.name,
              type: 'job',
              categoryId: category.id,
              categoryName: category.name,
              subcategoryId: subcategory.id,
              subcategoryName: subcategory.name,
              parentCategory: category.name,
              parentSubcategory: subcategory.name,
              description: job.description
            }, 'exact');
          }
        });
      });
    });
  }

  // Now find cross-matches for enabled match types
  const allOccurrences = Array.from(processedItems.entries());
  
  // Find similar matches if enabled
  if (options.matchTypes.includes('similar')) {
    for (let i = 0; i < allOccurrences.length; i++) {
      for (let j = i + 1; j < allOccurrences.length; j++) {
        const [name1, occurrences1] = allOccurrences[i];
        const [name2, occurrences2] = allOccurrences[j];
        
        if (name1 !== name2) {
          const similarity = calculateSimilarity(name1, name2);
          if (similarity >= options.similarityThreshold) {
            // Merge similar items
            const combinedKey = `similar_${Math.min(i, j)}_${Math.max(i, j)}`;
            if (!processedItems.has(combinedKey)) {
              processedItems.set(combinedKey, [...occurrences1, ...occurrences2]);
            }
          }
        }
      }
    }
  }

  // Find partial matches if enabled
  if (options.matchTypes.includes('partial')) {
    for (let i = 0; i < allOccurrences.length; i++) {
      for (let j = i + 1; j < allOccurrences.length; j++) {
        const [name1, occurrences1] = allOccurrences[i];
        const [name2, occurrences2] = allOccurrences[j];
        
        if (name1 !== name2 && (name1.includes(name2) || name2.includes(name1))) {
          const combinedKey = `partial_${Math.min(i, j)}_${Math.max(i, j)}`;
          if (!processedItems.has(combinedKey)) {
            processedItems.set(combinedKey, [...occurrences1, ...occurrences2]);
          }
        }
      }
    }
  }

  // Convert to duplicate items
  processedItems.forEach((occurrences, name) => {
    if (occurrences.length > 1) {
      // Determine match type
      let matchType: 'exact' | 'exact_words' | 'similar' | 'partial' = 'exact';
      if (name.startsWith('similar_')) matchType = 'similar';
      else if (name.startsWith('partial_')) matchType = 'partial';
      else if (name.includes(' ')) matchType = 'exact_words';

      duplicates.push({
        groupId: `group_${groupIdCounter++}`,
        name: occurrences[0].name, // Use the first occurrence's name as the group name
        matchType,
        occurrences: occurrences,
        similarityScore: matchType === 'similar' ? options.similarityThreshold : 100
      });
    }
  });

  console.log('Found duplicates:', duplicates.length);
  duplicates.forEach((dup, index) => {
    console.log(`Duplicate ${index + 1}:`, {
      name: dup.name,
      matchType: dup.matchType,
      occurrences: dup.occurrences.length
    });
  });

  return duplicates;
};
