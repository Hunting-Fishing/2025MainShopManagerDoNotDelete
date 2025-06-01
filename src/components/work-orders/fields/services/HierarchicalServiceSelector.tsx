import React, { useState } from 'react';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { ServiceMainCategory, ServiceSubcategory, ServiceJob } from '@/types/serviceHierarchy';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronRight, ArrowLeft, Loader2 } from 'lucide-react';

interface HierarchicalServiceSelectorProps {
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
}

export function HierarchicalServiceSelector({ onServiceSelect }: HierarchicalServiceSelectorProps) {
  const [selectedCategory, setSelectedCategory] = useState<ServiceMainCategory | null>(null);
  const [selectedSubcategory, setSelectedSubcategory] = useState<ServiceSubcategory | null>(null);
  const { categories, loading, error } = useServiceCategories();

  const handleCategorySelect = (category: ServiceMainCategory) => {
    setSelectedCategory(category);
    setSelectedSubcategory(null); // Reset subcategory selection when category changes
  };

  const handleSubcategorySelect = (subcategory: ServiceSubcategory) => {
    setSelectedSubcategory(subcategory);
  };

  const handleServiceSelect = (service: ServiceJob) => {
    if (selectedCategory && selectedSubcategory) {
      onServiceSelect(service, selectedCategory.name, selectedSubcategory.name);
    }
  };

  const handleBackToCategories = () => {
    setSelectedCategory(null);
    setSelectedSubcategory(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center p-4">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Loading services...
      </div>
    );
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>;
  }

  if (!categories || categories.length === 0) {
    return <div className="p-4">No service categories available.</div>;
  }

  return (
    <div className="space-y-4">
      {!selectedCategory ? (
        // Main Categories List
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-700">Categories</h4>
          <div className="space-y-1">
            {categories.map((category) => (
              <Button
                key={category.id}
                variant="ghost"
                className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                onClick={() => handleCategorySelect(category)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                {category.name}
              </Button>
            ))}
          </div>
        </div>
      ) : !selectedSubcategory ? (
        // Subcategories List
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button variant="ghost" size="sm" onClick={handleBackToCategories}>
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Categories
            </Button>
            <h4 className="text-sm font-medium text-slate-700">{selectedCategory.name} - Subcategories</h4>
          </div>
          <div className="space-y-1">
            {selectedCategory.subcategories.map((subcategory) => (
              <Button
                key={subcategory.id}
                variant="ghost"
                className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                onClick={() => handleSubcategorySelect(subcategory)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                {subcategory.name}
              </Button>
            ))}
          </div>
        </div>
      ) : (
        // Services List
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedSubcategory(null)}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Subcategories
            </Button>
            <h4 className="text-sm font-medium text-slate-700">
              {selectedCategory.name} - {selectedSubcategory.name} - Services
            </h4>
          </div>
          <div className="space-y-1">
            {selectedSubcategory.jobs.map((service) => (
              <Button
                key={service.id}
                variant="ghost"
                className="justify-start w-full rounded-md px-3 hover:bg-slate-100"
                onClick={() => handleServiceSelect(service)}
              >
                <ChevronRight className="mr-2 h-4 w-4" />
                {service.name}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
