
import { ServiceJob } from '@/types/serviceHierarchy';
import { serviceSearchSynonyms } from '@/data/comprehensiveServices';

export interface SearchMatch {
  score: number;
  matchedTerms: string[];
  matchType: 'exact' | 'partial' | 'synonym' | 'description';
}

export interface SearchableServiceJob extends ServiceJob {
  searchMatch?: SearchMatch;
}

/**
 * Enhanced search that includes synonym matching for better brake line discovery
 */
export function enhancedSearch(text: string, query: string): SearchMatch | null {
  const normalizedText = text.toLowerCase();
  const normalizedQuery = query.toLowerCase();
  
  // Exact match gets highest score
  if (normalizedText === normalizedQuery) {
    return { score: 100, matchedTerms: [query], matchType: 'exact' };
  }
  
  // Check for direct text inclusion
  if (normalizedText.includes(normalizedQuery)) {
    const isWholeWord = new RegExp(`\\b${normalizedQuery}\\b`).test(normalizedText);
    return { 
      score: isWholeWord ? 90 : 70, 
      matchedTerms: [query], 
      matchType: 'partial' 
    };
  }
  
  // Check synonyms - this is key for finding brake line services
  for (const [mainTerm, synonyms] of Object.entries(serviceSearchSynonyms)) {
    // If the query matches a main term, check if text contains any synonyms
    if (normalizedQuery.includes(mainTerm)) {
      for (const synonym of synonyms) {
        if (normalizedText.includes(synonym)) {
          return { 
            score: 80, 
            matchedTerms: [mainTerm, synonym], 
            matchType: 'synonym' 
          };
        }
      }
    }
    
    // If the query matches a synonym, check if text contains the main term or other synonyms
    if (synonyms.some(synonym => normalizedQuery.includes(synonym))) {
      if (normalizedText.includes(mainTerm)) {
        return { 
          score: 85, 
          matchedTerms: [mainTerm], 
          matchType: 'synonym' 
        };
      }
      for (const synonym of synonyms) {
        if (normalizedText.includes(synonym)) {
          return { 
            score: 75, 
            matchedTerms: [synonym], 
            matchType: 'synonym' 
          };
        }
      }
    }
  }
  
  // Word-by-word matching for partial queries like "line"
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);
  const textWords = normalizedText.split(' ');
  
  const matchingWords = queryWords.filter(queryWord => 
    textWords.some(textWord => textWord.includes(queryWord))
  );
  
  if (matchingWords.length > 0) {
    const matchRatio = matchingWords.length / queryWords.length;
    return { 
      score: Math.round(matchRatio * 60), 
      matchedTerms: matchingWords, 
      matchType: 'partial' 
    };
  }
  
  return null;
}

/**
 * Sort services by search relevance
 */
export function sortByRelevance(jobs: ServiceJob[], query: string): SearchableServiceJob[] {
  if (!query.trim()) return jobs;
  
  const searchResults: SearchableServiceJob[] = [];
  
  for (const job of jobs) {
    // Search in name (highest priority)
    let match = enhancedSearch(job.name, query);
    
    // Search in description if no name match
    if (!match && job.description) {
      match = enhancedSearch(job.description, query);
      if (match) {
        match.score = Math.round(match.score * 0.8); // Slightly lower score for description matches
        match.matchType = 'description';
      }
    }
    
    if (match) {
      searchResults.push({ ...job, searchMatch: match });
    }
  }
  
  // Sort by relevance score (highest first)
  return searchResults.sort((a, b) => (b.searchMatch?.score || 0) - (a.searchMatch?.score || 0));
}
