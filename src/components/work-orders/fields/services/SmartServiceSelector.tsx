
import React, { useState, useMemo, useCallback } from 'react';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ChevronRight, RotateCcw, Zap, Clock, DollarSign, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

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
  const [selectedSectorId, setSelectedSectorId] = useState<string | null>(null);
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [isSearching, setIsSearching] = useState(false);

  // Get current selections for breadcrumb display
  const selectedSector = useMemo(() => 
    sectors.find(s => s.id === selectedSectorId), [sectors, selectedSectorId]
  );
  const selectedCategory = useMemo(() => 
    selectedSector?.categories.find(c => c.id === selectedCategoryId), [selectedSector, selectedCategoryId]
  );
  const selectedSubcategory = useMemo(() => 
    selectedCategory?.subcategories.find(s => s.id === selectedSubcategoryId), [selectedCategory, selectedSubcategoryId]
  );

  // Search functionality
  const searchResults = useMemo(() => {
    if (!searchTerm.trim()) return [];
    
    const results: Array<{
      sector: ServiceSector;
      category: ServiceMainCategory;
      subcategory: ServiceSubcategory;
      service: ServiceJob;
    }> = [];

    sectors.forEach(sector => {
      sector.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(service => {
            const searchLower = searchTerm.toLowerCase();
            if (
              service.name.toLowerCase().includes(searchLower) ||
              service.description?.toLowerCase().includes(searchLower) ||
              category.name.toLowerCase().includes(searchLower) ||
              subcategory.name.toLowerCase().includes(searchLower)
            ) {
              results.push({ sector, category, subcategory, service });
            }
          });
        });
      });
    });

    return results.slice(0, 20); // Limit results
  }, [sectors, searchTerm]);

  // Handle search with debouncing
  const handleSearch = useCallback((value: string) => {
    setSearchTerm(value);
    setIsSearching(value.length > 0);
  }, []);

  // Navigation handlers
  const handleSectorSelect = useCallback((sectorId: string) => {
    setSelectedSectorId(sectorId);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setIsSearching(false);
    setSearchTerm('');
  }, []);

  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setSelectedSubcategoryId(null);
  }, []);

  const handleSubcategorySelect = useCallback((subcategoryId: string) => {
    setSelectedSubcategoryId(subcategoryId);
  }, []);

  const handleServiceSelect = useCallback((service: ServiceJob, categoryName: string, subcategoryName: string) => {
    onServiceSelect(service, categoryName, subcategoryName);
  }, [onServiceSelect]);

  // Reset all selections
  const handleReset = useCallback(() => {
    setSelectedSectorId(null);
    setSelectedCategoryId(null);
    setSelectedSubcategoryId(null);
    setSearchTerm('');
    setIsSearching(false);
  }, []);

  // Breadcrumb navigation
  const handleBreadcrumbClick = useCallback((level: 'sector' | 'category' | 'subcategory') => {
    switch (level) {
      case 'sector':
        setSelectedCategoryId(null);
        setSelectedSubcategoryId(null);
        break;
      case 'category':
        setSelectedSubcategoryId(null);
        break;
    }
  }, []);

  return (
    <div className="space-y-6">
      {/* Enhanced Search Header */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="h-5 w-5 text-blue-600" />
            <h3 className="text-lg font-semibold text-gray-900">Service Catalog</h3>
          </div>
          {(selectedSectorId || searchTerm) && (
            <Button
              onClick={handleReset}
              variant="outline"
              size="sm"
              className="flex items-center gap-2 hover:bg-gray-50 transition-colors"
            >
              <RotateCcw className="h-4 w-4" />
              Reset
            </Button>
          )}
        </div>

        {/* Advanced Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <Input
            type="text"
            placeholder="Search services, categories, or descriptions..."
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            className="pl-10 pr-4 py-3 text-sm border-gray-200 focus:border-blue-300 focus:ring-blue-200 transition-all duration-200"
          />
        </div>

        {/* Enhanced Breadcrumbs */}
        {!isSearching && (selectedSector || selectedCategory || selectedSubcategory) && (
          <div className="flex items-center gap-2 text-sm">
            <Button
              onClick={() => handleBreadcrumbClick('sector')}
              variant="ghost"
              size="sm"
              className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors p-1"
            >
              {selectedSector?.name || 'All Sectors'}
            </Button>
            {selectedCategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <Button
                  onClick={() => handleBreadcrumbClick('category')}
                  variant="ghost"
                  size="sm"
                  className="text-blue-600 hover:text-blue-800 hover:bg-blue-50 transition-colors p-1"
                >
                  {selectedCategory.name}
                </Button>
              </>
            )}
            {selectedSubcategory && (
              <>
                <ChevronRight className="h-4 w-4 text-gray-400" />
                <span className="text-gray-600 font-medium">{selectedSubcategory.name}</span>
              </>
            )}
          </div>
        )}
      </div>

      {/* Search Results */}
      {isSearching && searchTerm && (
        <Card className="shadow-sm border-gray-100">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-gray-700">
              Search Results ({searchResults.length} found)
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {searchResults.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <Search className="h-8 w-8 mx-auto mb-2 opacity-40" />
                <p>No services found matching "{searchTerm}"</p>
              </div>
            ) : (
              <div className="space-y-2">
                {searchResults.map((result, index) => (
                  <div
                    key={`${result.service.id}-${index}`}
                    className="group p-3 border border-gray-100 rounded-lg hover:border-blue-200 hover:bg-blue-50/50 transition-all duration-200 cursor-pointer"
                    onClick={() => handleServiceSelect(result.service, result.category.name, result.subcategory.name)}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <h4 className="font-medium text-gray-900 group-hover:text-blue-900 transition-colors">
                          {result.service.name}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {result.sector.name} › {result.category.name} › {result.subcategory.name}
                        </p>
                        {result.service.description && (
                          <p className="text-sm text-gray-500 mt-1">{result.service.description}</p>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-gray-500">
                        {result.service.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {result.service.estimatedTime}min
                          </div>
                        )}
                        {result.service.price && (
                          <div className="flex items-center gap-1 text-green-600 font-medium">
                            <DollarSign className="h-3 w-3" />
                            ${result.service.price}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Enhanced 4-Tier Selector Grid */}
      {!isSearching && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Sectors Column */}
          <Card className="shadow-sm border-gray-100 transition-shadow hover:shadow-md">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-indigo-50 border-b">
              <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Sectors
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-80 overflow-y-auto">
              <div className="space-y-1">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    type="button"
                    className={cn(
                      "w-full text-left p-3 rounded-lg text-sm font-medium transition-all duration-200",
                      "hover:bg-blue-50 hover:border-blue-200 hover:shadow-sm",
                      "focus:outline-none focus:ring-2 focus:ring-blue-200 focus:bg-blue-50",
                      selectedSectorId === sector.id
                        ? "bg-blue-100 text-blue-900 border border-blue-200 shadow-sm"
                        : "text-gray-700 border border-transparent hover:text-blue-800"
                    )}
                    onClick={() => handleSectorSelect(sector.id)}
                  >
                    <div className="flex items-center justify-between">
                      <span>{sector.name}</span>
                      {selectedSectorId === sector.id && (
                        <ChevronRight className="h-4 w-4 text-blue-600" />
                      )}
                    </div>
                    {sector.description && (
                      <p className="text-xs text-gray-500 mt-1 truncate">{sector.description}</p>
                    )}
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Categories Column */}
          <Card className={cn(
            "shadow-sm border-gray-100 transition-all duration-300",
            selectedSector ? "opacity-100 shadow-md" : "opacity-60"
          )}>
            <CardHeader className="pb-3 bg-gradient-to-r from-green-50 to-emerald-50 border-b">
              <CardTitle className="text-sm font-medium text-green-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                {selectedSector ? `${selectedSector.name} Categories` : 'Categories'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-80 overflow-y-auto">
              {selectedSector ? (
                <div className="space-y-1">
                  {selectedSector.categories.map((category) => (
                    <button
                      key={category.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-3 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-green-50 hover:border-green-200 hover:shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-green-200 focus:bg-green-50",
                        selectedCategoryId === category.id
                          ? "bg-green-100 text-green-900 border border-green-200 shadow-sm"
                          : "text-gray-700 border border-transparent hover:text-green-800"
                      )}
                      onClick={() => handleCategorySelect(category.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{category.name}</span>
                        {selectedCategoryId === category.id && (
                          <ChevronRight className="h-4 w-4 text-green-600" />
                        )}
                      </div>
                      {category.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{category.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <ArrowLeft className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a sector first</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Subcategories Column */}
          <Card className={cn(
            "shadow-sm border-gray-100 transition-all duration-300",
            selectedCategory ? "opacity-100 shadow-md" : "opacity-60"
          )}>
            <CardHeader className="pb-3 bg-gradient-to-r from-purple-50 to-violet-50 border-b">
              <CardTitle className="text-sm font-medium text-purple-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                {selectedCategory ? `${selectedCategory.name} Subcategories` : 'Subcategories'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-80 overflow-y-auto">
              {selectedCategory ? (
                <div className="space-y-1">
                  {selectedCategory.subcategories.map((subcategory) => (
                    <button
                      key={subcategory.id}
                      type="button"
                      className={cn(
                        "w-full text-left p-3 rounded-lg text-sm font-medium transition-all duration-200",
                        "hover:bg-purple-50 hover:border-purple-200 hover:shadow-sm",
                        "focus:outline-none focus:ring-2 focus:ring-purple-200 focus:bg-purple-50",
                        selectedSubcategoryId === subcategory.id
                          ? "bg-purple-100 text-purple-900 border border-purple-200 shadow-sm"
                          : "text-gray-700 border border-transparent hover:text-purple-800"
                      )}
                      onClick={() => handleSubcategorySelect(subcategory.id)}
                    >
                      <div className="flex items-center justify-between">
                        <span>{subcategory.name}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {subcategory.jobs.length}
                          </Badge>
                          {selectedSubcategoryId === subcategory.id && (
                            <ChevronRight className="h-4 w-4 text-purple-600" />
                          )}
                        </div>
                      </div>
                      {subcategory.description && (
                        <p className="text-xs text-gray-500 mt-1 truncate">{subcategory.description}</p>
                      )}
                    </button>
                  ))}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <ArrowLeft className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a category first</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Services Column */}
          <Card className={cn(
            "shadow-sm border-gray-100 transition-all duration-300",
            selectedSubcategory ? "opacity-100 shadow-md" : "opacity-60"
          )}>
            <CardHeader className="pb-3 bg-gradient-to-r from-orange-50 to-amber-50 border-b">
              <CardTitle className="text-sm font-medium text-orange-900 flex items-center gap-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
                {selectedSubcategory ? `${selectedSubcategory.name} Services` : 'Services'}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-2 max-h-80 overflow-y-auto">
              {selectedSubcategory ? (
                <div className="space-y-2">
                  {selectedSubcategory.jobs.map((service) => {
                    const isSelected = selectedServices.some(s => s.serviceId === service.id || s.id === service.id);
                    
                    return (
                      <div
                        key={service.id}
                        className={cn(
                          "group p-3 border rounded-lg transition-all duration-200 cursor-pointer",
                          "hover:border-orange-200 hover:bg-orange-50/50 hover:shadow-sm",
                          "focus-within:outline-none focus-within:ring-2 focus-within:ring-orange-200",
                          isSelected
                            ? "border-orange-300 bg-orange-100/50 shadow-sm"
                            : "border-gray-100"
                        )}
                        onClick={() => !isSelected && handleServiceSelect(
                          service, 
                          selectedCategory!.name, 
                          selectedSubcategory.name
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <h4 className={cn(
                              "font-medium text-sm transition-colors",
                              isSelected 
                                ? "text-orange-900" 
                                : "text-gray-900 group-hover:text-orange-900"
                            )}>
                              {service.name}
                            </h4>
                            {service.description && (
                              <p className="text-xs text-gray-600 mt-1 line-clamp-2">
                                {service.description}
                              </p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                              {service.estimatedTime && (
                                <div className="flex items-center gap-1 text-xs text-gray-500">
                                  <Clock className="h-3 w-3" />
                                  {service.estimatedTime}min
                                </div>
                              )}
                              {service.price && (
                                <div className="flex items-center gap-1 text-xs text-green-600 font-medium">
                                  <DollarSign className="h-3 w-3" />
                                  ${service.price}
                                </div>
                              )}
                            </div>
                          </div>
                          {isSelected && (
                            <Badge className="bg-orange-100 text-orange-800 border-orange-200">
                              Selected
                            </Badge>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="flex items-center justify-center h-32 text-gray-400">
                  <div className="text-center">
                    <ArrowLeft className="h-6 w-6 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Select a subcategory first</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}

      {/* Selection Summary */}
      {selectedServices.length > 0 && (
        <Card className="shadow-sm border-blue-100 bg-blue-50/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-blue-900 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Selected Services ({selectedServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              {selectedServices.map((service) => (
                <div key={service.id} className="flex items-center justify-between p-2 bg-white rounded border border-blue-100">
                  <div className="flex-1">
                    <div className="font-medium text-sm text-gray-900">{service.name}</div>
                    <div className="text-xs text-gray-500">
                      {service.category} › {service.subcategory}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {service.estimatedTime && (
                      <span className="text-xs text-gray-500">{service.estimatedTime} min</span>
                    )}
                    {service.price && (
                      <span className="text-xs font-medium text-green-600">${service.price}</span>
                    )}
                    <Button
                      onClick={() => onRemoveService?.(service.id)}
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1 h-auto"
                    >
                      ×
                    </Button>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Total Summary */}
            {selectedServices.some(s => s.price) && (
              <div className="flex justify-between items-center pt-2 border-t border-blue-100">
                <span className="font-medium text-sm text-gray-900">Total Estimated Cost:</span>
                <span className="font-bold text-lg text-green-600">
                  ${selectedServices.reduce((sum, service) => sum + (service.price || 0), 0).toFixed(2)}
                </span>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
};
