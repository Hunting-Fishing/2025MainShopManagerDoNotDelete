
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

  const isSelected = (jobId: string) => 
    selectedServices.some(service => service.serviceId === jobId);

  const selectedCategory = categories.find(cat => cat.id === selectedCategoryId);
  const selectedSubcategory = selectedCategory?.subcategories.find(sub => sub.id === selectedSubcategoryId);

  // Auto-select first subcategory when category changes
  React.useEffect(() => {
    if (selectedCategory && selectedCategory.subcategories.length > 0) {
      setSelectedSubcategoryId(selectedCategory.subcategories[0].id);
    }
  }, [selectedCategoryId, selectedCategory]);

  console.log('ServiceCompactView rendering with categories:', categories.length);

  return (
    <div className="space-y-2">
      <div className="text-xs text-purple-600 mb-2 p-2 bg-purple-50 border border-purple-200 rounded">
        🔍 DEBUG: ServiceCompactView is rendering {categories.length} categories in COMPACT LAYOUT
      </div>
      
      <div className="grid grid-cols-3 gap-3 h-96">
        {/* Categories Column */}
        <div className="border rounded-lg bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Categories</h3>
          </div>
          <div className="overflow-y-auto h-80 p-2">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategoryId(category.id)}
                className={`w-full text-left p-2 rounded text-sm transition-colors ${
                  selectedCategoryId === category.id
                    ? 'bg-blue-100 text-blue-900 border border-blue-200'
                    : 'hover:bg-gray-100 text-gray-700'
                }`}
              >
                <div className="font-medium">{category.name}</div>
                <div className="text-xs text-gray-500 mt-1">
                  {category.subcategories.length} subcategories
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Subcategories Column */}
        <div className="border rounded-lg bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Subcategories</h3>
            {selectedCategory && (
              <p className="text-xs text-gray-600 mt-1">{selectedCategory.name}</p>
            )}
          </div>
          <div className="overflow-y-auto h-80 p-2">
            {selectedCategory ? (
              selectedCategory.subcategories.map((subcategory) => (
                <button
                  key={subcategory.id}
                  onClick={() => setSelectedSubcategoryId(subcategory.id)}
                  className={`w-full text-left p-2 rounded text-sm transition-colors ${
                    selectedSubcategoryId === subcategory.id
                      ? 'bg-green-100 text-green-900 border border-green-200'
                      : 'hover:bg-gray-100 text-gray-700'
                  }`}
                >
                  <div className="font-medium">{subcategory.name}</div>
                  <div className="text-xs text-gray-500 mt-1">
                    {subcategory.jobs.length} services
                  </div>
                </button>
              ))
            ) : (
              <div className="text-center text-gray-500 text-sm py-8">
                Select a category to view subcategories
              </div>
            )}
          </div>
        </div>

        {/* Services Column */}
        <div className="border rounded-lg bg-white">
          <div className="p-3 border-b bg-gray-50">
            <h3 className="font-semibold text-sm text-gray-900">Services</h3>
            {selectedSubcategory && (
              <p className="text-xs text-gray-600 mt-1">{selectedSubcategory.name}</p>
            )}
          </div>
          <div className="overflow-y-auto h-80 p-2">
            {selectedSubcategory ? (
              <div className="space-y-2">
                {selectedSubcategory.jobs.map((job) => (
                  <div
                    key={job.id}
                    className="p-2 border rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-sm text-gray-900 truncate">
                          {job.name}
                        </div>
                        <div className="flex items-center gap-2 mt-1">
                          {job.estimatedTime && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">
                              {job.estimatedTime}min
                            </span>
                          )}
                          {job.price && (
                            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded font-medium">
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
                        className="h-7 w-7 p-0 ml-2 flex-shrink-0"
                      >
                        {isSelected(job.id) ? '✓' : <Plus className="h-3 w-3" />}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 text-sm py-8">
                Select a subcategory to view services
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
