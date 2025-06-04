
import { ServiceMainCategory, ServiceJob } from "@/types/serviceHierarchy";
import { searchServiceCategories } from "./searchService";
import { serviceSearchSynonyms } from "@/data/comprehensiveServices";

export interface EnhancedSearchOptions {
  includeDescriptions?: boolean;
  fuzzyMatching?: boolean;
  synonymMatching?: boolean;
  minScore?: number;
}

export interface SearchMatch {
  score: number;
  matchType: 'exact' | 'partial' | 'fuzzy' | 'synonym';
  matchedTerms: string[];
}

export interface EnhancedSearchResult extends ServiceJob {
  searchMatch: SearchMatch;
  categoryName: string;
  subcategoryName: string;
}

/**
 * Enhanced search function with scoring and synonym matching
 */
export const performEnhancedSearch = (
  categories: ServiceMainCategory[],
  query: string,
  options: EnhancedSearchOptions = {}
): EnhancedSearchResult[] => {
  const {
    includeDescriptions = true,
    fuzzyMatching = true,
    synonymMatching = true,
    minScore = 0.3
  } = options;

  if (!query.trim()) {
    return [];
  }

  const normalizedQuery = query.toLowerCase().trim();
  const queryTerms = normalizedQuery.split(/\s+/);
  const results: EnhancedSearchResult[] = [];

  // Get synonyms for the query
  const expandedTerms = synonymMatching ? getExpandedTerms(normalizedQuery) : [normalizedQuery];

  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        const searchText = [
          job.name,
          ...(includeDescriptions && job.description ? [job.description] : [])
        ].join(' ').toLowerCase();

        let bestMatch: SearchMatch | null = null;

        // Check each expanded term (including synonyms)
        for (const term of expandedTerms) {
          const match = calculateMatch(searchText, term, queryTerms);
          if (match && (!bestMatch || match.score > bestMatch.score)) {
            bestMatch = match;
          }
        }

        if (bestMatch && bestMatch.score >= minScore) {
          results.push({
            ...job,
            searchMatch: bestMatch,
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        }
      });
    });
  });

  // Sort by relevance score (highest first)
  return results.sort((a, b) => b.searchMatch.score - a.searchMatch.score);
};

// Export the main function with a cleaner name for backward compatibility
export const enhancedSearch = performEnhancedSearch;

/**
 * Expand query terms with synonyms
 */
function getExpandedTerms(query: string): string[] {
  const terms = [query];
  
  // Check if query matches any synonyms
  for (const [mainTerm, synonyms] of Object.entries(serviceSearchSynonyms)) {
    if (Array.isArray(synonyms)) {
      if (synonyms.some(synonym => query.includes(synonym.toLowerCase()))) {
        terms.push(mainTerm.toLowerCase());
      }
      if (mainTerm.toLowerCase().includes(query)) {
        terms.push(...synonyms.map(s => s.toLowerCase()));
      }
    }
  }
  
  return [...new Set(terms)]; // Remove duplicates
};

/**
 * Calculate match score for a search term against text
 */
function calculateMatch(text: string, searchTerm: string, queryTerms: string[]): SearchMatch | null {
  // Exact match
  if (text.includes(searchTerm)) {
    return {
      score: 1.0,
      matchType: 'exact',
      matchedTerms: [searchTerm]
    };
  }

  // Partial word matches
  const textWords = text.split(/\s+/);
  const matchedWords = textWords.filter(word => 
    queryTerms.some(term => word.includes(term) || term.includes(word))
  );

  if (matchedWords.length > 0) {
    const score = Math.min(0.9, (matchedWords.length / queryTerms.length) * 0.8);
    return {
      score,
      matchType: 'partial',
      matchedTerms: matchedWords
    };
  }

  // Fuzzy matching (simple character overlap)
  const overlap = calculateCharacterOverlap(text, searchTerm);
  if (overlap > 0.5) {
    return {
      score: Math.min(0.7, overlap * 0.6),
      matchType: 'fuzzy', 
      matchedTerms: [searchTerm]
    };
  }

  return null;
}

/**
 * Calculate character overlap between two strings
 */
function calculateCharacterOverlap(str1: string, str2: string): number {
  const chars1 = str1.toLowerCase().split('');
  const chars2 = str2.toLowerCase().split('');
  
  const intersection = chars1.filter(char => chars2.includes(char));
  const union = [...new Set([...chars1, ...chars2])];
  
  return intersection.length / union.length;
}

/**
 * Get search suggestions based on partial input
 */
export const getSearchSuggestions = (
  categories: ServiceMainCategory[],
  partialQuery: string,
  maxSuggestions: number = 5
): string[] => {
  if (!partialQuery.trim() || partialQuery.length < 2) {
    return [];
  }

  const query = partialQuery.toLowerCase();
  const suggestions = new Set<string>();

  // Add main terms from synonyms
  for (const [mainTerm, synonyms] of Object.entries(serviceSearchSynonyms)) {
    if (Array.isArray(synonyms)) {
      if (mainTerm.toLowerCase().includes(query)) {
        suggestions.add(mainTerm);
      }
      synonyms.forEach(synonym => {
        if (synonym.toLowerCase().includes(query)) {
          suggestions.add(mainTerm);
        }
      });
    }
  }

  // Add job names that match
  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        if (job.name.toLowerCase().includes(query)) {
          suggestions.add(job.name);
        }
      });
    });
  });

  return Array.from(suggestions).slice(0, maxSuggestions);
};
