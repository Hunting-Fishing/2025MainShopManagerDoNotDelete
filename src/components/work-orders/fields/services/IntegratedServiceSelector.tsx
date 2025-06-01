
import React, { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Search, X, Clock, DollarSign, ChevronDown, ChevronUp } from 'lucide-react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { getCategoryColor } from '@/utils/categoryColors';
import { findMatches } from '@/utils/search/relevanceUtils';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export const IntegratedServiceSelector: React.FC<IntegratedServiceSelectorProps> = ({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

  // Auto-expand first category on initial load
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.size === 0) {
      setExpandedCategories(new Set([categories[0].id]));
    }
  }, [categories]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Check if service is already selected
    const isAlreadySelected = selectedServices.some(s => s.serviceId === service.id);
    if (isAlreadySelected) return;

    const newSelectedService: SelectedService = {
      id: `selected-${Date.now()}-${service.id}`,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
      laborRate: service.price
    };

    const updatedServices = [...selectedServices, newSelectedService];
    onUpdateServices(updatedServices);
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    onUpdateServices(updatedServices);
    onRemoveService(serviceId);
  };

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const toggleSubcategory = (subcategoryId: string) => {
    const newExpanded = new Set(expandedSubcategories);
    if (newExpanded.has(subcategoryId)) {
      newExpanded.delete(subcategoryId);
    } else {
      newExpanded.add(subcategoryId);
    }
    setExpandedSubcategories(newExpanded);
  };

  // Filter services based on search query
  const filteredCategories = categories.map(category => {
    if (!searchQuery) return category;

    const filteredSubcategories = category.subcategories.map(subcategory => {
      const filteredJobs = subcategory.jobs.filter(job => 
        findMatches(job.name, searchQuery) > 0 ||
        findMatches(job.description || '', searchQuery) > 0
      );
      return { ...subcategory, jobs: filteredJobs };
    }).filter(subcategory => subcategory.jobs.length > 0);

    return { ...category, subcategories: filteredSubcategories };
  }).filter(category => category.subcategories.length > 0);

  const clearSearch = () => {
    setSearchQuery('');
  };

  const totalFilteredServices = filteredCategories.reduce((total, category) => 
    total + category.subcategories.reduce((subTotal, subcategory) => 
      subTotal + subcategory.jobs.length, 0
    ), 0
  );

  return (
    <div className="space-y-6">
      {/* Selected Services Section */}
      {selectedServices.length > 0 && (
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-semibold text-slate-900">Selected Services</h4>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800">
              {selectedServices.length} selected
            </Badge>
          </div>
          
          <div className="grid gap-2">
            {selectedServices.map((service) => (
              <Card key={service.id} className="animate-scale-in hover:shadow-md transition-all duration-200">
                <CardContent className="p-3">
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-medium text-sm text-slate-900 truncate">
                          {service.name}
                        </span>
                        <Button
                          variant="ghost"
                          size="xs"
                          onClick={() => handleRemoveService(service.id)}
                          className="text-slate-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                        >
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                      
                      <div className="flex items-center gap-2 mb-2">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${getCategoryColor(service.categoryName)}`}
                        >
                          {service.categoryName}
                        </Badge>
                        <span className="text-xs text-slate-400">→</span>
                        <Badge variant="outline" className="text-xs">
                          {service.subcategoryName}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-xs text-slate-500">
                        {service.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            <span>{formatEstimatedTime(service.estimatedTime)}</span>
                          </div>
                        )}
                        {service.price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            <span>{formatPrice(service.price)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Search Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-semibold text-slate-900">
            {selectedServices.length > 0 ? 'Add More Services' : 'Select Services'}
          </h4>
          {searchQuery && (
            <span className="text-xs text-slate-500">
              {totalFilteredServices} service{totalFilteredServices !== 1 ? 's' : ''} found
            </span>
          )}
        </div>

        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search services..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="xs"
              onClick={clearSearch}
              className="absolute right-2 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Categories Section */}
      <div className="space-y-3">
        {filteredCategories.length === 0 ? (
          <div className="text-center py-8 text-slate-500">
            <p>No services found matching "{searchQuery}"</p>
            <Button variant="ghost" size="sm" onClick={clearSearch} className="mt-2">
              Clear search
            </Button>
          </div>
        ) : (
          filteredCategories.map((category) => (
            <Card key={category.id} className="overflow-hidden hover:shadow-md transition-shadow duration-200">
              <div
                className={`p-4 cursor-pointer ${getCategoryColor(category.name)} border-l-4 hover:opacity-90 transition-opacity`}
                onClick={() => toggleCategory(category.id)}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-sm">{category.name}</h3>
                    {category.description && (
                      <p className="text-xs opacity-80 mt-1">{category.description}</p>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs">
                      {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)}
                    </Badge>
                    {expandedCategories.has(category.id) ? (
                      <ChevronUp className="h-4 w-4" />
                    ) : (
                      <ChevronDown className="h-4 w-4" />
                    )}
                  </div>
                </div>
              </div>

              {expandedCategories.has(category.id) && (
                <CardContent className="p-0 bg-slate-50">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="border-b border-slate-200 last:border-b-0">
                      <div
                        className="p-3 cursor-pointer hover:bg-white transition-colors"
                        onClick={() => toggleSubcategory(subcategory.id)}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium text-sm text-slate-800">{subcategory.name}</h4>
                            {subcategory.description && (
                              <p className="text-xs text-slate-600 mt-1">{subcategory.description}</p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="outline" className="text-xs">
                              {subcategory.jobs.length}
                            </Badge>
                            {expandedSubcategories.has(subcategory.id) ? (
                              <ChevronUp className="h-3 w-3" />
                            ) : (
                              <ChevronDown className="h-3 w-3" />
                            )}
                          </div>
                        </div>
                      </div>

                      {expandedSubcategories.has(subcategory.id) && (
                        <div className="px-6 pb-3 space-y-2">
                          {subcategory.jobs.map((job) => {
                            const isSelected = selectedServices.some(s => s.serviceId === job.id);
                            return (
                              <Card
                                key={job.id}
                                className={`cursor-pointer transition-all duration-200 hover:shadow-sm ${
                                  isSelected
                                    ? 'bg-blue-50 border-blue-200 opacity-60 cursor-not-allowed'
                                    : 'hover:bg-white hover:border-blue-200'
                                }`}
                                onClick={() => !isSelected && handleServiceSelect(job, category.name, subcategory.name)}
                              >
                                <CardContent className="p-3">
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1 min-w-0">
                                      <div className="flex items-center gap-2 mb-1">
                                        <span className="font-medium text-sm text-slate-900">
                                          {job.name}
                                        </span>
                                        {isSelected && (
                                          <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">
                                            Selected
                                          </Badge>
                                        )}
                                      </div>
                                      
                                      {job.description && (
                                        <p className="text-xs text-slate-600 mb-2 line-clamp-2">
                                          {job.description}
                                        </p>
                                      )}

                                      <div className="flex items-center gap-4 text-xs text-slate-500">
                                        {job.estimatedTime && (
                                          <div className="flex items-center gap-1">
                                            <Clock className="h-3 w-3" />
                                            <span>{formatEstimatedTime(job.estimatedTime)}</span>
                                          </div>
                                        )}
                                        {job.price && (
                                          <div className="flex items-center gap-1">
                                            <DollarSign className="h-3 w-3" />
                                            <span>{formatPrice(job.price)}</span>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  ))}
                </CardContent>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
};
