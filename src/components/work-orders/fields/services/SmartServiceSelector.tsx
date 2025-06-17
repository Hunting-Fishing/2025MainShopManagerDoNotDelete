
import React, { useState, useMemo, useEffect, useRef } from 'react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { ServiceSearch } from './ServiceSearch';
import { SearchResultsPopup } from './SearchResultsPopup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ChevronRight, Check } from 'lucide-react';

interface SearchResult {
  service: ServiceJob;
  sectorName: string;
  categoryName: string;
  subcategoryName: string;
  fullPath: string;
}

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [showSearchPopup, setShowSearchPopup] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Flatten all services for search
  const allServices = useMemo(() => {
    const flattened: SearchResult[] = [];
    
    sectors.forEach(sector => {
      sector.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(service => {
            flattened.push({
              service,
              sectorName: sector.name,
              categoryName: category.name,
              subcategoryName: subcategory.name,
              fullPath: `${sector.name} › ${category.name} › ${subcategory.name}`
            });
          });
        });
      });
    });
    
    return flattened;
  }, [sectors]);

  // Search results
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const term = searchTerm.toLowerCase();
    return allServices.filter(result => 
      result.service.name.toLowerCase().includes(term) ||
      result.service.description?.toLowerCase().includes(term) ||
      result.sectorName.toLowerCase().includes(term) ||
      result.categoryName.toLowerCase().includes(term) ||
      result.subcategoryName.toLowerCase().includes(term)
    );
  }, [searchTerm, allServices]);

  // Show/hide popup based on search term
  useEffect(() => {
    setShowSearchPopup(searchTerm.trim().length > 0);
  }, [searchTerm]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && showSearchPopup) {
        setShowSearchPopup(false);
        setSearchTerm('');
      }
    };

    if (showSearchPopup) {
      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }
  }, [showSearchPopup]);

  // Click outside to close popup
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSearchPopup(false);
      }
    };

    if (showSearchPopup) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showSearchPopup]);

  const handleSectorSelect = (sectorId: string) => {
    setSelectedSectorId(sectorId);
    setSelectedCategoryId(null);
  };

  const handleCategorySelect = (categoryId: string) => {
    setSelectedCategoryId(categoryId);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
    setShowSearchPopup(false);
    setSearchTerm('');
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearchPopup(false);
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId || s.id === serviceId);
  };

  const selectedSector = sectors.find(s => s.id === selectedSectorId);
  const selectedCategory = selectedSector?.categories.find(c => c.id === selectedCategoryId);

  return (
    <div ref={containerRef} className="relative space-y-4">
      {/* Search Bar */}
      <ServiceSearch
        value={searchTerm}
        onChange={setSearchTerm}
        placeholder="Search services across all sectors..."
      />

      {/* Search Results Popup */}
      <SearchResultsPopup
        searchTerm={searchTerm}
        results={searchResults}
        isVisible={showSearchPopup}
        onSelectService={handleServiceSelect}
        onClose={() => setShowSearchPopup(false)}
        onClearSearch={handleClearSearch}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Sectors */}
        <Card className="h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">Service Sectors</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-80 overflow-y-auto px-3 pb-3">
              {sectors.map(sector => (
                <button
                  key={sector.id}
                  onClick={() => handleSectorSelect(sector.id)}
                  className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                    selectedSectorId === sector.id
                      ? 'bg-blue-100 border-2 border-blue-300 text-blue-900'
                      : 'hover:bg-gray-100 border-2 border-transparent'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-medium">{sector.name}</div>
                      {sector.description && (
                        <div className="text-xs text-gray-500 mt-1">{sector.description}</div>
                      )}
                    </div>
                    <div className="flex items-center gap-1">
                      {selectedSectorId === sector.id && (
                        <Check className="h-4 w-4 text-blue-600" />
                      )}
                      <ChevronRight className="h-4 w-4 text-gray-400" />
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Categories */}
        <Card className="h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedSector ? `${selectedSector.name} Categories` : 'Categories'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-1 max-h-80 overflow-y-auto px-3 pb-3">
              {selectedSector ? (
                selectedSector.categories.map(category => (
                  <button
                    key={category.id}
                    onClick={() => handleCategorySelect(category.id)}
                    className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                      selectedCategoryId === category.id
                        ? 'bg-blue-100 border-2 border-blue-300 text-blue-900'
                        : 'hover:bg-gray-100 border-2 border-transparent'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="font-medium">{category.name}</div>
                        {category.description && (
                          <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        {selectedCategoryId === category.id && (
                          <Check className="h-4 w-4 text-blue-600" />
                        )}
                        <ChevronRight className="h-4 w-4 text-gray-400" />
                      </div>
                    </div>
                  </button>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Select a sector to view categories</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Services */}
        <Card className="h-96">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">
              {selectedCategory ? `${selectedCategory.name} Services` : 'Services'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="space-y-2 max-h-80 overflow-y-auto px-3 pb-3">
              {selectedCategory ? (
                selectedCategory.subcategories.map(subcategory => (
                  <div key={subcategory.id} className="space-y-1">
                    <div className="text-xs font-medium text-gray-600 px-2 py-1 bg-gray-50 rounded">
                      {subcategory.name}
                    </div>
                    {subcategory.jobs.map(service => (
                      <button
                        key={service.id}
                        onClick={() => handleServiceSelect(service, selectedCategory.name, subcategory.name)}
                        disabled={isServiceSelected(service.id)}
                        className={`w-full text-left p-2 rounded-md text-sm transition-colors ${
                          isServiceSelected(service.id)
                            ? 'bg-green-50 border border-green-200 text-green-700 cursor-not-allowed'
                            : 'hover:bg-gray-100 border border-transparent'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{service.name}</div>
                            {service.description && (
                              <div className="text-xs text-gray-500 mt-1">{service.description}</div>
                            )}
                          </div>
                          <div className="ml-2 text-right">
                            {isServiceSelected(service.id) && (
                              <Badge variant="outline" className="text-xs">Selected</Badge>
                            )}
                            {service.price && (
                              <div className="text-xs font-medium text-green-600">
                                ${service.price}
                              </div>
                            )}
                            {service.estimatedTime && (
                              <div className="text-xs text-gray-500">
                                {service.estimatedTime} min
                              </div>
                            )}
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-500 py-8">
                  <p className="text-sm">Select a category to view services</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
