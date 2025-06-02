
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
  const [expandedCategories, setExpandedCategories] = useState<string[]>(['1', '2', '3']); // Auto-expand first few categories
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

  return (
    <div className="space-y-1">
      {categories.map((category) => (
        <div key={category.id} className="border rounded-md">
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 text-sm"
          >
            <span className="font-medium">{category.name}</span>
            {expandedCategories.includes(category.id) ? (
              <ChevronDown className="h-3 w-3" />
            ) : (
              <ChevronRight className="h-3 w-3" />
            )}
          </button>

          {expandedCategories.includes(category.id) && (
            <div className="border-t bg-gray-50/30">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => toggleSubcategory(subcategory.id)}
                    className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-100 text-xs pl-4"
                  >
                    <span className="font-medium">{subcategory.name}</span>
                    {expandedSubcategories.includes(subcategory.id) ? (
                      <ChevronDown className="h-3 w-3" />
                    ) : (
                      <ChevronRight className="h-3 w-3" />
                    )}
                  </button>

                  {expandedSubcategories.includes(subcategory.id) && (
                    <div className="px-2 pb-2 bg-white">
                      <div className="space-y-1">
                        {subcategory.jobs.map((job) => (
                          <div
                            key={job.id}
                            className="flex items-center justify-between p-1.5 border rounded text-xs hover:bg-gray-50"
                          >
                            <div className="flex-1 min-w-0">
                              <div className="font-medium truncate">{job.name}</div>
                              <div className="flex items-center gap-2 text-xs text-gray-500">
                                {job.estimatedTime && (
                                  <span>{job.estimatedTime}min</span>
                                )}
                                {job.price && (
                                  <span className="font-medium text-green-600">
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
                              className="h-6 w-6 p-0 ml-2 flex-shrink-0"
                            >
                              {isSelected(job.id) ? '✓' : <Plus className="h-3 w-3" />}
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
