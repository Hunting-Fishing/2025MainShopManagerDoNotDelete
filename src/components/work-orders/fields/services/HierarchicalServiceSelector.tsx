
import React, { useState, useMemo } from 'react';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ArrowLeft, Loader2, Search, X } from 'lucide-react';
import { useDebounce } from '@/hooks/useDebounce';
import { searchServiceCategories, getMatchingSubcategories, getMatchingJobs } from '@/utils/search/searchService';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

interface SearchResult {
  service: ServiceJob;
  categoryName: string;
  subcategoryName: string;
  categoryId: string;
  subcategoryId: string;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const { categories, loading, error } = useServiceCategories();

  // Debounce search term to improve performance
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Generate flattened search results
  const searchResults = useMemo<SearchResult[]>(() => {
    if (!debouncedSearchTerm || !categories) return [];

    const results: SearchResult[] = [];
    
    categories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        const matchingJobs = getMatchingJobs(subcategory, debouncedSearchTerm);
        matchingJobs.forEach(job => {
          results.push({
            service: job,
            categoryName: category.name,
            subcategoryName: subcategory.name,
            categoryId: category.id,
            subcategoryId: subcategory.id
          });
        });
      });
    });

    return results;
  }, [debouncedSearchTerm, categories]);

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
  };

  const isSearchActive = debouncedSearchTerm.length > 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading services...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="p-4">No service categories available.</div>;
  }

  return (
    <div className="space-y-4">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input
          type="text"
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 pr-10"
        />
        {searchTerm && (
          <Button
            variant="ghost"
            size="sm"
            onClick={handleClearSearch}
            className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-slate-100"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {/* Search Results */}
      {isSearchActive ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">Search Results</h4>
            <span className="text-xs text-slate-500">
              {searchResults.length} result{searchResults.length !== 1 ? 's' : ''}
            </span>
          </div>
          
          {searchResults.length > 0 ? (
            <div className="space-y-1 max-h-96 overflow-y-auto">
              {searchResults.map((result, index) => (
                <Button
                  key={`${result.categoryId}-${result.subcategoryId}-${result.service.id}-${index}`}
                  variant="ghost"
                  className="justify-start w-full rounded-md px-3 py-3 hover:bg-slate-100 h-auto"
                  onClick={() => handleServiceSelect(result.service, result.categoryName, result.subcategoryName)}
                >
                  <div className="flex flex-col items-start text-left w-full">
                    <div className="font-medium text-sm">{result.service.name}</div>
                    <div className="text-xs text-slate-500 mt-1">
                      {result.categoryName} > {result.subcategoryName}
                    </div>
                    {result.service.description && (
                      <div className="text-xs text-slate-400 mt-1 line-clamp-2">
                        {result.service.description}
                      </div>
                    )}
                  </div>
                </Button>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-slate-500">
              <Search className="mx-auto h-8 w-8 mb-2 opacity-50" />
              <p className="text-sm">No services found for "{debouncedSearchTerm}"</p>
              <p className="text-xs mt-1">Try a different search term</p>
            </div>
          )}
        </div>
      ) : (
        // Hierarchical Navigation (existing functionality)
        <>
          {!selectedCategory ? (
            // Main Categories List
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-slate-700">Categories</h4>
              <div className="space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                    onClick={() => handleCategorySelect(category)}
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : !selectedSubcategory ? (
            // Subcategories List
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button variant="ghost" size="sm" onClick={handleBackToCategories}>
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
                </Button>
                <h4 className="text-sm font-medium text-slate-700">{selectedCategory.name} - Subcategories</h4>
              </div>
              <div className="space-y-1">
                {selectedCategory.subcategories.map((subcategory) => (
                  <Button
                    key={subcategory.id}
                    variant="ghost"
                    className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                    onClick={() => handleSubcategorySelect(subcategory)}
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    {subcategory.name}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            // Services List
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setSelectedSubcategory(null)}
                >
                  <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subcategories
                </Button>
                <h4 className="text-sm font-medium text-slate-700">
                  {selectedCategory.name} - {selectedSubcategory.name} - Services
                </h4>
              </div>
              <div className="space-y-1">
                {selectedSubcategory.jobs.map((service) => (
                  <Button
                    key={service.id}
                    variant="ghost"
                    className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                    onClick={() => handleServiceSelect(service, selectedCategory.name, selectedSubcategory.name)}
                  >
                    <ChevronRight className="mr-2 h-4 w-4" />
                    {service.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
