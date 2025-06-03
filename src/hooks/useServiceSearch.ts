
import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { ServiceMainCategory } from '@/types/serviceHierarchy';
import { searchServiceCategories, searchAllJobs } from '@/lib/services/serviceUtils';
import { serviceSearchSynonyms } from '@/data/comprehensiveServices';

export function useServiceSearch(categories: ServiceMainCategory[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return categories;
    }

    console.log('Searching for:', debouncedQuery, 'in', categories.length, 'categories');
    const results = searchServiceCategories(categories, debouncedQuery);
    console.log('Search results:', results.length, 'categories found');
    
    return results;
  }, [categories, debouncedQuery]);

  const searchStats = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return null;
    }

    const totalJobs = filteredCategories.reduce((total, category) => 
      total + category.subcategories.reduce((subTotal, subcategory) => 
        subTotal + subcategory.jobs.length, 0), 0);

    const totalSubcategories = filteredCategories.reduce((total, category) => 
      total + category.subcategories.length, 0);

    // Get all matching jobs for high relevance count
    const allMatchingJobs = searchAllJobs(filteredCategories, debouncedQuery);
    const highRelevanceJobs = allMatchingJobs.filter(job => 
      (job as any).searchMatch?.score && (job as any).searchMatch.score >= 80
    ).length;

    return {
      categories: filteredCategories.length,
      subcategories: totalSubcategories,
      jobs: totalJobs,
      highRelevanceJobs,
      query: debouncedQuery
    };
  }, [filteredCategories, debouncedQuery]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 2) {
      return [];
    }

    // Generate suggestions based on search synonyms and common terms
    const suggestions = [];
    const query = debouncedQuery.toLowerCase();
    
    // Check if query matches any synonyms and suggest the main term
    for (const [mainTerm, synonyms] of Object.entries(serviceSearchSynonyms)) {
      if (synonyms.some(synonym => synonym.includes(query)) && !mainTerm.includes(query)) {
        suggestions.push(mainTerm);
      }
      if (mainTerm.includes(query) && mainTerm !== query) {
        suggestions.push(mainTerm);
      }
    }
    
    // Add common automotive terms that include the query
    const commonTerms = [
      'brake line repair', 'brake line replacement', 'brake hose', 'fluid line',
      'oil change', 'brake pad', 'tire rotation', 'tune up', 'transmission service',
      'air filter', 'cabin filter', 'spark plug', 'battery', 'alternator'
    ];

    const additionalSuggestions = commonTerms
      .filter(term => 
        term.toLowerCase().includes(query) && 
        term.toLowerCase() !== query &&
        !suggestions.includes(term)
      )
      .slice(0, 3);

    return [...suggestions, ...additionalSuggestions].slice(0, 5);
  }, [debouncedQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching: debouncedQuery.trim().length > 0
  };
}
