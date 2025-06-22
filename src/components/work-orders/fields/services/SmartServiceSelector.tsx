
import React, { useState, useMemo, useCallback } from 'react';
import { Search, X, ChevronRight, ArrowLeft, RotateCcw, Check, Star, Clock, DollarSign, Layers, Zap, Filter } from 'lucide-react';
import { ServiceSector, ServiceCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { SearchResultsPopup } from './SearchResultsPopup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

interface SearchResult {
  service: ServiceJob;
  sectorName: string;
  categoryName: string;
  subcategoryName: string;
  fullPath: string;
}

export const SmartServiceSelector: React.FC<SmartServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  const [selectedSector, setSelectedSector] = useState<ServiceSector | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearchResults, setShowSearchResults] = useState(false);

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const results: SearchResult[] = [];
    const lowerSearchTerm = searchTerm.toLowerCase();
    
    sectors.forEach(sector => {
      sector.categories?.forEach(category => {
        category.subcategories?.forEach(subcategory => {
          subcategory.services?.forEach(service => {
            const searchableText = `${service.name} ${service.description} ${sector.name} ${category.name} ${subcategory.name}`.toLowerCase();
            if (searchableText.includes(lowerSearchTerm)) {
              results.push({
                service,
                sectorName: sector.name,
                categoryName: category.name,
                subcategoryName: subcategory.name,
                fullPath: `${sector.name} › ${category.name} › ${subcategory.name}`
              });
            }
          });
        });
      });
    });
    
    return results;
  }, [searchTerm, sectors]);

  const handleSearchFocus = () => {
    if (searchTerm.trim()) {
      setShowSearchResults(true);
    }
  };

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchTerm(value);
    setShowSearchResults(value.trim().length > 0);
  };

  const handleClearSearch = () => {
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSearchResultSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
    setShowSearchResults(false);
    setSearchTerm('');
  };

  const handleReset = () => {
    setSelectedSector(null);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
    setSearchTerm('');
    setShowSearchResults(false);
  };

  const handleSectorSelect = (sector: ServiceSector) => {
    setSelectedSector(sector);
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const handleCategorySelect = (category: ServiceCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceSelect = (service: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
    }
  };

  const handleGoBack = () => {
    if (selectedSubcategory) {
      setSelectedSubcategory(null);
    } else if (selectedCategory) {
      setSelectedCategory(null);
    } else if (selectedSector) {
      setSelectedSector(null);
    }
  };

  const getBreadcrumbPath = () => {
    const path = [];
    if (selectedSector) path.push(selectedSector.name);
    if (selectedCategory) path.push(selectedCategory.name);
    if (selectedSubcategory) path.push(selectedSubcategory.name);
    return path;
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId || s.id === serviceId);
  };

  const getTotalEstimate = () => {
    return selectedServices.reduce((total, service) => total + (service.price || 0), 0);
  };

  const getTotalTime = () => {
    return selectedServices.reduce((total, service) => total + (service.estimatedTime || 0), 0);
  };

  const currentTier = selectedSubcategory ? 'services' : selectedCategory ? 'subcategories' : selectedSector ? 'categories' : 'sectors';

  return (
    <div className="min-h-[600px] bg-gradient-to-br from-slate-50 via-blue-50/30 to-indigo-50/20 rounded-xl border border-slate-200/60 shadow-sm overflow-hidden">
      {/* Enhanced Header with Gradient Background */}
      <div className="relative bg-gradient-to-r from-white via-blue-50/50 to-indigo-50/30 border-b border-slate-200/60 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 via-indigo-500/5 to-purple-500/5"></div>
        <div className="relative p-6">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
                <Layers className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-semibold bg-gradient-to-r from-slate-800 via-blue-800 to-indigo-800 bg-clip-text text-transparent">
                  Service Catalog
                </h3>
                <p className="text-sm text-slate-600 mt-1">
                  Browse and select services from our comprehensive catalog
                </p>
              </div>
            </div>
            
            {/* Quick Stats */}
            {selectedServices.length > 0 && (
              <div className="flex items-center gap-4 text-sm">
                <div className="flex items-center gap-1 text-slate-600">
                  <Check className="h-4 w-4 text-green-600" />
                  <span className="font-medium">{selectedServices.length}</span>
                  <span>selected</span>
                </div>
                <div className="flex items-center gap-1 text-slate-600">
                  <DollarSign className="h-4 w-4 text-blue-600" />
                  <span className="font-medium">${getTotalEstimate()}</span>
                </div>
              </div>
            )}
          </div>

          {/* Enhanced Search Bar */}
          <div className="relative mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input
                type="text"
                placeholder="Search services, categories, or descriptions..."
                value={searchTerm}
                onChange={handleSearchChange}
                onFocus={handleSearchFocus}
                className="pl-10 pr-10 h-11 bg-white/80 backdrop-blur-sm border-slate-200/60 focus:border-blue-300 focus:ring-blue-200/50 rounded-lg shadow-sm"
              />
              {searchTerm && (
                <button
                  onClick={handleClearSearch}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
            
            <SearchResultsPopup
              searchTerm={searchTerm}
              results={searchResults}
              isVisible={showSearchResults}
              onSelectService={handleSearchResultSelect}
              onClose={() => setShowSearchResults(false)}
              onClearSearch={handleClearSearch}
            />
          </div>

          {/* Enhanced Breadcrumb Navigation */}
          {getBreadcrumbPath().length > 0 && (
            <div className="flex items-center gap-2 mb-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleGoBack}
                className="text-slate-600 hover:text-slate-800 hover:bg-white/60 backdrop-blur-sm"
              >
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back
              </Button>
              <div className="flex items-center gap-2 text-sm text-slate-600">
                {getBreadcrumbPath().map((segment, index) => (
                  <React.Fragment key={index}>
                    {index > 0 && <ChevronRight className="h-4 w-4 text-slate-400" />}
                    <span className="font-medium px-2 py-1 bg-white/60 backdrop-blur-sm rounded border border-slate-200/60">
                      {segment}
                    </span>
                  </React.Fragment>
                ))}
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={handleReset}
                className="ml-auto text-slate-600 hover:text-slate-800 hover:bg-white/60 backdrop-blur-sm"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Enhanced Content Area */}
      <div className="p-6 space-y-4 bg-gradient-to-b from-white/50 via-slate-50/30 to-blue-50/20 min-h-[400px]">
        {/* Sectors Grid */}
        {!selectedSector && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-md">
                <Filter className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Service Sectors</h4>
              <Badge variant="outline" className="ml-auto bg-white/60 backdrop-blur-sm">
                {sectors.length} available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sectors.map((sector) => (
                <Card
                  key={sector.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white via-slate-50/50 to-blue-50/30 border-slate-200/60 hover:border-blue-300/60 backdrop-blur-sm"
                  onClick={() => handleSectorSelect(sector)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-800 group-hover:text-blue-700 transition-colors">
                          {sector.name}
                        </h5>
                        {sector.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {sector.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs bg-white/60 backdrop-blur-sm">
                            {sector.categories?.length || 0} categories
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        {selectedSector && !selectedCategory && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-green-500 to-teal-600 rounded-md">
                <Layers className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Categories in {selectedSector.name}</h4>
              <Badge variant="outline" className="ml-auto bg-white/60 backdrop-blur-sm">
                {selectedSector.categories?.length || 0} available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedSector.categories?.map((category) => (
                <Card
                  key={category.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white via-green-50/30 to-teal-50/20 border-slate-200/60 hover:border-green-300/60 backdrop-blur-sm"
                  onClick={() => handleCategorySelect(category)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-800 group-hover:text-green-700 transition-colors">
                          {category.name}
                        </h5>
                        {category.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {category.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs bg-white/60 backdrop-blur-sm">
                            {category.subcategories?.length || 0} subcategories
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-green-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Subcategories Grid */}
        {selectedCategory && !selectedSubcategory && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-md">
                <Star className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Subcategories in {selectedCategory.name}</h4>
              <Badge variant="outline" className="ml-auto bg-white/60 backdrop-blur-sm">
                {selectedCategory.subcategories?.length || 0} available
              </Badge>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {selectedCategory.subcategories?.map((subcategory) => (
                <Card
                  key={subcategory.id}
                  className="group cursor-pointer transition-all duration-300 hover:shadow-lg hover:scale-105 bg-gradient-to-br from-white via-purple-50/30 to-indigo-50/20 border-slate-200/60 hover:border-purple-300/60 backdrop-blur-sm"
                  onClick={() => handleSubcategorySelect(subcategory)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h5 className="font-semibold text-slate-800 group-hover:text-purple-700 transition-colors">
                          {subcategory.name}
                        </h5>
                        {subcategory.description && (
                          <p className="text-sm text-slate-600 mt-1 line-clamp-2">
                            {subcategory.description}
                          </p>
                        )}
                        <div className="flex items-center gap-2 mt-3">
                          <Badge variant="outline" className="text-xs bg-white/60 backdrop-blur-sm">
                            {subcategory.services?.length || 0} services
                          </Badge>
                        </div>
                      </div>
                      <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-purple-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Services Grid */}
        {selectedSubcategory && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-4">
              <div className="p-1.5 bg-gradient-to-br from-orange-500 to-red-600 rounded-md">
                <Zap className="h-4 w-4 text-white" />
              </div>
              <h4 className="text-lg font-semibold text-slate-800">Services in {selectedSubcategory.name}</h4>
              <Badge variant="outline" className="ml-auto bg-white/60 backdrop-blur-sm">
                {selectedSubcategory.services?.length || 0} available
              </Badge>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {selectedSubcategory.services?.map((service) => {
                const isSelected = isServiceSelected(service.id);
                return (
                  <Card
                    key={service.id}
                    className={`group transition-all duration-300 hover:shadow-lg ${
                      isSelected 
                        ? 'ring-2 ring-green-500 bg-gradient-to-br from-green-50 via-white to-green-50/30 border-green-300' 
                        : 'hover:scale-105 bg-gradient-to-br from-white via-orange-50/30 to-red-50/20 border-slate-200/60 hover:border-orange-300/60'
                    } backdrop-blur-sm cursor-pointer`}
                    onClick={() => !isSelected && handleServiceSelect(service)}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h5 className="font-semibold text-slate-800 group-hover:text-orange-700 transition-colors">
                              {service.name}
                            </h5>
                            {isSelected && (
                              <Badge variant="success" className="text-xs bg-green-100 text-green-800">
                                Selected
                              </Badge>
                            )}
                          </div>
                          {service.description && (
                            <p className="text-sm text-slate-600 mb-3 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 text-sm text-slate-600">
                            {service.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-4 w-4" />
                                <span>{service.estimatedTime} min</span>
                              </div>
                            )}
                            {service.price && (
                              <div className="flex items-center gap-1 text-green-600 font-medium">
                                <DollarSign className="h-4 w-4" />
                                <span>${service.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        {isSelected ? (
                          <div className="p-2 bg-green-100 rounded-full">
                            <Check className="h-4 w-4 text-green-600" />
                          </div>
                        ) : (
                          <ChevronRight className="h-5 w-5 text-slate-400 group-hover:text-orange-500 transition-colors" />
                        )}
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>
        )}

        {/* Empty State */}
        {currentTier === 'sectors' && sectors.length === 0 && (
          <div className="text-center py-12 bg-gradient-to-br from-white via-slate-50 to-blue-50/30 rounded-lg border-2 border-dashed border-slate-200/60">
            <div className="p-3 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <Layers className="h-8 w-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800 mb-2">No Services Available</h3>
            <p className="text-slate-600 max-w-md mx-auto">
              Contact your administrator to set up the service catalog and start adding services to your work orders.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
