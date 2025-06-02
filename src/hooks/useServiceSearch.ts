
import { useState, useMemo } from 'react';
import { useDebounce } from './useDebounce';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';

export function useServiceSearch(categories: ServiceMainCategory[]) {
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebounce(searchQuery, 300);

  const filteredCategories = useMemo(() => {
    if (!debouncedQuery.trim()) {
      return categories;
    }

    const query = debouncedQuery.toLowerCase();
    
    return categories.map(category => {
      // Filter subcategories and their jobs
      const filteredSubcategories = category.subcategories.map(subcategory => {
        // Filter jobs within this subcategory
        const filteredJobs = subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(query) ||
          (job.description && job.description.toLowerCase().includes(query))
        );

        // Include subcategory if it matches or has matching jobs
        const subcategoryMatches = 
          subcategory.name.toLowerCase().includes(query) ||
          (subcategory.description && subcategory.description.toLowerCase().includes(query)) ||
          filteredJobs.length > 0;

        return subcategoryMatches ? {
          ...subcategory,
          jobs: filteredJobs.length > 0 ? filteredJobs : subcategory.jobs
        } : null;
      }).filter(Boolean) as ServiceSubcategory[];

      // Include category if it matches or has matching subcategories
      const categoryMatches = 
        category.name.toLowerCase().includes(query) ||
        (category.description && category.description.toLowerCase().includes(query)) ||
        filteredSubcategories.length > 0;

      return categoryMatches ? {
        ...category,
        subcategories: filteredSubcategories.length > 0 ? filteredSubcategories : category.subcategories
      } : null;
    }).filter(Boolean) as ServiceMainCategory[];
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

    return {
      categories: filteredCategories.length,
      subcategories: totalSubcategories,
      jobs: totalJobs,
      query: debouncedQuery
    };
  }, [filteredCategories, debouncedQuery]);

  return {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    isSearching: debouncedQuery.trim().length > 0
  };
}
