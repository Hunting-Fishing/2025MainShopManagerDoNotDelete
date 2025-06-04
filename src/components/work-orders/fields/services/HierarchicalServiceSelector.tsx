
import React, { useState, useMemo } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { ServiceCategoryFilter } from './ServiceCategoryFilter';
import { SearchInput } from './SearchInput';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { Button } from '@/components/ui/button';
import { Plus, ChevronRight, Keyboard } from 'lucide-react';

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
  
  // Filter categories based on selected category filters
  const filteredByCategory = useMemo(() => {
    if (selectedCategoryIds.length === 0) return categories;
    return categories.filter(category => selectedCategoryIds.includes(category.id));
  }, [categories, selectedCategoryIds]);

  // Apply search functionality to filtered categories
  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(filteredByCategory);

  // Keyboard navigation
  const { navigation, currentCategory, currentSubcategory, currentJob } = useKeyboardNavigation(
    filteredCategories,
    onServiceSelect
  );

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

  const isSelected = (serviceId: string) => 
    selectedServices.some(service => service.serviceId === serviceId);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (!isSelected(service.id)) {
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden" tabIndex={0}>
      {/* Category Filter */}
      <ServiceCategoryFilter
        categories={categories}
        selectedCategoryIds={selectedCategoryIds}
        onCategoryToggle={handleCategoryToggle}
        onClearFilters={handleClearFilters}
      />

      {/* Search Input */}
      <div className="p-3 border-b">
        <SearchInput
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search services... (Use arrow keys to navigate)"
          suggestions={suggestions}
        />
        
        {/* Keyboard Navigation Hint */}
        <div className="mt-2 flex items-center gap-2 text-xs text-gray-500">
          <Keyboard className="h-3 w-3" />
          <span>Use ↑↓ to navigate, ←→ to switch columns, Enter to select</span>
        </div>

        {/* Search Stats */}
        {searchStats && (
          <div className="mt-2 text-xs text-gray-600">
            Found {searchStats.jobs} services in {searchStats.categories} categories
            {searchStats.highRelevanceJobs > 0 && (
              <span className="ml-2 text-blue-600">
                ({searchStats.highRelevanceJobs} highly relevant)
              </span>
            )}
          </div>
        )}
      </div>

      {/* Service Selector Grid */}
      <div className="grid grid-cols-3 h-96">
        {/* Categories Column */}
        <div className="border-r">
          <div className="p-2 bg-gray-50 border-b">
            <h3 className="font-medium text-sm">Categories ({filteredCategories.length})</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {filteredCategories.map((category, index) => {
              const isActive = navigation.activeColumn === 'categories' && navigation.selectedCategoryIndex === index;
              return (
                <button
                  key={category.id}
                  data-nav={`category-${index}`}
                  className={`w-full text-left px-3 py-2 border-b hover:bg-blue-50 transition-colors ${
                    isActive ? 'bg-blue-100 border-blue-300' : ''
                  }`}
                  onClick={() => {
                    // Handle category click logic if needed
                  }}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{category.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {category.subcategories.length}
                      </span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  {category.description && (
                    <p className="text-xs text-gray-500 mt-1">{category.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Subcategories Column */}
        <div className="border-r">
          <div className="p-2 bg-gray-50 border-b">
            <h3 className="font-medium text-sm">
              Subcategories {currentCategory && `(${currentCategory.subcategories.length})`}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {currentCategory?.subcategories.map((subcategory, index) => {
              const isActive = navigation.activeColumn === 'subcategories' && navigation.selectedSubcategoryIndex === index;
              return (
                <button
                  key={subcategory.id}
                  data-nav={`subcategory-${index}`}
                  className={`w-full text-left px-3 py-2 border-b hover:bg-blue-50 transition-colors ${
                    isActive ? 'bg-blue-100 border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{subcategory.name}</span>
                    <div className="flex items-center gap-1">
                      <span className="text-xs text-gray-500">
                        {subcategory.jobs.length}
                      </span>
                      <ChevronRight className="h-3 w-3 text-gray-400" />
                    </div>
                  </div>
                  {subcategory.description && (
                    <p className="text-xs text-gray-500 mt-1">{subcategory.description}</p>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Jobs Column */}
        <div>
          <div className="p-2 bg-gray-50 border-b">
            <h3 className="font-medium text-sm">
              Services {currentSubcategory && `(${currentSubcategory.jobs.length})`}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {currentSubcategory?.jobs.map((job, index) => {
              const isActive = navigation.activeColumn === 'jobs' && navigation.selectedJobIndex === index;
              const isJobSelected = isSelected(job.id);
              
              return (
                <div
                  key={job.id}
                  data-nav={`job-${index}`}
                  className={`p-3 border-b hover:bg-blue-50 transition-colors ${
                    isActive ? 'bg-blue-100 border-blue-300' : ''
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium truncate">{job.name}</h4>
                      {job.description && (
                        <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {job.description}
                        </p>
                      )}
                      <div className="flex items-center gap-3 mt-2">
                        {job.estimatedTime && (
                          <span className="text-xs text-gray-500">
                            {job.estimatedTime} min
                          </span>
                        )}
                        {job.price && (
                          <span className="text-xs font-medium text-green-600">
                            ${job.price}
                          </span>
                        )}
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant={isJobSelected ? "secondary" : "outline"}
                      onClick={() => handleServiceSelect(job, currentCategory!.name, currentSubcategory!.name)}
                      disabled={isJobSelected}
                      className="ml-2 shrink-0"
                    >
                      {isJobSelected ? 'Added' : <Plus className="h-4 w-4" />}
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
