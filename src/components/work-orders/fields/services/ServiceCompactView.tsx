
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';

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
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(
    categories.length > 0 ? categories[0].id : null
  );
  const [selectedSubcategoryId, setSelectedSubcategoryId] = useState<string | null>(null);

  console.log('ServiceCompactView rendering with categories:', categories.length);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.id === selectedSubcategoryId);

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  // Helper function to highlight search matches
  const highlightText = (text: string, searchTerm?: string) => {
    if (!searchTerm) return text;
    
    const regex = new RegExp(`(${searchTerm})`, 'gi');
    const parts = text.split(regex);
    
    return parts.map((part, index) => 
      regex.test(part) ? (
        <mark key={index} className="bg-yellow-200 px-1 rounded">
          {part}
        </mark>
      ) : part
    );
  };

  return (
    <div className="bg-white border rounded-lg overflow-hidden">
      <div className="text-xs text-purple-600 mb-2 p-2 bg-purple-50">
        ServiceCompactView: Three-column layout with {categories.length} categories
      </div>
      
      <div className="grid grid-cols-3 h-96">
        {/* Categories Column */}
        <div className="border-r bg-gray-50">
          <div className="p-3 border-b bg-gray-100">
            <h3 className="font-medium text-sm">Categories ({categories.length})</h3>
          </div>
          <div className="overflow-y-auto h-full">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => {
                  setSelectedCategoryId(category.id);
                  setSelectedSubcategoryId(null);
                }}
                className={`w-full text-left p-3 border-b hover:bg-blue-50 transition-colors ${
                  selectedCategoryId === category.id 
                    ? 'bg-blue-100 border-blue-200' 
                    : 'bg-white'
                }`}
              >
                <div className="font-medium text-sm">{category.name}</div>
                {category.description && (
                  <div className="text-xs text-gray-500 mt-1">{category.description}</div>
                )}
                <div className="text-xs text-blue-600 mt-1">
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Column */}
        <div className="border-r bg-gray-25">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium text-sm">
              Subcategories {selectedCategory && `(${selectedCategory.subcategories.length})`}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {selectedCategory ? (
              selectedCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  className={`w-full text-left p-3 border-b hover:bg-green-50 transition-colors ${
                    selectedSubcategoryId === subcategory.id 
                      ? 'bg-green-100 border-green-200' 
                      : 'bg-white'
                  }`}
                >
                  <div className="font-medium text-sm">{subcategory.name}</div>
                  {subcategory.description && (
                    <div className="text-xs text-gray-500 mt-1">{subcategory.description}</div>
                  )}
                  <div className="text-xs text-green-600 mt-1">
                    {subcategory.jobs.length} services
                  </div>
                </button>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Select a category to view subcategories
              </div>
            )}
          </div>
        </div>

        {/* Services Column */}
        <div className="bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-medium text-sm">
              Services {selectedSubcategory && `(${selectedSubcategory.jobs.length})`}
            </h3>
          </div>
          <div className="overflow-y-auto h-full">
            {selectedSubcategory ? (
              selectedSubcategory.jobs.map((job) => (
                <div
                  key={job.id}
                  className="p-3 border-b hover:bg-orange-50 transition-colors"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">{job.name}</div>
                      {job.description && (
                        <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                          {job.description}
                        </div>
                      )}
                      <div className="flex items-center gap-3 mt-2 text-xs">
                        {job.estimatedTime && (
                          <span className="text-blue-600">
                            {job.estimatedTime} min
                          </span>
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
                      onClick={() => onServiceSelect(job, selectedCategory!.name, selectedSubcategory.name)}
                      disabled={isSelected(job.id)}
                      className="ml-2 shrink-0"
                    >
                      {isSelected(job.id) ? 'Added' : <Plus className="h-3 w-3" />}
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <div className="p-4 text-center text-gray-500 text-sm">
                Select a subcategory to view services
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
