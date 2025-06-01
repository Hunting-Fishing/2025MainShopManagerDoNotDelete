
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, X, ChevronRight, Grid, List } from 'lucide-react';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSubcategoryGrid } from './ServiceSubcategoryGrid';
import { ServiceJob } from '@/types/serviceHierarchy';

// Simple search function to find services
function searchServices(categories: any[], searchTerm: string) {
  const results: Array<{
    service: ServiceJob;
    categoryName: string;
    subcategoryName: string;
  }> = [];

  categories.forEach(category => {
    category.subcategories.forEach(subcategory => {
      subcategory.jobs.forEach(job => {
        if (job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description?.toLowerCase().includes(searchTerm.toLowerCase())) {
          results.push({
            service: job,
            categoryName: category.name,
            subcategoryName: subcategory.name
          });
        }
      });
    });
  });

  return results;
}

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

  const handleSearchResultSelect = (result: { service: ServiceJob; categoryName: string; subcategoryName: string }) => {
    onServiceSelect(result.service, result.categoryName, result.subcategoryName);
  };

  const resetHierarchicalSelection = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const clearSearch = () => {
    setSearchTerm('');
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
          {searchResults.length > 0 ? (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {searchResults.map((result, index) => (
                <div
                  key={index}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleSearchResultSelect(result)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="font-medium">{result.service.name}</h4>
                      <p className="text-sm text-gray-500">
                        {result.categoryName} <ChevronRight className="inline h-3 w-3 mx-1" /> {result.subcategoryName}
                      </p>
                      {result.service.description && (
                        <p className="text-sm text-gray-600 mt-1">{result.service.description}</p>
                      )}
                    </div>
                    <div className="text-right">
                      {result.service.price && (
                        <p className="font-medium">${result.service.price}</p>
                      )}
                      {result.service.estimatedTime && (
                        <p className="text-sm text-gray-500">{result.service.estimatedTime} min</p>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : debouncedSearchTerm.trim() ? (
            <div className="text-center py-8">
              <p className="text-gray-500">No services found for "{debouncedSearchTerm}"</p>
            </div>
          ) : null}
        </div>
      )}

      {/* Hierarchical Mode */}
      {viewMode === 'hierarchical' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-64">
          {/* Categories */}
          <ServiceCategoryList
            categories={categoryNames}
            selectedCategory={selectedCategory}
            onCategorySelect={handleCategorySelect}
          />

          {/* Subcategories */}
          {selectedCategory && (
            <ServiceSubcategoryGrid
              category={selectedCategory}
              subcategories={subcategoryNames}
              selectedSubcategory={selectedSubcategory}
              onSelectSubcategory={handleSubcategorySelect}
            />
          )}

          {/* Services */}
          {selectedSubcategory && services.length > 0 && (
            <div className="h-full">
              <div className="p-2 border-b">
                <h3 className="font-medium text-sm">Services</h3>
              </div>
              
              <div className="p-2 overflow-y-auto max-h-56">
                <ul className="space-y-2">
                  {services.map((service) => (
                    <li key={service.id}>
                      <button
                        type="button"
                        className="w-full text-left p-2 rounded-md hover:bg-blue-50 border border-gray-200"
                        onClick={(e) => {
                          e.preventDefault();
                          handleServiceSelect(service);
                        }}
                      >
                        <div className="font-medium text-sm">{service.name}</div>
                        {service.description && (
                          <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                        )}
                        <div className="flex justify-between items-center mt-1">
                          {service.price && (
                            <span className="text-sm font-medium text-green-600">
                              ${service.price}
                            </span>
                          )}
                          {service.estimatedTime && (
                            <span className="text-xs text-gray-500">
                              {service.estimatedTime} min
                            </span>
                          )}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
