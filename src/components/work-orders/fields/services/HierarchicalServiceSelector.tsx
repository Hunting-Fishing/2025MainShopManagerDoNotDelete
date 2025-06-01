
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronRight, Grid, List } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { searchServices } from '@/lib/services/searchService';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSubcategoryGrid } from './ServiceSubcategoryGrid';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const { categories, loading, error } = useServiceCategories();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'hierarchical' | 'search'>('hierarchical');

  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search results
  const searchResults = useMemo(() => {
    if (!debouncedSearchTerm.trim() || viewMode !== 'search') return [];
    return searchServices(categories, debouncedSearchTerm);
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

  const handleServiceSelect = (service: ServiceJob) => {
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

  const handleSearchResultSelect = (result: any) => {
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
          {searchTerm && (
            <div className="space-y-2">
              {searchResults.length > 0 ? (
                <>
                  <div className="text-sm text-gray-600">
                    {searchResults.length} result{searchResults.length !== 1 ? 's' : ''} found
                  </div>
                  <div className="space-y-2 max-h-64 overflow-y-auto">
                    {searchResults.map((result, index) => (
                      <div
                        key={index}
                        className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer transition-colors"
                        onClick={() => handleSearchResultSelect(result)}
                      >
                        <div className="font-medium text-sm">{result.service.name}</div>
                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                          <span>{result.categoryName}</span>
                          <ChevronRight className="h-3 w-3" />
                          <span>{result.subcategoryName}</span>
                        </div>
                        {result.service.description && (
                          <div className="text-xs text-gray-600 mt-1">{result.service.description}</div>
                        )}
                        {(result.service.estimatedTime || result.service.price) && (
                          <div className="flex items-center gap-3 text-xs text-gray-500 mt-2">
                            {result.service.estimatedTime && (
                              <span>⏱️ {result.service.estimatedTime} min</span>
                            )}
                            {result.service.price && (
                              <span>💰 ${result.service.price}</span>
                            )}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No services found for "{searchTerm}"</p>
                  <p className="text-sm">Try different keywords or browse categories</p>
                </div>
              )}
            </div>
          )}

          {!searchTerm && (
            <div className="text-center py-8 text-gray-500">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Start typing to search for services</p>
            </div>
          )}
        </div>
      )}

      {/* Hierarchical Mode */}
      {viewMode === 'hierarchical' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
          {/* Categories Column */}
          <div className="border rounded-lg">
            <ServiceCategoryList
              categories={categoryNames}
              selectedCategory={selectedCategory}
              onCategorySelect={handleCategorySelect}
            />
          </div>

          {/* Subcategories Column */}
          <div className="border rounded-lg">
            {selectedCategory ? (
              <ServiceSubcategoryGrid
                category={selectedCategory}
                subcategories={subcategoryNames}
                selectedSubcategory={selectedSubcategory}
                onSelectSubcategory={handleSubcategorySelect}
              />
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a category</p>
                </div>
              </div>
            )}
          </div>

          {/* Services Column */}
          <div className="border rounded-lg">
            {selectedSubcategory ? (
              <div className="h-full">
                <div className="p-2 border-b">
                  <h3 className="font-medium text-sm">Services</h3>
                </div>
                <div className="p-2 overflow-y-auto max-h-56">
                  <ul className="space-y-1">
                    {services.map((service) => (
                      <li key={service.id}>
                        <button
                          type="button"
                          className="w-full text-left px-2 py-2 rounded-md text-sm hover:bg-blue-50 transition border border-transparent hover:border-blue-200"
                          onClick={() => handleServiceSelect(service)}
                        >
                          <div className="font-medium">{service.name}</div>
                          {service.description && (
                            <div className="text-xs text-gray-600 mt-1">{service.description}</div>
                          )}
                          {(service.estimatedTime || service.price) && (
                            <div className="flex items-center gap-3 text-xs text-gray-500 mt-1">
                              {service.estimatedTime && (
                                <span>⏱️ {service.estimatedTime} min</span>
                              )}
                              {service.price && (
                                <span>💰 ${service.price}</span>
                              )}
                            </div>
                          )}
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <List className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p className="text-sm">Select a subcategory</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
