
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { ServiceViewModeToggle } from './ServiceViewModeToggle';
import { ServiceCompactView } from './ServiceCompactView';
import { ServiceCategoryList } from './ServiceCategoryList';
import { SearchInput } from './SearchInput';
import { ServiceDebugPanel } from './ServiceDebugPanel';
import { useServiceSearch } from '@/hooks/useServiceSearch';

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
  const [viewMode, setViewMode] = useState<'enhanced' | 'compact'>('enhanced');
  
  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    isSearching
  } = useServiceSearch(categories);

  // Enhanced debug logging
  console.log('HierarchicalServiceSelector render:', {
    viewMode,
    categoriesCount: categories.length,
    filteredCategoriesCount: filteredCategories.length,
    selectedServicesCount: selectedServices.length,
    searchQuery,
    isSearching,
    component: 'HierarchicalServiceSelector'
  });

  const handleViewModeChange = (mode: 'enhanced' | 'compact') => {
    console.log('HierarchicalServiceSelector viewMode changing:', { from: viewMode, to: mode });
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Select Services</h4>
        <ServiceViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </div>

      {/* Debug Panel */}
      <ServiceDebugPanel categories={categories} />

      {/* Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search services, categories, or descriptions..."
        className="w-full"
      />

      {/* Search Results Summary */}
      {searchStats && (
        <div className="text-xs text-gray-600 bg-blue-50 px-3 py-2 rounded-md">
          Found {searchStats.jobs} services in {searchStats.subcategories} subcategories 
          across {searchStats.categories} categories for "{searchStats.query}"
        </div>
      )}

      {/* Debug indicator to see which view is actually rendering */}
      <div className="text-xs text-gray-500 bg-yellow-100 p-1 rounded">
        Current view mode: {viewMode} | Categories: {filteredCategories.length}
        {isSearching && ` | Searching: "${searchQuery}"`}
      </div>

      {viewMode === 'enhanced' ? (
        <div>
          <div className="text-xs text-green-600 mb-2">Rendering: ServiceCategoryList (Enhanced)</div>
          <ServiceCategoryList
            categories={filteredCategories}
            selectedServices={selectedServices}
            onServiceSelect={onServiceSelect}
            onRemoveService={onRemoveService}
            onUpdateServices={onUpdateServices}
          />
        </div>
      ) : (
        <div>
          <div className="text-xs text-blue-600 mb-2">Rendering: ServiceCompactView (Compact)</div>
          <ServiceCompactView
            categories={filteredCategories}
            selectedServices={selectedServices}
            onServiceSelect={onServiceSelect}
          />
        </div>
      )}

      {/* No Results Message */}
      {isSearching && filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <p>No services found for "{searchQuery}"</p>
          <p className="text-sm mt-1">Try a different search term or clear the search</p>
        </div>
      )}
    </div>
  );
}
