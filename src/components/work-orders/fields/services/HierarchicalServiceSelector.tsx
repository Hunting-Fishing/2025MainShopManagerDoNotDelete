
import React, { useState, useEffect } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { ServiceCategoryFilter } from './ServiceCategoryFilter';
import { SearchInput } from './SearchInput';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function HierarchicalServiceSelector({
  categories,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices
}: HierarchicalServiceSelectorProps) {
  const [selectedCategoryIndex, setSelectedCategoryIndex] = useState(0);
  const [selectedSubcategoryIndex, setSelectedSubcategoryIndex] = useState(0);
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(categories);

  // Apply category filter
  const displayCategories = selectedCategoryIds.length > 0
    ? filteredCategories.filter(category => selectedCategoryIds.includes(category.id))
    : filteredCategories;

  const selectedCategory = displayCategories[selectedCategoryIndex];
  const selectedSubcategory = selectedCategory?.subcategories[selectedSubcategoryIndex];

  const { navigation } = useKeyboardNavigation(displayCategories, onServiceSelect);

  // Reset indices when categories change
  useEffect(() => {
    if (selectedCategoryIndex >= displayCategories.length) {
      setSelectedCategoryIndex(0);
    }
    if (selectedCategory && selectedSubcategoryIndex >= selectedCategory.subcategories.length) {
      setSelectedSubcategoryIndex(0);
    }
  }, [displayCategories, selectedCategory, selectedCategoryIndex, selectedSubcategoryIndex]);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
    setSearchQuery('');
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  return (
    <div className="space-y-4">
      {/* Category Filter */}
      <ServiceCategoryFilter
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
      />

      {/* Search */}
      <div className="space-y-2">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search services..."
          suggestions={suggestions}
        />
        
        {/* Search Stats */}
        {searchStats && (
          <div className="text-xs text-gray-500 px-1">
            Found {searchStats.jobs} services in {searchStats.categories} categories
            {searchStats.highRelevanceJobs > 0 && (
              <span className="ml-2 text-blue-600">
                ({searchStats.highRelevanceJobs} highly relevant)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Three-column layout */}
      <div className="grid grid-cols-3 gap-4 min-h-[400px] max-h-[600px]">
        {/* Categories Column */}
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 border-b bg-gray-50 sticky top-0">
            <h4 className="text-sm font-medium text-gray-700">
              Categories ({displayCategories.length})
            </h4>
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-1">
              {displayCategories.map((category, index) => (
                <button
                  key={category.id}
                  data-nav={`category-${index}`}
                  onClick={() => {
                    setSelectedCategoryIndex(index);
                    setSelectedSubcategoryIndex(0);
                  }}
                  className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                    index === selectedCategoryIndex
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : navigation.navigation.activeColumn === 'categories' && navigation.navigation.selectedCategoryIndex === index
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{category.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)}
                    </Badge>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {category.description}
                    </p>
                  )}
                </button>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Subcategories Column */}
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 border-b bg-gray-50 sticky top-0">
            <h4 className="text-sm font-medium text-gray-700">
              Subcategories ({selectedCategory?.subcategories.length || 0})
            </h4>
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-1">
              {selectedCategory?.subcategories.map((subcategory, index) => (
                <button
                  key={subcategory.id}
                  data-nav={`subcategory-${index}`}
                  onClick={() => setSelectedSubcategoryIndex(index)}
                  className={`w-full text-left p-3 rounded-md text-sm transition-colors ${
                    index === selectedSubcategoryIndex
                      ? 'bg-blue-100 text-blue-900 border border-blue-300'
                      : navigation.navigation.activeColumn === 'subcategories' && navigation.navigation.selectedSubcategoryIndex === index
                      ? 'bg-blue-50 border border-blue-200'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{subcategory.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {subcategory.jobs.length}
                    </Badge>
                  </div>
                  {subcategory.description && (
                    <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                      {subcategory.description}
                    </p>
                  )}
                </button>
              )) || (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a category to view subcategories
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Services Column */}
        <div className="border border-gray-200 rounded-lg">
          <div className="p-3 border-b bg-gray-50 sticky top-0">
            <h4 className="text-sm font-medium text-gray-700">
              Services ({selectedSubcategory?.jobs.length || 0})
            </h4>
          </div>
          <ScrollArea className="h-[350px]">
            <div className="p-2 space-y-1">
              {selectedSubcategory?.jobs.map((job, index) => {
                const isSelected = isServiceSelected(job.id);
                return (
                  <div
                    key={job.id}
                    data-nav={`job-${index}`}
                    className={`border rounded-md p-3 transition-colors ${
                      isSelected
                        ? 'border-green-300 bg-green-50'
                        : navigation.navigation.activeColumn === 'jobs' && navigation.navigation.selectedJobIndex === index
                        ? 'border-blue-200 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <h5 className="text-sm font-medium text-gray-900 mb-1">
                          {job.name}
                        </h5>
                        {job.description && (
                          <p className="text-xs text-gray-600 mb-2 line-clamp-2">
                            {job.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          {job.estimatedTime && (
                            <span>⏱️ {job.estimatedTime}min</span>
                          )}
                          {job.price && (
                            <span>💰 ${job.price}</span>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "outline"}
                        onClick={() => handleServiceSelect(
                          job,
                          selectedCategory.name,
                          selectedSubcategory.name
                        )}
                        disabled={isSelected}
                        className="ml-2 flex-shrink-0"
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                );
              }) || (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a subcategory to view services
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded border">
        💡 <strong>Tip:</strong> Use ↑↓ arrow keys to navigate, → to move to next column, ← to go back, Enter to select
      </div>
    </div>
  );
}
