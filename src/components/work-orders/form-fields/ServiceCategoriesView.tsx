
import React, { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Clock, DollarSign, Search, Plus } from 'lucide-react';

interface ServiceCategoriesViewProps {
  categories: ServiceMainCategory[];
  selectedServices?: SelectedService[];
  onServiceSelect?: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService?: (serviceId: string) => void;
  showSelectionMode?: boolean;
}

export const ServiceCategoriesView: React.FC<ServiceCategoriesViewProps> = ({
  categories,
  selectedServices = [],
  onServiceSelect,
  onRemoveService,
  showSelectionMode = false
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());

  const filteredCategories = useMemo(() => {
    if (!searchTerm) return categories;
    
    return categories.filter(category =>
      category.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      category.subcategories.some(sub =>
        sub.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        sub.jobs.some(job =>
          job.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      )
    );
  }, [categories, searchTerm]);

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  const handleServiceClick = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (showSelectionMode && onServiceSelect) {
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  const handleServiceRemove = (serviceId: string) => {
    if (onRemoveService) {
      onRemoveService(serviceId);
    }
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

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Search className="h-4 w-4 text-gray-400" />
        <Input
          placeholder="Search services..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="flex-1"
        />
      </div>

      <div className="space-y-3">
        {filteredCategories.map((category) => (
          <Card key={category.id} className="overflow-hidden">
            <CardHeader 
              className="cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => toggleCategory(category.id)}
            >
              <CardTitle className="flex items-center justify-between">
                <span>{category.name}</span>
                <Badge variant="outline">
                  {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                </Badge>
              </CardTitle>
            </CardHeader>

            {expandedCategories.has(category.id) && (
              <CardContent className="pt-0">
                <div className="space-y-4">
                  {category.subcategories.map((subcategory) => (
                    <div key={subcategory.id} className="border-l-2 border-gray-200 pl-4">
                      <h4 className="font-medium text-sm text-gray-700 mb-2">
                        {subcategory.name}
                      </h4>
                      <div className="space-y-2">
                        {subcategory.jobs.map((job) => (
                          <div
                            key={job.id}
                            className={`p-3 rounded-lg border transition-colors ${
                              isServiceSelected(job.id)
                                ? 'bg-blue-50 border-blue-200'
                                : 'hover:bg-gray-50 border-gray-200'
                            } ${showSelectionMode ? 'cursor-pointer' : ''}`}
                            onClick={() => handleServiceClick(job, category.name, subcategory.name)}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className="font-medium">{job.name}</span>
                                  {isServiceSelected(job.id) && (
                                    <Badge variant="default" className="text-xs">
                                      Selected
                                    </Badge>
                                  )}
                                </div>
                                {job.description && (
                                  <p className="text-sm text-gray-600 mt-1">
                                    {job.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-4 mt-2">
                                  {job.estimatedTime && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <Clock className="h-3 w-3" />
                                      {job.estimatedTime}m
                                    </div>
                                  )}
                                  {job.price && (
                                    <div className="flex items-center gap-1 text-sm text-gray-500">
                                      <DollarSign className="h-3 w-3" />
                                      ${job.price}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {showSelectionMode && (
                                <div className="flex items-center gap-2">
                                  {isServiceSelected(job.id) ? (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleServiceRemove(job.id);
                                      }}
                                    >
                                      Remove
                                    </Button>
                                  ) : (
                                    <Button
                                      variant="outline"
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        handleServiceClick(job, category.name, subcategory.name);
                                      }}
                                    >
                                      <Plus className="h-3 w-3 mr-1" />
                                      Add
                                    </Button>
                                  )}
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        ))}
      </div>
    </div>
  );
};
