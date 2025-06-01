
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronRight, Grid, List } from 'lucide-react';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { searchServiceCategories, getMatchingSubcategories, getMatchingJobs } from '@/utils/search/searchService';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSubcategoryGrid } from './ServiceSubcategoryGrid';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: any, categoryName: string, subcategoryName: string) => void;
}

interface SearchResult {
  service: any;
  categoryName: string;
  subcategoryName: string;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const { categories, loading, error } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'hierarchical' | 'search'>('hierarchical');
  
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search results - flatten all services that match the search term
  const searchResults = useMemo((): SearchResult[] => {
    if (!debouncedSearchTerm.trim() || viewMode !== 'search') return [];
    
    const results: SearchResult[] = [];
    
    for (const category of categories) {
      for (const subcategory of category.subcategories) {
        const matchingJobs = getMatchingJobs(subcategory, debouncedSearchTerm);
        for (const job of matchingJobs) {
          results.push({
            service: job,
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        }
      }
    }
    
    return results;
  }, [categories, debouncedSearchTerm, viewMode]);

  // Get category names for hierarchical view
  const categoryNames = categories.map(cat => cat.name);

  // Get selected category data
  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const subcategoryNames = selectedCategoryData?.subcategories.map(sub => sub.name) || [];

  // Get selected subcategory data
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(sub => sub.name === selectedSubcategory);
  const services = selectedSubcategoryData?.jobs || [];

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: string) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceSelect = (service: any) => {
    if (viewMode === 'search') {
      // Find the category and subcategory for this service
      for (const category of categories) {
        for (const subcategory of category.subcategories) {
          if (subcategory.jobs.some(job => job.id === service.id)) {
            onServiceSelect(service, category.name, subcategory.name);
            return;
          }
        }
      }
    } else {
      // Hierarchical mode
      if (selectedCategory && selectedSubcategory) {
        onServiceSelect(service, selectedCategory, selectedSubcategory);
      }
    }
  };

  const handleSearchResultSelect = (result: SearchResult) => {
    onServiceSelect(result.service, result.categoryName, result.subcategoryName);
  };

  const resetHierarchicalSelection = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleViewMode = () => {
    const newMode = viewMode === 'hierarchical' ? 'search' : 'hierarchical';
    setViewMode(newMode);
    
    // Clear states when switching modes
    if (newMode === 'search') {
      resetHierarchicalSelection();
    } else {
      clearSearch();
    }
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* View Mode Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'hierarchical' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('hierarchical')}
            className="flex items-center gap-2"
          >
            <Grid className="h-4 w-4" />
            Categories
          </Button>
          <Button
            variant={viewMode === 'search' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('search')}
            className="flex items-center gap-2"
          >
            <Search className="h-4 w-4" />
            Search
          </Button>
        </div>
      </div>

      {/* Search Mode */}
      {viewMode === 'search' && (
        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              type="text"
              placeholder="Search for services (e.g., 'oil change', 'brake', 'tire')..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-10"
            />
            {searchTerm && (
              <button
                onClick={clearSearch}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Search Results */}
          {debouncedSearchTerm && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">
                Search Results ({searchResults.length})
              </h4>
              
              {searchResults.length > 0 ? (
                <div className="space-y-2">
                  {searchResults.map((result, index) => (
                    <div
                      key={`${result.service.id}-${index}`}
                      className="p-3 border rounded-md hover:bg-gray-50 cursor-pointer"
                      onClick={() => handleSearchResultSelect(result)}
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <h5 className="font-medium text-gray-900">{result.service.name}</h5>
                          <div className="flex items-center text-sm text-gray-500">
                            <span>{result.categoryName}</span>
                            <ChevronRight className="h-3 w-3 mx-1" />
                            <span>{result.subcategoryName}</span>
                          </div>
                          {result.service.description && (
                            <p className="text-sm text-gray-600 mt-1">{result.service.description}</p>
                          )}
                        </div>
                        <div className="text-right">
                          {result.service.price && (
                            <p className="font-medium text-green-600">${result.service.price}</p>
                          )}
                          {result.service.estimatedTime && (
                            <p className="text-sm text-gray-500">{result.service.estimatedTime} min</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <p className="text-gray-500">No services found matching "{debouncedSearchTerm}"</p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Hierarchical Mode */}
      {viewMode === 'hierarchical' && (
        <div className="space-y-4">
          {/* Breadcrumb */}
          {(selectedCategory || selectedSubcategory) && (
            <div className="flex items-center space-x-2 text-sm text-gray-600">
              <button
                onClick={resetHierarchicalSelection}
                className="text-blue-600 hover:text-blue-800"
              >
                All Categories
              </button>
              {selectedCategory && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedCategory}</span>
                </>
              )}
              {selectedSubcategory && (
                <>
                  <ChevronRight className="h-4 w-4" />
                  <span>{selectedSubcategory}</span>
                </>
              )}
            </div>
          )}

          {/* Category Selection */}
          {!selectedCategory && (
            <ServiceCategoryList
              categories={categoryNames}
              onCategorySelect={handleCategorySelect}
            />
          )}

          {/* Subcategory Selection */}
          {selectedCategory && !selectedSubcategory && (
            <ServiceSubcategoryGrid
              subcategories={subcategoryNames}
              onSubcategorySelect={handleSubcategorySelect}
            />
          )}

          {/* Service Selection */}
          {selectedCategory && selectedSubcategory && services.length > 0 && (
            <div className="space-y-2">
              <h4 className="text-sm font-medium text-gray-700">Available Services</h4>
              <div className="grid gap-2">
                {services.map((service) => (
                  <button
                    key={service.id}
                    onClick={() => handleServiceSelect(service)}
                    className="p-3 text-left border rounded-md hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h5 className="font-medium text-gray-900">{service.name}</h5>
                        {service.description && (
                          <p className="text-sm text-gray-600">{service.description}</p>
                        )}
                      </div>
                      <div className="text-right">
                        {service.price && (
                          <p className="font-medium text-green-600">${service.price}</p>
                        )}
                        {service.estimatedTime && (
                          <p className="text-sm text-gray-500">{service.estimatedTime} min</p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
