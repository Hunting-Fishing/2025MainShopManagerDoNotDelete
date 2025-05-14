
import React, { useState } from 'react';
import { serviceCategories } from '@/data/commonServices';
import { ServiceCategoryList } from './ServiceCategoryList';
import { ServiceSubcategoryGrid } from './ServiceSubcategoryGrid';
import { ServiceItem, ServiceCategory } from '@/types/services';

export interface HierarchicalServiceSelectorProps {
  onSelectService: (service: ServiceItem) => void;
}

export function HierarchicalServiceSelector({ onSelectService }: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<string | null>(null);
  
  // Get category names for the category list
  const categoryNames = serviceCategories.map(cat => cat.name);
  
  // Handle service selection
  const handleServiceSelect = (serviceName: string) => {
    if (selectedCategory && selectedSubcategory) {
      const newService: ServiceItem = {
        name: serviceName,
        services: [],
        category: `${selectedCategory} > ${selectedSubcategory}`,
        price: 0  // Default price of 0
      };
      onSelectService(newService);
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Left column - Main Categories */}
      <div className="border rounded-md overflow-hidden">
        <ServiceCategoryList 
          categories={categoryNames}
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>
      
      {/* Middle column - Subcategories */}
      <div className="border rounded-md overflow-hidden">
        {selectedCategory ? (
          <ServiceSubcategoryGrid
            category={selectedCategory}
            subcategories={serviceCategories
              .find(cat => cat.name === selectedCategory)
              ?.subcategories.map(sub => sub.name) || []}
            selectedSubcategory={selectedSubcategory}
            onSelectSubcategory={setSelectedSubcategory}
          />
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Select a category first
          </div>
        )}
      </div>
      
      {/* Right column - Individual Services */}
      <div className="border rounded-md overflow-hidden">
        {selectedCategory && selectedSubcategory ? (
          <div className="p-4">
            <h3 className="font-medium mb-2">Services</h3>
            <ul className="space-y-1">
              {serviceCategories
                .find(cat => cat.name === selectedCategory)
                ?.subcategories.find(sub => sub.name === selectedSubcategory)
                ?.services.map((service, i) => (
                  <li key={i}>
                    <button
                      className="w-full text-left px-2 py-1.5 hover:bg-blue-50 rounded-md text-sm transition"
                      onClick={() => handleServiceSelect(service)}
                    >
                      {service}
                    </button>
                  </li>
                ))}
            </ul>
          </div>
        ) : (
          <div className="p-4 text-center text-muted-foreground">
            Select a subcategory to view services
          </div>
        )}
      </div>
    </div>
  );
}
