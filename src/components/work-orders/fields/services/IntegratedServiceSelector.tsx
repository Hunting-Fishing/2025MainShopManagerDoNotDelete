import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Search, X, Plus, Clock, DollarSign, LayoutGrid, List } from 'lucide-react';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { getCategoryColor } from '@/utils/categoryColors';
import { formatEstimatedTime, formatPrice } from '@/lib/services/serviceUtils';

interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

type ViewMode = 'enhanced' | 'compact';

export const IntegratedServiceSelector: React.FC<IntegratedServiceSelectorProps> = ({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>('enhanced');

  const filteredCategories = useMemo(() => {
    if (!searchTerm.trim()) return categories;

    return categories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          job.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          subcategory.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0);
  }, [categories, searchTerm]);

  const toggleCategory = (categoryId: string) => {
    const newExpanded = new Set(expandedCategories);
    if (newExpanded.has(categoryId)) {
      newExpanded.delete(categoryId);
    } else {
      newExpanded.add(categoryId);
    }
    setExpandedCategories(newExpanded);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const isSelected = selectedServices.some(s => s.serviceId === service.id);
    
    if (isSelected) {
      onRemoveService(service.id);
    } else {
      const selectedService: SelectedService = {
        id: `${service.id}-${Date.now()}`,
        serviceId: service.id,
        name: service.name,
        description: service.description,
        categoryName,
        subcategoryName,
        estimatedTime: service.estimatedTime,
        price: service.price,
        estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
        laborRate: service.price && service.estimatedTime ? (service.price / (service.estimatedTime / 60)) : undefined
      };
      
      onUpdateServices([...selectedServices, selectedService]);
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  const clearSearch = () => {
    setSearchTerm('');
  };

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(s => s.serviceId === serviceId);
  };

  const renderCompactView = () => {
    return (
      <div className="space-y-6">
        {/* Three-column header */}
        <div className="grid grid-cols-3 gap-4 bg-gray-50 p-4 rounded-lg font-semibold text-gray-700">
          <div>Categories</div>
          <div>Subcategories</div>
          <div>Services</div>
        </div>

        {/* Three-column content */}
        <div className="grid grid-cols-3 gap-4 min-h-[400px]">
          {/* Categories Column */}
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const colorClass = getCategoryColor(category.name);
              const isExpanded = expandedCategories.has(category.id);
              const subcategoryCount = category.subcategories.length;
              
              return (
                <div
                  key={category.id}
                  className={`p-3 rounded-md cursor-pointer transition-all duration-200 border ${colorClass} ${
                    isExpanded ? 'ring-2 ring-blue-300' : ''
                  }`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="font-medium">{category.name}</div>
                  <div className="text-xs opacity-70">{subcategoryCount} subcategories</div>
                </div>
              );
            })}
          </div>

          {/* Subcategories Column */}
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              if (!isExpanded) return null;
              
              return category.subcategories.map((subcategory) => (
                <div
                  key={subcategory.id}
                  className="p-3 rounded-md bg-gray-50 border border-gray-200"
                >
                  <div className="font-medium text-gray-800">{subcategory.name}</div>
                  <div className="text-xs text-gray-600">{subcategory.jobs.length} services</div>
                </div>
              ));
            })}
          </div>

          {/* Services Column */}
          <div className="space-y-2">
            {filteredCategories.map((category) => {
              const isExpanded = expandedCategories.has(category.id);
              if (!isExpanded) return null;
              
              return category.subcategories.map((subcategory) =>
                subcategory.jobs.map((service) => {
                  const selected = isServiceSelected(service.id);
                  
                  return (
                    <div
                      key={service.id}
                      className={`p-3 rounded-md border cursor-pointer transition-all duration-200 ${
                        selected
                          ? 'bg-blue-50 border-blue-300 ring-1 ring-blue-200'
                          : 'bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm'
                      }`}
                      onClick={() => handleServiceSelect(service, category.name, subcategory.name)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="font-medium text-sm">{service.name}</div>
                        {selected && <div className="w-2 h-2 bg-blue-500 rounded-full"></div>}
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-600">
                        {service.price && (
                          <div className="flex items-center gap-1">
                            <DollarSign className="h-3 w-3" />
                            {formatPrice(service.price)}
                          </div>
                        )}
                        {service.estimatedTime && (
                          <div className="flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatEstimatedTime(service.estimatedTime)}
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderEnhancedView = () => {
    return (
      <div className="space-y-6">
        {/* Category Cards */}
        <div className="grid gap-4">
          {filteredCategories.map((category) => {
            const colorClass = getCategoryColor(category.name);
            const isExpanded = expandedCategories.has(category.id);
            
            return (
              <Card key={category.id} className="overflow-hidden transition-all duration-300 hover:shadow-lg">
                <CardHeader
                  className={`cursor-pointer transition-all duration-200 ${colorClass} border-l-4 border-l-blue-500`}
                  onClick={() => toggleCategory(category.id)}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="text-lg font-semibold">{category.name}</CardTitle>
                      <p className="text-sm opacity-80 mt-1">
                        {category.subcategories.length} subcategories • 
                        {category.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)} services
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="secondary" className="bg-white/20 text-inherit">
                        {category.subcategories.reduce((acc, sub) => acc + sub.jobs.length, 0)}
                      </Badge>
                      <div className={`transform transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}>
                        ▼
                      </div>
                    </div>
                  </div>
                </CardHeader>

                {isExpanded && (
                  <CardContent className="p-6 animate-accordion-down">
                    <div className="space-y-6">
                      {category.subcategories.map((subcategory) => (
                        <div key={subcategory.id} className="space-y-3">
                          <h4 className="font-medium text-gray-800 text-base border-b border-gray-200 pb-2">
                            {subcategory.name}
                          </h4>
                          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
                            {subcategory.jobs.map((service) => {
                              const selected = isServiceSelected(service.id);
                              
                              return (
                                <div
                                  key={service.id}
                                  className={`group relative p-4 rounded-lg border-2 cursor-pointer transition-all duration-200 hover:shadow-md ${
                                    selected
                                      ? 'border-blue-400 bg-blue-50 shadow-md'
                                      : 'border-gray-200 bg-white hover:border-gray-300'
                                  }`}
                                  onClick={() => handleServiceSelect(service, category.name, subcategory.name)}
                                >
                                  <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                      <h5 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                        {service.name}
                                      </h5>
                                      {service.description && (
                                        <p className="text-sm text-gray-600 mt-1 line-clamp-2">
                                          {service.description}
                                        </p>
                                      )}
                                    </div>
                                    {selected && (
                                      <div className="ml-2 flex-shrink-0">
                                        <div className="w-5 h-5 bg-blue-500 rounded-full flex items-center justify-center">
                                          <div className="w-2 h-2 bg-white rounded-full"></div>
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                                    <div className="flex items-center gap-3 text-sm text-gray-600">
                                      {service.price && (
                                        <div className="flex items-center gap-1">
                                          <DollarSign className="h-4 w-4" />
                                          <span className="font-medium">{formatPrice(service.price)}</span>
                                        </div>
                                      )}
                                      {service.estimatedTime && (
                                        <div className="flex items-center gap-1">
                                          <Clock className="h-4 w-4" />
                                          <span>{formatEstimatedTime(service.estimatedTime)}</span>
                                        </div>
                                      )}
                                    </div>
                                    <Button
                                      size="sm"
                                      variant={selected ? "secondary" : "outline"}
                                      className="opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                      <Plus className="h-4 w-4" />
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
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header with Search and View Toggle */}
      <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Search services, categories, or descriptions..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-10"
          />
          {searchTerm && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearSearch}
              className="absolute right-1 top-1/2 transform -translate-y-1/2 h-6 w-6 p-0 hover:bg-gray-100"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'enhanced' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('enhanced')}
            className="flex items-center gap-2"
          >
            <LayoutGrid className="h-4 w-4" />
            Enhanced
          </Button>
          <Button
            variant={viewMode === 'compact' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('compact')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            Compact
          </Button>
        </div>
      </div>

      {/* Search Results Summary */}
      {searchTerm && (
        <div className="text-sm text-gray-600 bg-blue-50 p-3 rounded-lg border border-blue-200">
          Found {filteredCategories.reduce((acc, cat) => acc + cat.subcategories.reduce((subAcc, sub) => subAcc + sub.jobs.length, 0), 0)} services
          matching "{searchTerm}"
        </div>
      )}

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg text-green-800">Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge
                  key={service.id}
                  variant="secondary"
                  className={`${getCategoryColor(service.categoryName)} cursor-pointer hover:opacity-80 transition-opacity flex items-center gap-2`}
                  onClick={() => onRemoveService(service.serviceId)}
                >
                  {service.name}
                  <X className="h-3 w-3" />
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      {filteredCategories.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="text-gray-500">
            {searchTerm ? 'No services found matching your search.' : 'No services available.'}
          </div>
          {searchTerm && (
            <Button variant="outline" onClick={clearSearch} className="mt-4">
              Clear Search
            </Button>
          )}
        </Card>
      ) : (
        viewMode === 'enhanced' ? renderEnhancedView() : renderCompactView()
      )}
    </div>
  );
};
