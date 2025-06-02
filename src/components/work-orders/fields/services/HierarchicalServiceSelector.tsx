
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function HierarchicalServiceSelector({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null); // Reset subcategory when category changes
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
  };

  const handleServiceSelect = (service: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory, selectedSubcategory);
    }
  };

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(sub => sub.name === selectedSubcategory);

  return (
    <div className="space-y-4">
      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-blue-800">Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <div className="flex flex-wrap gap-2">
              {selectedServices.map((service) => (
                <Badge
                  key={service.id}
                  variant="secondary"
                  className="bg-blue-100 text-blue-800 hover:bg-blue-200 cursor-pointer"
                  onClick={() => onRemoveService(service.id)}
                >
                  {service.name} ×
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 h-96">
        {/* Categories */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm text-blue-800">Categories</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              <div className="p-2 space-y-1">
                {categories.map((category) => (
                  <Button
                    key={category.id}
                    variant="ghost"
                    className={`w-full justify-start text-left h-auto p-3 ${
                      selectedCategory === category.name
                        ? "bg-blue-100 text-blue-800 border border-blue-300"
                        : "hover:bg-blue-50 text-gray-700"
                    }`}
                    onClick={() => handleCategorySelect(category.name)}
                  >
                    <div>
                      <div className="font-medium">{category.name}</div>
                      <div className="text-xs text-gray-500">
                        {category.subcategories.length} subcategories
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Subcategories */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm text-blue-800">
              {selectedCategory ? `${selectedCategory} - Subcategories` : 'Subcategories'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {selectedCategoryData ? (
                <div className="p-2 space-y-1">
                  {selectedCategoryData.subcategories.map((subcategory) => (
                    <Button
                      key={subcategory.id}
                      variant="ghost"
                      className={`w-full justify-start text-left h-auto p-3 ${
                        selectedSubcategory === subcategory.name
                          ? "bg-blue-100 text-blue-800 border border-blue-300"
                          : "hover:bg-blue-50 text-gray-700"
                      }`}
                      onClick={() => handleSubcategorySelect(subcategory.name)}
                    >
                      <div>
                        <div className="font-medium">{subcategory.name}</div>
                        <div className="text-xs text-gray-500">
                          {subcategory.jobs.length} jobs
                        </div>
                      </div>
                    </Button>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Select a category to view subcategories
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Services/Jobs */}
        <Card className="border-blue-200">
          <CardHeader className="pb-2 bg-gradient-to-r from-blue-50 to-transparent">
            <CardTitle className="text-sm text-blue-800">
              {selectedSubcategory ? `${selectedSubcategory} - Services` : 'Services'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-80">
              {selectedSubcategoryData ? (
                <div className="p-2 space-y-2">
                  {selectedSubcategoryData.jobs.map((job) => {
                    const isSelected = selectedServices.some(s => s.id === job.id);
                    return (
                      <div
                        key={job.id}
                        className={`p-3 rounded-md border cursor-pointer transition-colors ${
                          isSelected
                            ? "bg-blue-100 border-blue-300 text-blue-800"
                            : "bg-white border-blue-200 hover:bg-blue-50"
                        }`}
                        onClick={() => !isSelected && handleServiceSelect(job)}
                      >
                        <div className="font-medium">{job.name}</div>
                        {job.description && (
                          <div className="text-xs text-gray-600 mt-1">{job.description}</div>
                        )}
                        <div className="flex justify-between items-center mt-2">
                          {job.estimatedTime && (
                            <span className="text-xs text-gray-500">
                              {job.estimatedTime} min
                            </span>
                          )}
                          {job.price && (
                            <span className="text-xs font-medium text-green-600">
                              ${job.price.toFixed(2)}
                            </span>
                          )}
                        </div>
                        {isSelected && (
                          <Badge className="mt-2 bg-blue-600 text-white">
                            Selected
                          </Badge>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Select a subcategory to view services
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
