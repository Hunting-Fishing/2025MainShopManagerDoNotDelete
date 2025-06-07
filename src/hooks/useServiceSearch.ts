
import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { enhancedSearch, sortByRelevance, SearchMatch } from '@/utils/search/enhancedSearch';

interface EnhancedServiceJob extends ServiceJob {
  searchMatch?: SearchMatch;
}

interface EnhancedServiceSubcategory extends ServiceSubcategory {
  jobs: EnhancedServiceJob[];
  searchMatch?: SearchMatch;
}

interface EnhancedServiceMainCategory extends ServiceMainCategory {
  subcategories: EnhancedServiceSubcategory[];
  searchMatch?: SearchMatch;
}

export function useServiceSearch(categories: ServiceMainCategory[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return categories;
    }

    const query = debouncedQuery.toLowerCase();
    const results: EnhancedServiceMainCategory[] = [];
    
    for (const category of categories) {
      // Check if category matches
      const categoryMatch = enhancedSearch(category.name, query) || 
                           (category.description ? enhancedSearch(category.description, query) : null);
      
      const filteredSubcategories: EnhancedServiceSubcategory[] = [];
      
      for (const subcategory of category.subcategories) {
        // Check if subcategory matches
        const subcategoryMatch = enhancedSearch(subcategory.name, query) || 
                                (subcategory.description ? enhancedSearch(subcategory.description, query) : null);
        
        // Get matching jobs using enhanced search with relevance scoring
        const matchingJobs = sortByRelevance(subcategory.jobs, query);
        
        // Include subcategory if it matches, has matching jobs, or category matches
        if (subcategoryMatch || matchingJobs.length > 0 || categoryMatch) {
          filteredSubcategories.push({
            ...subcategory,
            jobs: matchingJobs.length > 0 ? matchingJobs : subcategory.jobs,
            searchMatch: subcategoryMatch || undefined
          });
        }
      }
      
      // Include category if it matches or has matching subcategories
      if (categoryMatch || filteredSubcategories.length > 0) {
        results.push({
          ...category,
          subcategories: filteredSubcategories,
          searchMatch: categoryMatch || undefined
        });
      }
    }
    
    // Sort categories by relevance if they have search matches
    return results.sort((a, b) => {
      const aScore = a.searchMatch?.score || 0;
      const bScore = b.searchMatch?.score || 0;
      return bScore - aScore;
    });
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

    // Count jobs with high relevance scores (80+)
    const highRelevanceJobs = filteredCategories.reduce((total, category) => 
      total + category.subcategories.reduce((subTotal, subcategory) => 
        subTotal + subcategory.jobs.filter(job => 
          (job as EnhancedServiceJob).searchMatch?.score && 
          (job as EnhancedServiceJob).searchMatch!.score >= 80
        ).length, 0), 0);

    return {
      categories: filteredCategories.length,
      subcategories: totalSubcategories,
      jobs: totalJobs,
      highRelevanceJobs,
      query: debouncedQuery
    };
  }, [filteredCategories, debouncedQuery]);

  const suggestions = useMemo(() => {
    if (!debouncedQuery.trim() || debouncedQuery.length < 3) {
      return [];
    }

    // Generate search suggestions based on common automotive terms
    const commonTerms = [
      'oil change', 'brake pad', 'tire rotation', 'tune up', 'transmission service',
      'air filter', 'cabin filter', 'spark plug', 'battery', 'alternator',
      'timing belt', 'serpentine belt', 'water pump', 'radiator', 'muffler',
      'catalytic converter', 'shock absorber', 'strut', 'wheel bearing'
    ];

    return commonTerms
      .filter(term => 
        term.toLowerCase().includes(debouncedQuery.toLowerCase()) && 
        term.toLowerCase() !== debouncedQuery.toLowerCase()
      )
      .slice(0, 5);
  }, [debouncedQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCategories: filteredCategories as ServiceMainCategory[],
    searchStats,
    suggestions,
    isSearching: debouncedQuery.trim().length > 0
  };
}
