
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { ServiceSector, ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { Search, Zap, Star, Award, Crown } from 'lucide-react';

interface SmartServiceSelectorProps {
  sectors: ServiceSector[];
  onSelectService: (service: ServiceJob) => void;
  selectedServices: ServiceJob[];
}

export function SmartServiceSelector({ 
  sectors, 
  onSelectService, 
  selectedServices 
}: SmartServiceSelectorProps) {
  const [selectedSector, setSelectedSector] = useState<ServiceSector | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  // Search functionality
  const filteredServices = useMemo(() => {
    if (!searchTerm) return [];
    
    const results: { service: ServiceJob; category: ServiceMainCategory; subcategory: ServiceSubcategory; sector: ServiceSector }[] = [];
    
    sectors.forEach(sector => {
      sector.categories.forEach(category => {
        category.subcategories.forEach(subcategory => {
          subcategory.jobs.forEach(service => {
            if (
              service.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
              service.description?.toLowerCase().includes(searchTerm.toLowerCase())
            ) {
              results.push({ service, category, subcategory, sector });
            }
          });
        });
      });
    });
    
    return results;
  }, [sectors, searchTerm]);

  // Get tier configuration for background styling
  const getTierConfig = (index: number, total: number) => {
    const percentage = ((index + 1) / total) * 100;
    
    if (percentage <= 25) return { tier: 'basic', icon: Zap, gradient: 'from-blue-500/20 to-indigo-500/20' };
    if (percentage <= 50) return { tier: 'premium', icon: Star, gradient: 'from-purple-500/20 to-pink-500/20' };
    if (percentage <= 75) return { tier: 'professional', icon: Award, gradient: 'from-emerald-500/20 to-teal-500/20' };
    return { tier: 'enterprise', icon: Crown, gradient: 'from-amber-500/20 to-orange-500/20' };
  };

  const resetToSector = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  const resetToCategory = () => {
    setSelectedSubcategory(null);
  };

  const isServiceSelected = (service: ServiceJob) => {
    return selectedServices.some(s => s.id === service.id);
  };

  return (
    <div className="w-full space-y-6">
      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10 bg-white/50 backdrop-blur-sm border-white/20 focus:bg-white/70 transition-all duration-300"
        />
      </div>

      {/* Search Results */}
      {searchTerm && (
        <Card className="bg-gradient-to-br from-white/80 to-gray-50/80 backdrop-blur-sm border-white/30 shadow-xl">
          <CardHeader>
            <CardTitle className="text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Search Results ({filteredServices.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
              {filteredServices.length === 0 ? (
                <p className="text-muted-foreground text-center py-4">No services found</p>
              ) : (
                filteredServices.map(({ service, category, subcategory, sector }, index) => {
                  const { gradient, icon: TierIcon } = getTierConfig(index, filteredServices.length);
                  return (
                    <div
                      key={service.id}
                      onClick={() => onSelectService(service)}
                      className={`p-4 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/30 hover:scale-[1.02] hover:shadow-lg ${
                        isServiceSelected(service) 
                          ? 'ring-2 ring-blue-500 bg-blue-50/80' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <TierIcon className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">{service.name}</h4>
                          <p className="text-sm text-gray-600 line-clamp-2 mt-1">{service.description}</p>
                          <div className="text-xs text-muted-foreground mt-2 space-y-1">
                            <div className="flex items-center gap-1">
                              <span className="font-medium">Path:</span>
                              <span>{sector.name} → {category.name} → {subcategory.name}</span>
                            </div>
                            {service.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Duration:</span>
                                <span>{service.estimatedTime} min</span>
                              </div>
                            )}
                            {service.price && (
                              <div className="flex items-center gap-1">
                                <span className="font-medium">Price:</span>
                                <span>${service.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Service Hierarchy - Only show when not searching */}
      {!searchTerm && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Sectors */}
          <Card className="bg-gradient-to-br from-white/80 to-blue-50/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                Service Sectors
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-blue-300 scrollbar-track-transparent">
                {sectors.map((sector, index) => {
                  const { gradient, icon: TierIcon } = getTierConfig(index, sectors.length);
                  return (
                    <div
                      key={sector.id}
                      onClick={() => {
                        setSelectedSector(sector);
                        resetToSector();
                      }}
                      className={`p-3 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/30 hover:scale-[1.02] hover:shadow-md ${
                        selectedSector?.id === sector.id 
                          ? 'ring-2 ring-blue-500 bg-blue-50/80' 
                          : 'hover:bg-white/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <TierIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 text-sm truncate">{sector.name}</h4>
                          <p className="text-xs text-gray-600 mt-1 line-clamp-2">{sector.description}</p>
                          <p className="text-xs text-muted-foreground mt-1">
                            {sector.categories.length} categories
                          </p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Categories */}
          <Card className="bg-gradient-to-br from-white/80 to-purple-50/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                Categories
                {selectedSector && (
                  <span className="block text-xs font-normal text-muted-foreground mt-1">
                    in {selectedSector.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-purple-300 scrollbar-track-transparent">
                {selectedSector ? (
                  selectedSector.categories.map((category, index) => {
                    const { gradient, icon: TierIcon } = getTierConfig(index, selectedSector.categories.length);
                    return (
                      <div
                        key={category.id}
                        onClick={() => {
                          setSelectedCategory(category);
                          resetToCategory();
                        }}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/30 hover:scale-[1.02] hover:shadow-md ${
                          selectedCategory?.id === category.id 
                            ? 'ring-2 ring-purple-500 bg-purple-50/80' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TierIcon className="h-4 w-4 text-purple-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{category.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{category.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {category.subcategories.length} subcategories
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Select a sector to view categories
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Subcategories */}
          <Card className="bg-gradient-to-br from-white/80 to-emerald-50/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                Subcategories
                {selectedCategory && (
                  <span className="block text-xs font-normal text-muted-foreground mt-1">
                    in {selectedCategory.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-emerald-300 scrollbar-track-transparent">
                {selectedCategory ? (
                  selectedCategory.subcategories.map((subcategory, index) => {
                    const { gradient, icon: TierIcon } = getTierConfig(index, selectedCategory.subcategories.length);
                    return (
                      <div
                        key={subcategory.id}
                        onClick={() => setSelectedSubcategory(subcategory)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/30 hover:scale-[1.02] hover:shadow-md ${
                          selectedSubcategory?.id === subcategory.id 
                            ? 'ring-2 ring-emerald-500 bg-emerald-50/80' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <TierIcon className="h-4 w-4 text-emerald-600 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{subcategory.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{subcategory.description}</p>
                            <p className="text-xs text-muted-foreground mt-1">
                              {subcategory.jobs.length} services
                            </p>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Select a category to view subcategories
                  </p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Services */}
          <Card className="bg-gradient-to-br from-white/80 to-amber-50/80 backdrop-blur-sm border-white/30 shadow-xl">
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">
                Services
                {selectedSubcategory && (
                  <span className="block text-xs font-normal text-muted-foreground mt-1">
                    in {selectedSubcategory.name}
                  </span>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="max-h-64 overflow-y-auto space-y-2 scrollbar-thin scrollbar-thumb-amber-300 scrollbar-track-transparent">
                {selectedSubcategory ? (
                  selectedSubcategory.jobs.map((service, index) => {
                    const { gradient, icon: TierIcon } = getTierConfig(index, selectedSubcategory.jobs.length);
                    return (
                      <div
                        key={service.id}
                        onClick={() => onSelectService(service)}
                        className={`p-3 rounded-lg cursor-pointer transition-all duration-300 bg-gradient-to-r ${gradient} backdrop-blur-sm border border-white/30 hover:scale-[1.02] hover:shadow-md ${
                          isServiceSelected(service) 
                            ? 'ring-2 ring-amber-500 bg-amber-50/80' 
                            : 'hover:bg-white/50'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <TierIcon className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 text-sm truncate">{service.name}</h4>
                            <p className="text-xs text-gray-600 mt-1 line-clamp-2">{service.description}</p>
                            <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                              {service.estimatedTime && (
                                <span>{service.estimatedTime} min</span>
                              )}
                              {service.price && (
                                <span className="font-medium text-amber-700">${service.price}</span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    Select a subcategory to view services
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
