
import React from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Plus, ChevronDown, ChevronRight } from 'lucide-react';
import { useState } from 'react';

interface ServiceCategoryListProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
  expandedCategories?: string[];
  expandedSubcategories?: string[];
  searchHighlight?: string;
}

export function ServiceCategoryList({
  categories,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices,
  expandedCategories: initialExpandedCategories,
  expandedSubcategories: initialExpandedSubcategories,
  searchHighlight
}: ServiceCategoryListProps) {
  const [localExpandedCategories, setLocalExpandedCategories] = useState<string[]>([]);
  const [localExpandedSubcategories, setLocalExpandedSubcategories] = useState<string[]>([]);

  // Use props if provided, otherwise use local state
  const expandedCategories = initialExpandedCategories || localExpandedCategories;
  const expandedSubcategories = initialExpandedSubcategories || localExpandedSubcategories;

  const toggleCategory = (categoryId: string) => {
    if (initialExpandedCategories) return; // Don't allow manual toggle if controlled
    
    setLocalExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const toggleSubcategory = (subcategoryId: string) => {
    if (initialExpandedSubcategories) return; // Don't allow manual toggle if controlled
    
    setLocalExpandedSubcategories(prev => 
      prev.includes(subcategoryId) 
        ? prev.filter(id => id !== subcategoryId)
        : [...prev, subcategoryId]
    );
  };

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  const highlightText = (text: string, highlight?: string) => {
    if (!highlight) return text;
    
    const index = text.toLowerCase().indexOf(highlight.toLowerCase());
    if (index === -1) return text;
    
    return (
      <>
        {text.substring(0, index)}
        <mark className="bg-yellow-200 px-1 rounded">
          {text.substring(index, index + highlight.length)}
        </mark>
        {text.substring(index + highlight.length)}
      </>
    );
  };

  return (
    <div className="space-y-2">
      {categories.map((category) => (
        <div key={category.id} className="border rounded-lg">
          <button
            onClick={() => toggleCategory(category.id)}
            className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-50"
          >
            <h3 className="font-medium">
              {highlightText(category.name, searchHighlight)}
            </h3>
            {expandedCategories.includes(category.id) ? (
              <ChevronDown className="h-4 w-4" />
            ) : (
              <ChevronRight className="h-4 w-4" />
            )}
          </button>

          {expandedCategories.includes(category.id) && (
            <div className="border-t bg-gray-50/50">
              {category.subcategories.map((subcategory) => (
                <div key={subcategory.id} className="border-b last:border-b-0">
                  <button
                    onClick={() => toggleSubcategory(subcategory.id)}
                    className="w-full flex items-center justify-between p-3 text-left hover:bg-gray-100"
                  >
                    <h4 className="font-medium text-sm">
                      {highlightText(subcategory.name, searchHighlight)}
                    </h4>
                    {expandedSubcategories.includes(subcategory.id) ? (
                      <ChevronDown className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </button>

                  {expandedSubcategories.includes(subcategory.id) && (
                    <div className="p-3 bg-white">
                      <ul className="space-y-2">
                        {subcategory.jobs.map((job) => (
                          <li
                            key={job.id}
                            className="flex items-center justify-between p-2 border rounded hover:bg-gray-50"
                          >
                            <div className="flex-1">
                              <div className="font-medium text-sm">
                                {highlightText(job.name, searchHighlight)}
                              </div>
                              {job.description && (
                                <div className="text-xs text-gray-500 mt-1">
                                  {highlightText(job.description, searchHighlight)}
                                </div>
                              )}
                              <div className="flex items-center gap-4 mt-1">
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
                            >
                              {isSelected(job.id) ? 'Added' : <Plus className="h-4 w-4" />}
                            </Button>
                          </li>
                        ))}
                      </ul>
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
