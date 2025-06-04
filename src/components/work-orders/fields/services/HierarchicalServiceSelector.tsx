
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { getCategoryColor } from '@/utils/categoryColors';
import { ChevronDown, ChevronRight, Plus } from 'lucide-react';

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
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set());
  const [expandedSubcategories, setExpandedSubcategories] = useState<Set<string>>(new Set());

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

  const isServiceSelected = (serviceId: string) => {
    return selectedServices.some(selected => selected.serviceId === serviceId);
  };

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    if (isServiceSelected(service.id)) {
      // Remove if already selected
      const serviceToRemove = selectedServices.find(s => s.serviceId === service.id);
      if (serviceToRemove) {
        onRemoveService(serviceToRemove.id);
      }
    } else {
      // Add if not selected
      onServiceSelect(service, categoryName, subcategoryName);
    }
  };

  if (categories.length === 0) {
    return (
      <div className="text-center py-8 border border-dashed border-gray-200 rounded-lg bg-gray-50">
        <p className="text-gray-500">No services available</p>
        <p className="text-sm text-gray-400 mt-1">Contact your administrator to set up services</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {categories.map((category) => {
        const categoryColorClasses = getCategoryColor(category.name);
        const isExpanded = expandedCategories.has(category.id);
        
        return (
          <Card key={category.id} className="border border-gray-200">
            <Collapsible open={isExpanded} onOpenChange={() => toggleCategory(category.id)}>
              <CollapsibleTrigger asChild>
                <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors py-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {isExpanded ? (
                        <ChevronDown className="h-4 w-4 text-gray-500" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-gray-500" />
                      )}
                      <Badge className={`${categoryColorClasses} text-xs font-medium`}>
                        {category.name}
                      </Badge>
                      <span className="text-sm text-gray-600">
                        {category.subcategories.length} subcategories
                      </span>
                    </div>
                    <span className="text-xs text-gray-400">
                      {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                    </span>
                  </div>
                  {category.description && (
                    <p className="text-sm text-gray-600 text-left mt-1">{category.description}</p>
                  )}
                </CardHeader>
              </CollapsibleTrigger>
              
              <CollapsibleContent>
                <CardContent className="pt-0 pb-4">
                  <div className="space-y-3">
                    {category.subcategories.map((subcategory) => {
                      const isSubExpanded = expandedSubcategories.has(subcategory.id);
                      
                      return (
                        <div key={subcategory.id} className="border border-gray-100 rounded-lg">
                          <Collapsible open={isSubExpanded} onOpenChange={() => toggleSubcategory(subcategory.id)}>
                            <CollapsibleTrigger asChild>
                              <div className="flex items-center justify-between p-3 cursor-pointer hover:bg-gray-50 transition-colors">
                                <div className="flex items-center gap-2">
                                  {isSubExpanded ? (
                                    <ChevronDown className="h-3 w-3 text-gray-400" />
                                  ) : (
                                    <ChevronRight className="h-3 w-3 text-gray-400" />
                                  )}
                                  <span className="font-medium text-sm text-gray-700">
                                    {subcategory.name}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    ({subcategory.jobs.length} services)
                                  </span>
                                </div>
                              </div>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <div className="px-3 pb-3 space-y-2">
                                {subcategory.jobs.map((job) => {
                                  const isSelected = isServiceSelected(job.id);
                                  
                                  return (
                                    <div
                                      key={job.id}
                                      className={`border rounded-md p-3 transition-colors ${
                                        isSelected 
                                          ? 'border-blue-200 bg-blue-50' 
                                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                          <div className="flex items-center gap-2 mb-1">
                                            <span className="font-medium text-sm text-gray-900">
                                              {job.name}
                                            </span>
                                            {job.estimatedTime && (
                                              <Badge variant="outline" className="text-xs">
                                                {job.estimatedTime} min
                                              </Badge>
                                            )}
                                            {job.price && (
                                              <Badge variant="outline" className="text-xs">
                                                ${job.price}
                                              </Badge>
                                            )}
                                          </div>
                                          {job.description && (
                                            <p className="text-xs text-gray-600 mt-1">
                                              {job.description}
                                            </p>
                                          )}
                                        </div>
                                        
                                        <Button
                                          size="sm"
                                          variant={isSelected ? "destructive" : "outline"}
                                          onClick={() => handleServiceSelect(job, category.name, subcategory.name)}
                                          className="ml-3"
                                        >
                                          {isSelected ? (
                                            <>Remove</>
                                          ) : (
                                            <>
                                              <Plus className="h-3 w-3 mr-1" />
                                              Add
                                            </>
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                  );
                                })}
                                
                                {subcategory.jobs.length === 0 && (
                                  <div className="text-center py-4 text-gray-500 text-sm">
                                    No services available in this category
                                  </div>
                                )}
                              </div>
                            </CollapsibleContent>
                          </Collapsible>
                        </div>
                      );
                    })}
                    
                    {category.subcategories.length === 0 && (
                      <div className="text-center py-4 text-gray-500 text-sm">
                        No subcategories available
                      </div>
                    )}
                  </div>
                </CardContent>
              </CollapsibleContent>
            </Collapsible>
          </Card>
        );
      })}
    </div>
  );
}
