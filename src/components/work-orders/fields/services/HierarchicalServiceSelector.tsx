
import React, { useState } from "react";
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from "@/types/serviceHierarchy";
import { ServiceCategoryList } from "./ServiceCategoryList";
import { ServiceSubcategoryGrid } from "./ServiceSubcategoryGrid";
import { Button } from "@/components/ui/button";

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export const HierarchicalServiceSelector: React.FC<HierarchicalServiceSelectorProps> = ({
  categories,
  onServiceSelect
}) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);

  const selectedCategoryData = categories.find(cat => cat.name === selectedCategory);
  const selectedSubcategoryData = selectedCategoryData?.subcategories.find(
    sub => sub.name === selectedSubcategory
  );

  const handleCategorySelect = (categoryName: string) => {
    setSelectedCategory(categoryName);
    setSelectedSubcategory(null);
  };

  const handleSubcategorySelect = (subcategoryName: string) => {
    setSelectedSubcategory(subcategoryName);
  };

  const handleServiceSelect = (service: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory, selectedSubcategory);
      // Reset selections
      setSelectedCategory(null);
      setSelectedSubcategory(null);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 min-h-[300px]">
      {/* Categories Column */}
      <div className="border rounded-lg bg-white">
        <ServiceCategoryList
          categories={categories.map(cat => cat.name)}
          selectedCategory={selectedCategory}
          onCategorySelect={handleCategorySelect}
        />
      </div>

      {/* Subcategories Column */}
      <div className="border rounded-lg bg-white">
        {selectedCategoryData ? (
          <ServiceSubcategoryGrid
            category={selectedCategory!}
            subcategories={selectedCategoryData.subcategories.map(sub => sub.name)}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={handleSubcategorySelect}
          />
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Select a category to view subcategories</p>
          </div>
        )}
      </div>

      {/* Services Column */}
      <div className="border rounded-lg bg-white">
        {selectedSubcategoryData ? (
          <div className="h-full">
            <div className="p-2 border-b">
              <h3 className="font-medium text-sm">Services</h3>
            </div>
            <div className="p-2 overflow-y-auto max-h-56">
              <div className="space-y-2">
                {selectedSubcategoryData.jobs.map((service) => (
                  <Button
                    key={service.id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start text-left h-auto p-2"
                    onClick={() => handleServiceSelect(service)}
                  >
                    <div className="flex flex-col items-start">
                      <span className="font-medium text-sm">{service.name}</span>
                      <div className="flex gap-2 text-xs text-gray-500">
                        {service.estimatedTime && (
                          <span>{service.estimatedTime} min</span>
                        )}
                        {service.price && (
                          <span>${service.price}</span>
                        )}
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">Select a subcategory to view services</p>
          </div>
        )}
      </div>
    </div>
  );
};
