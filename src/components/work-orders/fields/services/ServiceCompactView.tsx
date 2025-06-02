
import React, { useState, useEffect } from 'react';
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

  // Auto-expand first category on mount to show hierarchical structure
  useEffect(() => {
    if (categories.length > 0 && expandedCategories.length === 0) {
      const firstCategory = categories[0];
      setExpandedCategories([firstCategory.id]);
      
      // Also expand first subcategory of first category
      if (firstCategory.subcategories.length > 0) {
        setExpandedSubcategories([firstCategory.subcategories[0].id]);
      }
    }
  }, [categories, expandedCategories.length]);

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
    <div className="space-y-2">
      <div className="text-sm text-muted-foreground mb-3">
        {totalJobs} services available across {categories.length} categories
      </div>
      
      <div className="space-y-1 max-h-96 overflow-y-auto">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg overflow-hidden">
            <button
              onClick={() => toggleCategory(category.id)}
              className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50 transition-colors"
            >
              <div>
                <h3 className="font-semibold text-sm">{category.name}</h3>
                <div className="text-xs text-gray-500 mt-0.5">
                  {category.subcategories.length} subcategories, {' '}
                  {category.subcategories.reduce((total, sub) => total + sub.jobs.length, 0)} services
                </div>
              </div>
              {expandedCategories.includes(category.id) ? (
                <ChevronDown className="h-4 w-4 text-gray-400" />
              ) : (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </button>

            {expandedCategories.includes(category.id) && (
              <div className="border-t bg-gray-50/30">
                {category.subcategories.map((subcategory) => (
                  <div key={subcategory.id} className="border-b last:border-b-0">
                    <button
                      onClick={() => toggleSubcategory(subcategory.id)}
                      className="w-full flex items-center justify-between p-2 pl-6 text-left hover:bg-gray-100/50 transition-colors"
                    >
                      <div>
                        <h4 className="font-medium text-sm text-gray-700">{subcategory.name}</h4>
                        <div className="text-xs text-gray-500 mt-0.5">
                          {subcategory.jobs.length} services available
                        </div>
                      </div>
                      {expandedSubcategories.includes(subcategory.id) ? (
                        <ChevronDown className="h-3 w-3 text-gray-400" />
                      ) : (
                        <ChevronRight className="h-3 w-3 text-gray-400" />
                      )}
                    </button>

                    {expandedSubcategories.includes(subcategory.id) && (
                      <div className="bg-white border-t border-gray-100">
                        <div className="space-y-1 p-2 pl-8">
                          {subcategory.jobs.map((job) => (
                            <div
                              key={job.id}
                              className={`flex items-center justify-between p-2 border rounded-sm hover:bg-gray-50 transition-colors ${
                                isSelected(job.id) ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-200'
                              }`}
                            >
                              <div className="flex-1 min-w-0 pr-2">
                                <div className="font-medium text-sm">{job.name}</div>
                                {job.description && (
                                  <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
                                    {job.description}
                                  </p>
                                )}
                                <div className="flex items-center gap-3 mt-1">
                                  {job.estimatedTime && (
                                    <span className="text-xs text-gray-500">
                                      {job.estimatedTime} min
                                    </span>
                                  )}
                                  {job.price && (
                                    <span className="text-xs font-semibold text-green-600">
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
                                className="shrink-0 h-7 px-2 text-xs"
                              >
                                {isSelected(job.id) ? 'Added' : <Plus className="h-3 w-3" />}
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
    </div>
  );
}
