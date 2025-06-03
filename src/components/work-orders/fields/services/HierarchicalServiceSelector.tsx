
import React, { useState, useMemo } from 'react';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { SearchInput } from './SearchInput';
import { ServiceCategoryFilter } from './ServiceCategoryFilter';

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
  const [selectedCategoryIds, setSelectedCategoryIds] = useState<string[]>([]);
  
  // Filter categories based on selected filters
  const filteredCategories = useMemo(() => {
    if (selectedCategoryIds.length === 0) {
      return categories;
    }
    return categories.filter(category => selectedCategoryIds.includes(category.id));
  }, [categories, selectedCategoryIds]);

  const {
    searchQuery,
    setSearchQuery,
    filteredCategories: searchFilteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(filteredCategories);

  const {
    navigation,
    currentCategory,
    currentSubcategory,
    currentJob
  } = useKeyboardNavigation(searchFilteredCategories, onServiceSelect);

  const handleCategoryToggle = (categoryId: string) => {
    setSelectedCategoryIds(prev => 
      prev.includes(categoryId)
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const handleClearFilters = () => {
    setSelectedCategoryIds([]);
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  const handleServiceClick = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (!isServiceSelected(service.id)) {
      onServiceSelect(service, categoryName, subcategoryName);
    }
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

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search services..."
        suggestions={suggestions}
        onSuggestionSelect={setSearchQuery}
      />

      {/* Search Stats */}
      {searchStats && (
        <div className="text-xs text-gray-500 bg-blue-50 p-2 rounded">
          Found {searchStats.jobs} services in {searchStats.categories} categories
          {searchStats.highRelevanceJobs > 0 && (
            <span className="ml-2 text-blue-600 font-medium">
              ({searchStats.highRelevanceJobs} highly relevant)
            </span>
          )}
        </div>
      )}

      {/* Service Hierarchy */}
      <div className="grid grid-cols-3 gap-4 h-96">
        {/* Categories Column */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h4 className="font-medium text-sm">Categories</h4>
            {selectedCategoryIds.length > 0 && (
              <p className="text-xs text-gray-500 mt-1">
                {selectedCategoryIds.length} selected
              </p>
            )}
          </div>
          <ScrollArea className="h-80">
            <div className="p-2 space-y-1">
              {searchFilteredCategories.map((category, index) => (
                <div
                  key={category.id}
                  data-nav={`category-${index}`}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    navigation.activeColumn === 'categories' && navigation.selectedCategoryIndex === index
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => {
                    // Handle category selection if needed
                  }}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {category.subcategories.length} subcategories
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Subcategories Column */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h4 className="font-medium text-sm">Subcategories</h4>
            {currentCategory && (
              <p className="text-xs text-gray-500 mt-1">{currentCategory.name}</p>
            )}
          </div>
          <ScrollArea className="h-80">
            <div className="p-2 space-y-1">
              {currentCategory?.subcategories.map((subcategory, index) => (
                <div
                  key={subcategory.id}
                  data-nav={`subcategory-${index}`}
                  className={`p-3 rounded cursor-pointer transition-colors ${
                    navigation.activeColumn === 'subcategories' && navigation.selectedSubcategoryIndex === index
                      ? 'bg-blue-100 border border-blue-300'
                      : 'hover:bg-gray-50 border border-transparent'
                  }`}
                  onClick={() => {
                    // Handle subcategory selection if needed
                  }}
                >
                  <div className="font-medium text-sm">{subcategory.name}</div>
                  {subcategory.description && (
                    <div className="text-xs text-gray-500 mt-1">{subcategory.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {subcategory.jobs.length} services
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </div>

        {/* Services Column */}
        <div className="border rounded-lg overflow-hidden">
          <div className="bg-gray-50 p-3 border-b">
            <h4 className="font-medium text-sm">Services</h4>
            {currentSubcategory && (
              <p className="text-xs text-gray-500 mt-1">{currentSubcategory.name}</p>
            )}
          </div>
          <ScrollArea className="h-80">
            <div className="p-2 space-y-1">
              {currentSubcategory?.jobs.map((job, index) => {
                const isSelected = isServiceSelected(job.id);
                return (
                  <div
                    key={job.id}
                    data-nav={`job-${index}`}
                    className={`p-3 rounded cursor-pointer transition-colors ${
                      navigation.activeColumn === 'jobs' && navigation.selectedJobIndex === index
                        ? 'bg-blue-100 border border-blue-300'
                        : isSelected
                        ? 'bg-green-50 border border-green-200'
                        : 'hover:bg-gray-50 border border-transparent'
                    }`}
                    onClick={() => !isSelected && handleServiceClick(job, currentCategory!.name, currentSubcategory!.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{job.name}</div>
                        {job.description && (
                          <div className="text-xs text-gray-500 mt-1">{job.description}</div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {job.estimatedTime && (
                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {job.estimatedTime}min
                            </span>
                          )}
                          {job.price && (
                            <span className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                              ${job.price}
                            </span>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Badge variant="secondary" className="ml-2 bg-green-100 text-green-800">
                          Selected
                        </Badge>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Keyboard Navigation Help */}
      <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded">
        <strong>Keyboard shortcuts:</strong> Arrow keys to navigate, Enter to select, Tab to switch columns, Esc to reset
      </div>
    </div>
  );
}
