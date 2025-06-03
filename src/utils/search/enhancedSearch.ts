
import { ServiceJob } from '@/types/serviceHierarchy';
import { serviceSearchSynonyms } from '@/data/comprehensiveServices';

export interface SearchMatch {
  score: number;
  matchedTerms: string[];
  matchType: 'exact' | 'partial' | 'synonym' | 'description' | 'abbreviation';
}

export interface SearchableServiceJob extends ServiceJob {
  searchMatch?: SearchMatch;
}

/**
 * Normalize automotive repair abbreviations and terminology
 */
function normalizeAutomotiveTerms(text: string): string {
  return text
    .toLowerCase()
    .replace(/\br\s*&\s*r\b/g, 'replace') // Handle R&R variations
    .replace(/\br\s*and\s*r\b/g, 'replace') // Handle "R and R"
    .replace(/\bremove\s+and\s+replace\b/g, 'replace')
    .replace(/\bremove\s*\/\s*replace\b/g, 'replace')
    .replace(/\bs\/r\b/g, 'replace') // Service/Replace abbreviation
    .replace(/\binst\b/g, 'install') // Installation abbreviation
    .trim();
}

/**
 * Enhanced search that includes synonym matching and automotive terminology
 */
export function enhancedSearch(text: string, query: string): SearchMatch | null {
  const normalizedText = normalizeAutomotiveTerms(text);
  const normalizedQuery = normalizeAutomotiveTerms(query);
  
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
  
  // Check for automotive abbreviations
  const abbreviationMatches = checkAbbreviationMatches(normalizedText, normalizedQuery);
  if (abbreviationMatches) {
    return abbreviationMatches;
  }
  
  // Check synonyms - enhanced for automotive terminology
  for (const [mainTerm, synonyms] of Object.entries(serviceSearchSynonyms)) {
    // If the query matches a main term, check if text contains any synonyms
    if (normalizedQuery.includes(mainTerm)) {
      for (const synonym of synonyms) {
        if (normalizedText.includes(synonym)) {
          return { 
            score: 85, 
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
        if (normalizedText.includes(synonym) && synonym !== normalizedQuery) {
          return { 
            score: 80, 
            matchedTerms: [synonym], 
            matchType: 'synonym' 
          };
        }
      }
    }
  }
  
  // Word-by-word matching for partial queries
  const queryWords = normalizedQuery.split(' ').filter(word => word.length > 2);
  const textWords = normalizedText.split(' ');
  
  const matchingWords = queryWords.filter(queryWord => 
    textWords.some(textWord => 
      textWord.includes(queryWord) || 
      queryWord.includes(textWord)
    )
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
 * Check for automotive abbreviation matches
 */
function checkAbbreviationMatches(text: string, query: string): SearchMatch | null {
  const abbreviations = {
    'replace': ['r&r', 'r & r', 'remove and replace', 'inst', 'install'],
    'belt': ['serpentine', 'drive belt', 'accessory belt'],
    'service': ['svc', 'maint', 'maintenance'],
    'inspection': ['insp', 'check'],
    'repair': ['rep', 'fix']
  };
  
  for (const [fullTerm, abbrevs] of Object.entries(abbreviations)) {
    // Check if query is an abbreviation and text contains full term
    if (abbrevs.some(abbrev => query.includes(abbrev)) && text.includes(fullTerm)) {
      return {
        score: 85,
        matchedTerms: [fullTerm],
        matchType: 'abbreviation'
      };
    }
    
    // Check if query contains full term and text contains abbreviation
    if (query.includes(fullTerm) && abbrevs.some(abbrev => text.includes(abbrev))) {
      return {
        score: 80,
        matchedTerms: [fullTerm],
        matchType: 'abbreviation'
      };
    }
  }
  
  return null;
}

/**
 * Sort services by search relevance with enhanced scoring
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
  
  // Sort by relevance score (highest first), then by match type priority
  return searchResults.sort((a, b) => {
    const scoreA = a.searchMatch?.score || 0;
    const scoreB = b.searchMatch?.score || 0;
    
    if (scoreA !== scoreB) {
      return scoreB - scoreA;
    }
    
    // If scores are equal, prioritize by match type
    const typeOrder = { 'exact': 5, 'abbreviation': 4, 'synonym': 3, 'partial': 2, 'description': 1 };
    const typeA = typeOrder[a.searchMatch?.matchType || 'description'] || 0;
    const typeB = typeOrder[b.searchMatch?.matchType || 'description'] || 0;
    
    return typeB - typeA;
  });
}

