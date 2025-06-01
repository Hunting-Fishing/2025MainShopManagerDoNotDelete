
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Search, X, Grid3X3, List, Clock, DollarSign, ChevronRight } from 'lucide-react';
import { getCategoryColor } from '@/utils/categoryColors';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function IntegratedServiceSelector({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: IntegratedServiceSelectorProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [isCompactView, setIsCompactView] = useState(false);
  
  // Compact view state
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  // Enhanced view state
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: `selected-${Date.now()}-${service.id}`,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    const updatedServices = [...selectedServices, newService];
    onUpdateServices(updatedServices);
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    onUpdateServices(updatedServices);
    onRemoveService(serviceId);
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const toggleCategoryExpanded = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  // Filter categories and services based on search
  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0);
  }, [categories, searchTerm]);

  // Get selected category data for compact view
  const selectedCategoryData = useMemo(() => {
    if (!selectedCategory) return null;
    return categories.find(cat => cat.name === selectedCategory);
  }, [categories, selectedCategory]);

  // Get selected subcategory data for compact view
  const selectedSubcategoryData = useMemo(() => {
    if (!selectedCategoryData || !selectedSubcategory) return null;
    return selectedCategoryData.subcategories.find(sub => sub.name === selectedSubcategory);
  }, [selectedCategoryData, selectedSubcategory]);

  const CompactView = () => (
    <div className="grid grid-cols-3 gap-4 h-96">
      {/* Categories Column */}
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">Categories</CardTitle>
        </CardHeader>
        <CardContent className="p-2 overflow-y-auto">
          <div className="space-y-1">
            {filteredCategories.map((category) => {
              const colorClasses = getCategoryColor(category.name);
              const isSelected = selectedCategory === category.name;
              
              return (
                <button
                  key={category.id}
                  onClick={() => {
                    setSelectedCategory(category.name);
                    setSelectedSubcategory(null); // Reset subcategory when changing category
                  }}
                  className={`w-full p-2 rounded-md text-left text-xs transition-all ${
                    isSelected
                      ? `${colorClasses} font-medium shadow-sm`
                      : 'hover:bg-slate-50 text-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{category.name}</span>
                    <ChevronRight className="h-3 w-3" />
                  </div>
                  <div className="text-xs opacity-75 mt-1">
                    {category.subcategories.length} subcategories
                  </div>
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Subcategories Column */}
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {selectedCategory ? `${selectedCategory} - Subcategories` : 'Subcategories'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 overflow-y-auto">
          {selectedCategoryData ? (
            <div className="space-y-1">
              {selectedCategoryData.subcategories.map((subcategory) => {
                const isSelected = selectedSubcategory === subcategory.name;
                
                return (
                  <button
                    key={subcategory.id}
                    onClick={() => setSelectedSubcategory(subcategory.name)}
                    className={`w-full p-2 rounded-md text-left text-xs transition-all ${
                      isSelected
                        ? 'bg-blue-100 text-blue-800 font-medium border border-blue-300'
                        : 'hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{subcategory.name}</span>
                      <ChevronRight className="h-3 w-3" />
                    </div>
                    <div className="text-xs opacity-75 mt-1">
                      {subcategory.jobs.length} services
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              Select a category to view subcategories
            </div>
          )}
        </CardContent>
      </Card>

      {/* Services Column */}
      <Card className="h-full">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium">
            {selectedSubcategory ? `${selectedSubcategory} - Services` : 'Services'}
          </CardTitle>
        </CardHeader>
        <CardContent className="p-2 overflow-y-auto">
          {selectedSubcategoryData ? (
            <div className="space-y-2">
              {selectedSubcategoryData.jobs.map((job) => {
                const isSelected = selectedServices.some(s => s.serviceId === job.id);
                
                return (
                  <div
                    key={job.id}
                    className={`p-2 rounded-md border text-xs transition-all ${
                      isSelected
                        ? 'bg-green-50 border-green-200 text-green-800'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-slate-900 truncate">
                          {job.name}
                        </div>
                        {job.description && (
                          <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                            {job.description}
                          </div>
                        )}
                        <div className="flex items-center gap-2 mt-2">
                          {job.estimatedTime && (
                            <div className="flex items-center gap-1 text-xs text-slate-600">
                              <Clock className="h-3 w-3" />
                              {formatEstimatedTime(job.estimatedTime)}
                            </div>
                          )}
                          {job.price && (
                            <div className="flex items-center gap-1 text-xs text-green-600">
                              <DollarSign className="h-3 w-3" />
                              {formatPrice(job.price)}
                            </div>
                          )}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant={isSelected ? "secondary" : "default"}
                        onClick={() => {
                          if (isSelected) {
                            const selectedService = selectedServices.find(s => s.serviceId === job.id);
                            if (selectedService) {
                              handleRemoveService(selectedService.id);
                            }
                          } else {
                            handleServiceSelect(job, selectedCategory!, selectedSubcategory!);
                          }
                        }}
                        className="ml-2 h-6 px-2 text-xs"
                        disabled={!selectedCategory || !selectedSubcategory}
                      >
                        {isSelected ? 'Remove' : 'Add'}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-xs text-slate-400">
              {selectedCategory ? 'Select a subcategory to view services' : 'Select a category and subcategory'}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const EnhancedView = () => (
    <div className="space-y-4">
      {filteredCategories.map((category) => {
        const colorClasses = getCategoryColor(category.name);
        const isExpanded = expandedCategories.has(category.id);

        return (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader 
              className={`${colorClasses} cursor-pointer transition-all hover:opacity-90`}
              onClick={() => toggleCategoryExpanded(category.id)}
            >
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className="bg-white/20 text-inherit">
                    {category.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)} services
                  </Badge>
                  <ChevronRight className={`h-5 w-5 transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </div>
              </div>
              {category.description && (
                <p className="text-sm opacity-90 mt-1">{category.description}</p>
              )}
            </CardHeader>

            {isExpanded && (
              <CardContent className="p-4">
                <div className="space-y-4">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="border rounded-lg p-3 bg-slate-50">
                      <h4 className="font-medium text-slate-900 mb-3">{subcategory.name}</h4>
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2">
                        {subcategory.jobs.map((job) => {
                          const isSelected = selectedServices.some(s => s.serviceId === job.id);
                          
                          return (
                            <div
                              key={job.id}
                              className={`p-3 rounded-md border transition-all ${
                                isSelected
                                  ? 'bg-green-50 border-green-200 text-green-800'
                                  : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                              }`}
                            >
                              <div className="flex items-start justify-between">
                                <div className="flex-1 min-w-0">
                                  <div className="font-medium text-slate-900 text-sm truncate">
                                    {job.name}
                                  </div>
                                  {job.description && (
                                    <div className="text-xs text-slate-500 mt-1 line-clamp-2">
                                      {job.description}
                                    </div>
                                  )}
                                  <div className="flex items-center gap-2 mt-2">
                                    {job.estimatedTime && (
                                      <div className="flex items-center gap-1 text-xs text-slate-600">
                                        <Clock className="h-3 w-3" />
                                        {formatEstimatedTime(job.estimatedTime)}
                                      </div>
                                    )}
                                    {job.price && (
                                      <div className="flex items-center gap-1 text-xs text-green-600">
                                        <DollarSign className="h-3 w-3" />
                                        {formatPrice(job.price)}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                <Button
                                  size="sm"
                                  variant={isSelected ? "secondary" : "default"}
                                  onClick={() => {
                                    if (isSelected) {
                                      const selectedService = selectedServices.find(s => s.serviceId === job.id);
                                      if (selectedService) {
                                        handleRemoveService(selectedService.id);
                                      }
                                    } else {
                                      handleServiceSelect(job, category.name, subcategory.name);
                                    }
                                  }}
                                  className="ml-2 h-6 px-2 text-xs"
                                >
                                  {isSelected ? 'Remove' : 'Add'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        );
      })}
    </div>
  );

  return (
    <div className="space-y-4">
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
          <Input
            placeholder="Search services..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <button
              onClick={clearSearch}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={isCompactView ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCompactView(true)}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Compact
          </Button>
          <Button
            variant={!isCompactView ? "default" : "outline"}
            size="sm"
            onClick={() => setIsCompactView(false)}
            className="flex items-center gap-2"
          >
            <Grid3X3 className="h-4 w-4" />
            Enhanced
          </Button>
        </div>
      </div>

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="bg-blue-50 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <h4 className="text-sm font-medium text-blue-900">Selected Services</h4>
              <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                {selectedServices.length} selected
              </Badge>
            </div>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge
                  key={service.id}
                  variant="secondary"
                  className={`${getCategoryColor(service.categoryName)} cursor-pointer hover:opacity-80`}
                  onClick={() => handleRemoveService(service.id)}
                >
                  {service.name}
                  <X className="h-3 w-3 ml-1" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Search Results Info */}
      {searchTerm && (
        <div className="text-sm text-slate-600">
          Found {filteredCategories.reduce((acc, cat) => 
            acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0
          )} services matching "{searchTerm}"
        </div>
      )}

      {/* Main Content */}
      {isCompactView ? <CompactView /> : <EnhancedView />}

      {/* Empty State */}
      {filteredCategories.length === 0 && (
        <Card className="p-8 text-center">
          <div className="text-slate-400">
            {searchTerm ? (
              <>
                <Search className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>No services found matching "{searchTerm}"</p>
                <Button variant="outline" size="sm" onClick={clearSearch} className="mt-2">
                  Clear search
                </Button>
              </>
            ) : (
              <>
                <p>No services available</p>
                <p className="text-sm mt-1">Contact your administrator to set up services</p>
              </>
            )}
          </div>
        </Card>
      )}
    </div>
  );
}
