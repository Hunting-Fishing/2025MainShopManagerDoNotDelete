
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

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  console.log('ServiceCompactView rendering with categories:', categories.length);

  return (
    <div className="space-y-1">
      <div className="text-xs text-purple-600 mb-2 p-2 bg-purple-50 border border-purple-200 rounded">
        🔍 DEBUG: ServiceCompactView is rendering {categories.length} categories
      </div>
      
      {categories.map((category) => (
        <div key={category.id} className="border rounded-md bg-white">
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center justify-between p-2 text-left hover:bg-gray-50 text-sm border-b"
          >
            <span className="font-medium text-gray-900">{category.name}</span>
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-500">
                {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
              </span>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="h-3 w-3 text-gray-400" />
              ) : (
                <ChevronRight className="h-3 w-3 text-gray-400" />
              )}
            </div>
          </button>

          {expandedCategories.includes(category.id) && (
            <div className="bg-gray-50/50">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border-b last:border-b-0">
                  <div className="p-2 bg-gray-100/50">
                    <h4 className="font-medium text-xs text-gray-700 mb-2">{subcategory.name}</h4>
                    <div className="grid grid-cols-1 gap-1">
                      {subcategory.jobs.map((job) => (
                        <div
                          key={job.id}
                          className="flex items-center justify-between p-1.5 bg-white border rounded text-xs hover:bg-blue-50 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-medium truncate text-gray-900">{job.name}</div>
                            <div className="flex items-center gap-2 text-xs text-gray-500 mt-0.5">
                              {job.estimatedTime && (
                                <span className="bg-blue-100 text-blue-700 px-1 rounded">
                                  {job.estimatedTime}min
                                </span>
                              )}
                              {job.price && (
                                <span className="bg-green-100 text-green-700 px-1 rounded font-medium">
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
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
