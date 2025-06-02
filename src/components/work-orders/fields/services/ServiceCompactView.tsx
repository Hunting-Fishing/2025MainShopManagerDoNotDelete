
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';

interface ServiceCompactViewProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function ServiceCompactView({ 
  categories, 
  selectedServices, 
  onServiceSelect 
}: ServiceCompactViewProps) {
  const [expandedCategories, setExpandedCategories] = useState<string[]>([]);
  const [expandedSubcategories, setExpandedSubcategories] = useState<string[]>([]);

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    setExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  const totalJobs = categories.reduce((total, category) => 
    total + category.subcategories.reduce((subTotal, subcategory) => 
      subTotal + subcategory.jobs.length, 0), 0);

  return (
    <div className="space-y-1">
      <div className="text-sm text-muted-foreground mb-3">
        {totalJobs} services available
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-md">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 rounded-md"
            >
              <h3 className="font-medium text-sm">{category.name}</h3>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="h-3 w-3" />
              ) : (
                <ChevronRight className="h-3 w-3" />
              )}
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="border-t bg-gray-50/30 px-2 pb-1">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSubcategory(subcategory.id)}
                      className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100/50 rounded-sm"
                    >
                      <h4 className="font-medium text-xs text-gray-700 ml-2">{subcategory.name}</h4>
                      {expandedSubcategories.includes(subcategory.id) ? (
                        <ChevronDown className="h-3 w-3" />
                      ) : (
                        <ChevronRight className="h-3 w-3" />
                      )}
                    </button>

                    {expandedSubcategories.includes(subcategory.id) && (
                      <div className="ml-4 space-y-1 pb-2">
                        {subcategory.jobs.map((job) => (
                          <div
                            key={job.id}
                            className={`flex items-center justify-between p-2 border rounded-sm hover:bg-gray-50 transition-colors ${
                              isSelected(job.id) ? 'bg-blue-50 border-blue-200' : 'bg-white'
                            }`}
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-xs">{job.name}</div>
                              {job.description && (
                                <p className="text-xs text-gray-500 mt-0.5 truncate">
                                  {job.description}
                                </p>
                              )}
                              <div className="flex items-center gap-3 mt-0.5">
                                {job.estimatedTime && (
                                  <span className="text-xs text-gray-500">
                                    {job.estimatedTime} min
                                  </span>
                                )}
                                {job.price && (
                                  <span className="text-xs font-medium text-green-600">
                                    ${job.price}
                                  </span>
                                )}
                              </div>
                            </div>
                            
                            <Button
                              size="sm"
                              variant={isSelected(job.id) ? "secondary" : "outline"}
                              onClick={() => onServiceSelect(job, category.name, subcategory.name)}
                              disabled={isSelected(job.id)}
                              className="ml-2 shrink-0 h-6 px-2 text-xs"
                            >
                              {isSelected(job.id) ? 'Added' : <Plus className="h-3 w-3" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
