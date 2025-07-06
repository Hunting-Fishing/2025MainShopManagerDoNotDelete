import React, { useState, useMemo } from 'react';
import { Search, X, Clock, DollarSign, Plus } from 'lucide-react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useServiceSearch } from '@/hooks/useServiceSearch';
import { AddCategoryDialog } from './AddCategoryDialog';
import { AddSubcategoryDialog } from './AddSubcategoryDialog';
import { AddServiceDialog } from './AddServiceDialog';

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
  onDataRefresh?: () => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices,
  onDataRefresh
}) => {
  const [selectedSector, setSelectedSector] = useState<ServiceSector | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  
  // Dialog states
  const [showAddCategoryDialog, setShowAddCategoryDialog] = useState(false);
  const [showAddSubcategoryDialog, setShowAddSubcategoryDialog] = useState(false);
  const [showAddServiceDialog, setShowAddServiceDialog] = useState(false);

  // Convert sectors to categories for the search hook
  const allCategories = useMemo(() => {
    return sectors.flatMap(sector => sector.categories);
  }, [sectors]);

  const {
    searchQuery,
    setSearchQuery,
    filteredCategories,
    searchStats,
    suggestions,
    isSearching
  } = useServiceSearch(allCategories);

  // Get all matching services for quick search results
  const quickSearchResults = useMemo(() => {
    if (!isSearching) return [];
    
    const results: Array<{
      service: ServiceJob;
      categoryName: string;
      subcategoryName: string;
      sectorName: string;
    }> = [];

    filteredCategories.forEach(category => {
      category.subcategories.forEach(subcategory => {
        subcategory.jobs.forEach(service => {
          // Find the sector this category belongs to
          const sector = sectors.find(s => s.categories.some(c => c.id === category.id));
          if (sector) {
            results.push({
              service,
              categoryName: category.name,
              subcategoryName: subcategory.name,
              sectorName: sector.name
            });
          }
        });
      });
    });

    return results.slice(0, 20); // Limit to 20 results for performance
  }, [filteredCategories, sectors, isSearching]);

  const filteredSectors = useMemo(() => {
    if (!isSearching) return sectors;

    return sectors.map(sector => ({
      ...sector,
      categories: sector.categories.filter(category => 
        filteredCategories.some(fc => fc.id === category.id)
      ).map(category => {
        const filteredCategory = filteredCategories.find(fc => fc.id === category.id);
        return filteredCategory || category;
      })
    })).filter(sector => sector.categories.length > 0);
  }, [sectors, filteredCategories, isSearching]);

  const handleSectorClick = (sector: ServiceSector) => {
    setSelectedSector(sector);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategoryClick = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategoryClick = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceClick = (service: ServiceJob, categoryName?: string, subcategoryName?: string) => {
    if (categoryName && subcategoryName) {
      // Quick search selection
      onServiceSelect(service, categoryName, subcategoryName);
    } else if (selectedCategory && selectedSubcategory) {
      // Traditional hierarchy selection
      onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
    }
  };

  const clearSearch = () => {
    setSearchQuery('');
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId || s.id === serviceId);
  };

  const handleDataRefresh = () => {
    if (onDataRefresh) {
      onDataRefresh();
    }
  };

  return (
    <div className="bg-white border rounded-lg shadow-sm">
      {/* Search Bar */}
      <div className="p-4 border-b bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <input
            type="text"
            placeholder="Search services (e.g., control arm, brake pad, oil change)..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-10 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
          {searchQuery && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
        
        {/* Search Statistics */}
        {searchStats && (
          <div className="px-4 py-2 bg-blue-50 border-b text-sm text-blue-700">
            Found {searchStats.jobs} services in {searchStats.categories} categories
            {searchStats.highRelevanceJobs > 0 && (
              <span className="ml-2 font-medium">({searchStats.highRelevanceJobs} highly relevant)</span>
            )}
          </div>
        )}
      </div>

      {/* Quick Search Results */}
      {isSearching && quickSearchResults.length > 0 && (
        <div className="border-t bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium text-gray-700">Search Results</h3>
          </div>
          <div className="max-h-96 overflow-y-auto">
            {quickSearchResults.map((result, index) => (
              <button
                key={`${result.service.id}-${index}`}
                onClick={() => handleServiceClick(result.service, result.categoryName, result.subcategoryName)}
                disabled={isServiceSelected(result.service.id)}
                className={`w-full text-left p-4 border-b hover:bg-gray-50 transition-colors ${
                  isServiceSelected(result.service.id) 
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed' 
                    : 'text-gray-800'
                }`}
              >
                <div className="flex items-center justify-between mb-2">
                  <div className="font-medium text-lg">{result.service.name}</div>
                  {isServiceSelected(result.service.id) && (
                    <Badge variant="secondary" className="text-xs">Selected</Badge>
                  )}
                </div>
                
                <div className="text-sm text-gray-600 mb-2">
                  {result.sectorName} → {result.categoryName} → {result.subcategoryName}
                </div>
                
                {result.service.description && (
                  <div className="text-sm text-gray-600 mb-3 line-clamp-2">
                    {result.service.description}
                  </div>
                )}
                
                <div className="flex items-center gap-3">
                  {result.service.estimatedTime && (
                    <div className="flex items-center gap-1 text-xs text-gray-500">
                      <Clock className="h-3 w-3" />
                      {result.service.estimatedTime} min
                    </div>
                  )}
                  {result.service.price && (
                    <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                      <DollarSign className="h-3 w-3" />
                      {result.service.price}
                    </div>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Traditional Service Selection Interface */}
      {!isSearching && (
      <div className="flex h-96">
        {/* Sectors Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-slate-50 to-slate-100">
          <div className="p-3 border-b bg-gradient-to-r from-slate-100 to-slate-200">
            <h3 className="font-medium text-slate-700">Sectors</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-slate-100 scrollbar-thumb-slate-300 hover:scrollbar-thumb-slate-400">
            {filteredSectors.map((sector) => (
              <button
                key={sector.id}
                onClick={() => handleSectorClick(sector)}
                className={`w-full text-left p-3 hover:bg-slate-200 transition-colors border-b border-slate-200 ${
                  selectedSector?.id === sector.id 
                    ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-l-4 border-l-blue-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-slate-800">{sector.name}</div>
                <div className="text-xs text-slate-600 mt-1">
                  {sector.categories.length} categories
                </div>
              </button>
            ))}
          </div>
          
          {/* Add Category Button */}
          {selectedSector && (
            <div className="p-2 border-t border-slate-200">
              <Button
                onClick={() => setShowAddCategoryDialog(true)}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-slate-600 hover:text-slate-800 hover:bg-slate-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Category
              </Button>
            </div>
          )}
        </div>

        {/* Categories Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-emerald-50 to-teal-100">
          <div className="p-3 border-b bg-gradient-to-r from-emerald-100 to-teal-200">
            <h3 className="font-medium text-emerald-700">Categories</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-emerald-100 scrollbar-thumb-emerald-300 hover:scrollbar-thumb-emerald-400">
            {selectedSector?.categories.map((category) => (
              <button
                key={category.id}
                onClick={() => handleCategoryClick(category)}
                className={`w-full text-left p-3 hover:bg-emerald-200 transition-colors border-b border-emerald-200 ${
                  selectedCategory?.id === category.id 
                    ? 'bg-gradient-to-r from-emerald-100 to-teal-100 border-l-4 border-l-emerald-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-emerald-800">{category.name}</div>
                <div className="text-xs text-emerald-600 mt-1">
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
          
          {/* Add Subcategory Button */}
          {selectedCategory && (
            <div className="p-2 border-t border-emerald-200">
              <Button
                onClick={() => setShowAddSubcategoryDialog(true)}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-emerald-600 hover:text-emerald-800 hover:bg-emerald-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Subcategory
              </Button>
            </div>
          )}
        </div>

        {/* Subcategories Column */}
        <div className="w-1/4 border-r bg-gradient-to-b from-amber-50 to-orange-100">
          <div className="p-3 border-b bg-gradient-to-r from-amber-100 to-orange-200">
            <h3 className="font-medium text-amber-700">Subcategories</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-amber-100 scrollbar-thumb-amber-300 hover:scrollbar-thumb-amber-400">
            {selectedCategory?.subcategories.map((subcategory) => (
              <button
                key={subcategory.id}
                onClick={() => handleSubcategoryClick(subcategory)}
                className={`w-full text-left p-3 hover:bg-amber-200 transition-colors border-b border-amber-200 ${
                  selectedSubcategory?.id === subcategory.id 
                    ? 'bg-gradient-to-r from-amber-100 to-orange-100 border-l-4 border-l-amber-500' 
                    : ''
                }`}
              >
                <div className="font-medium text-amber-800">{subcategory.name}</div>
                <div className="text-xs text-amber-600 mt-1">
                  {subcategory.jobs.length} services
                </div>
              </button>
            ))}
          </div>
          
          {/* Add Service Button for Subcategory */}
          {selectedSubcategory && (
            <div className="p-2 border-t border-amber-200">
              <Button
                onClick={() => setShowAddServiceDialog(true)}
                variant="ghost"
                size="sm"
                className="w-full justify-start text-amber-600 hover:text-amber-800 hover:bg-amber-100"
              >
                <Plus className="mr-2 h-4 w-4" />
                Add New Service
              </Button>
            </div>
          )}
        </div>

        {/* Services Column */}
        <div className="w-1/4 bg-gradient-to-b from-purple-50 to-violet-100">
          <div className="p-3 border-b bg-gradient-to-r from-purple-100 to-violet-200">
            <h3 className="font-medium text-purple-700">Services</h3>
          </div>
          <div className="max-h-64 overflow-y-auto scrollbar-thin scrollbar-track-purple-100 scrollbar-thumb-purple-300 hover:scrollbar-thumb-purple-400">
            {selectedSubcategory?.jobs.map((service) => (
              <button
                key={service.id}
                onClick={() => handleServiceClick(service)}
                disabled={isServiceSelected(service.id)}
                className={`w-full text-left p-3 transition-colors border-b border-purple-200 ${
                  isServiceSelected(service.id)
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'hover:bg-purple-200 text-purple-800'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="font-medium">{service.name}</div>
                  {isServiceSelected(service.id) && (
                    <Badge variant="secondary" className="text-xs">
                      Selected
                    </Badge>
                  )}
                </div>
                {service.description && (
                  <div className="text-xs text-purple-600 mt-1 line-clamp-2">
                    {service.description}
                  </div>
                )}
                <div className="flex items-center gap-2 mt-2">
                  {service.estimatedTime && (
                    <Badge variant="outline" className="text-xs text-purple-600 border-purple-300">
                      {service.estimatedTime} min
                    </Badge>
                  )}
                  {service.price && (
                    <Badge variant="success" className="text-xs">
                      ${service.price}
                    </Badge>
                  )}
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
      )}

      {/* Dialog Components */}
      {selectedSector && (
        <AddCategoryDialog
          open={showAddCategoryDialog}
          onOpenChange={setShowAddCategoryDialog}
          sectorId={selectedSector.id}
          onSuccess={handleDataRefresh}
        />
      )}
      
      {selectedCategory && (
        <AddSubcategoryDialog
          open={showAddSubcategoryDialog}
          onOpenChange={setShowAddSubcategoryDialog}
          categoryId={selectedCategory.id}
          categoryName={selectedCategory.name}
          onSuccess={handleDataRefresh}
        />
      )}
      
      {selectedSubcategory && selectedCategory && (
        <AddServiceDialog
          open={showAddServiceDialog}
          onOpenChange={setShowAddServiceDialog}
          subcategoryId={selectedSubcategory.id}
          subcategoryName={selectedSubcategory.name}
          categoryName={selectedCategory.name}
          onSuccess={handleDataRefresh}
        />
      )}

      {/* No Search Results Message */}
      {isSearching && quickSearchResults.length === 0 && (
        <div className="p-8 text-center text-gray-500">
          <div className="text-lg font-medium mb-2">No services found for "{searchQuery}"</div>
          <div className="text-sm mb-4">Try adjusting your search terms or check these suggestions:</div>
          {suggestions.length > 0 && (
            <div className="flex flex-wrap gap-2 justify-center">
              {suggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => setSearchQuery(suggestion)}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm hover:bg-blue-200 transition-colors"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
