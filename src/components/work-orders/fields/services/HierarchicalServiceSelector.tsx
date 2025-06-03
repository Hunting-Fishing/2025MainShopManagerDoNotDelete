
import React from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { useKeyboardNavigation } from '@/hooks/useKeyboardNavigation';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { SearchInput } from './SearchInput';
import { ServiceCategoryFilter } from './ServiceCategoryFilter';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Clock, DollarSign } from 'lucide-react';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

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
  const [selectedCategoryIds, setSelectedCategoryIds] = React.useState<string[]>([]);

  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(categories);

  const {
    navigation,
    setNavigation,
    currentCategory,
    currentSubcategory,
    currentJob
  } = useKeyboardNavigation(filteredCategories, onServiceSelect);

  // Handle category selection
  const handleCategorySelect = (categoryIndex: number) => {
    setNavigation(prev => ({
      ...prev,
      selectedCategoryIndex: categoryIndex,
      selectedSubcategoryIndex: 0,
      selectedJobIndex: 0,
      activeColumn: 'subcategories'
    }));
  };

  // Handle subcategory selection
  const handleSubcategorySelect = (subcategoryIndex: number) => {
    setNavigation(prev => ({
      ...prev,
      selectedSubcategoryIndex: subcategoryIndex,
      selectedJobIndex: 0,
      activeColumn: 'jobs'
    }));
  };

  // Handle job selection
  const handleJobSelect = (job: ServiceJob) => {
    if (currentCategory && currentSubcategory) {
      onServiceSelect(job, currentCategory.name, currentSubcategory.name);
    }
  };

  // Filter category toggle
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

  // Apply category filters
  const displayCategories = selectedCategoryIds.length > 0 
    ? filteredCategories.filter(cat => selectedCategoryIds.includes(cat.id))
    : filteredCategories;

  return (
    <div className="space-y-4">
      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search for services (try 'brake line', 'oil change', etc.)"
        suggestions={suggestions}
        onSuggestionSelect={setSearchQuery}
      />

      {/* Search Stats */}
      {searchStats && (
        <div className="flex items-center gap-4 text-xs text-gray-600 bg-blue-50 p-2 rounded">
          <span>Found: {searchStats.categories} categories</span>
          <span>•</span>
          <span>{searchStats.subcategories} subcategories</span>
          <span>•</span>
          <span>{searchStats.jobs} services</span>
          {searchStats.highRelevanceJobs > 0 && (
            <>
              <span>•</span>
              <span className="text-blue-600 font-medium">
                {searchStats.highRelevanceJobs} high matches
              </span>
            </>
          )}
        </div>
      )}

      {/* Category Filters */}
      {!isSearching && (
        <ServiceCategoryFilter
          categories={categories}
          selectedCategoryIds={selectedCategoryIds}
          onCategoryToggle={handleCategoryToggle}
          onClearFilters={handleClearFilters}
        />
      )}

      {/* Service Browser */}
      <div className="border rounded-lg overflow-hidden bg-white">
        <ResponsiveGrid cols={{ default: 1, md: 3 }} gap="none" className="min-h-[400px]">
          {/* Categories Column */}
          <div className="border-r">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm">Categories</h3>
              <p className="text-xs text-gray-500">{displayCategories.length} available</p>
            </div>
            <div className="overflow-y-auto max-h-[350px]">
              {displayCategories.map((category, index) => (
                <button
                  key={category.id}
                  data-nav={`category-${index}`}
                  onClick={() => handleCategorySelect(index)}
                  className={`w-full text-left px-3 py-2 border-b transition-colors ${
                    navigation.selectedCategoryIndex === index && navigation.activeColumn === 'categories'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : navigation.selectedCategoryIndex === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{category.name}</div>
                  {category.description && (
                    <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {category.subcategories.length} subcategories
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Subcategories Column */}
          <div className="border-r">
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm">Subcategories</h3>
              {currentCategory && (
                <p className="text-xs text-gray-500">{currentCategory.subcategories.length} in {currentCategory.name}</p>
              )}
            </div>
            <div className="overflow-y-auto max-h-[350px]">
              {currentCategory?.subcategories.map((subcategory, index) => (
                <button
                  key={subcategory.id}
                  data-nav={`subcategory-${index}`}
                  onClick={() => handleSubcategorySelect(index)}
                  className={`w-full text-left px-3 py-2 border-b transition-colors ${
                    navigation.selectedSubcategoryIndex === index && navigation.activeColumn === 'subcategories'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : navigation.selectedSubcategoryIndex === index
                      ? 'bg-blue-50 text-blue-700'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="font-medium text-sm">{subcategory.name}</div>
                  {subcategory.description && (
                    <div className="text-xs text-gray-500 mt-1">{subcategory.description}</div>
                  )}
                  <div className="text-xs text-gray-400 mt-1">
                    {subcategory.jobs.length} services
                  </div>
                </button>
              )) || (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a category to view subcategories
                </div>
              )}
            </div>
          </div>

          {/* Services Column */}
          <div>
            <div className="p-3 border-b bg-gray-50">
              <h3 className="font-medium text-sm">Services</h3>
              {currentSubcategory && (
                <p className="text-xs text-gray-500">{currentSubcategory.jobs.length} in {currentSubcategory.name}</p>
              )}
            </div>
            <div className="overflow-y-auto max-h-[350px]">
              {currentSubcategory?.jobs.map((job, index) => (
                <button
                  key={job.id}
                  data-nav={`job-${index}`}
                  onClick={() => handleJobSelect(job)}
                  className={`w-full text-left px-3 py-3 border-b transition-colors hover:bg-gray-50 ${
                    navigation.selectedJobIndex === index && navigation.activeColumn === 'jobs'
                      ? 'bg-blue-100 text-blue-800 border-blue-200'
                      : ''
                  }`}
                >
                  <div className="font-medium text-sm mb-1">{job.name}</div>
                  {job.description && (
                    <div className="text-xs text-gray-600 mb-2">{job.description}</div>
                  )}
                  <div className="flex items-center gap-3 text-xs text-gray-500">
                    {job.estimatedTime && (
                      <div className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatEstimatedTime(job.estimatedTime)}
                      </div>
                    )}
                    {job.price && (
                      <div className="flex items-center gap-1">
                        <DollarSign className="h-3 w-3" />
                        {formatPrice(job.price)}
                      </div>
                    )}
                  </div>
                </button>
              )) || (
                <div className="p-4 text-center text-gray-500 text-sm">
                  Select a subcategory to view services
                </div>
              )}
            </div>
          </div>
        </ResponsiveGrid>
      </div>

      {/* Keyboard Navigation Hint */}
      <div className="text-xs text-gray-500 bg-gray-50 p-2 rounded">
        <strong>Tip:</strong> Use arrow keys to navigate, Enter to select, or click with mouse
      </div>
    </div>
  );
}
