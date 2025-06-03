
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
    suggestions,
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
    suggestions,
    component: 'HierarchicalServiceSelector'
  });

  const handleViewModeChange = (mode: 'enhanced' | 'compact') => {
    console.log('HierarchicalServiceSelector viewMode changing:', { from: viewMode, to: mode });
    setViewMode(mode);
  };

  const handleSuggestionSelect = (suggestion: string) => {
    setSearchQuery(suggestion);
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

      {/* Enhanced Search Input */}
      <SearchInput
        value={searchQuery}
        onChange={setSearchQuery}
        placeholder="Search services... (try 'belt', 'brake pad', 'oil change')"
        className="w-full"
        suggestions={suggestions}
        onSuggestionSelect={handleSuggestionSelect}
      />

      {/* Enhanced Search Results Summary */}
      {searchStats && (
        <div className="text-xs bg-blue-50 px-3 py-2 rounded-md border border-blue-200">
          <div className="flex items-center justify-between">
            <span className="text-blue-700">
              Found <strong>{searchStats.jobs}</strong> services in <strong>{searchStats.subcategories}</strong> subcategories 
              across <strong>{searchStats.categories}</strong> categories
            </span>
            {searchStats.highRelevanceJobs > 0 && (
              <span className="text-blue-600 text-xs bg-blue-100 px-2 py-1 rounded">
                {searchStats.highRelevanceJobs} exact matches
              </span>
            )}
          </div>
          <div className="text-blue-600 mt-1">
            Searching for: "<strong>{searchStats.query}</strong>"
          </div>
        </div>
      )}

      {/* Search quality indicator */}
      {isSearching && (
        <div className="text-xs text-gray-600 bg-gray-50 px-3 py-2 rounded-md border">
          💡 Enhanced search active - finding services with "{searchQuery}" even when surrounded by other words
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

      {/* Enhanced No Results Message */}
      {isSearching && filteredCategories.length === 0 && (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border">
          <div className="space-y-2">
            <p className="font-medium">No services found for "{searchQuery}"</p>
            <div className="text-sm space-y-1">
              <p>Try these search tips:</p>
              <ul className="list-disc list-inside text-left max-w-md mx-auto space-y-1">
                <li>Use simpler terms like "belt", "brake", "oil"</li>
                <li>Try automotive keywords like "tune up", "transmission"</li>
                <li>Check spelling or try shorter keywords</li>
                <li>Search for service types like "maintenance", "repair"</li>
              </ul>
            </div>
            {suggestions.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium mb-2">Did you mean:</p>
                <div className="flex flex-wrap gap-2 justify-center">
                  {suggestions.slice(0, 3).map(suggestion => (
                    <button
                      key={suggestion}
                      onClick={() => handleSuggestionSelect(suggestion)}
                      className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
