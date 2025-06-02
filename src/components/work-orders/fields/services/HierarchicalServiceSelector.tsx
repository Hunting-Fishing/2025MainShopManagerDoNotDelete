
import React, { useState } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { ServiceViewModeToggle } from './ServiceViewModeToggle';
import { ServiceCompactView } from './ServiceCompactView';
import { ServiceCategoryList } from './ServiceCategoryList';

interface HierarchicalServiceSelectorProps {
  categories: ServiceMainCategory[];
  selectedServices: SelectedService[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function HierarchicalServiceSelector({
  categories,
  selectedServices,
  onServiceSelect,
  onRemoveService,
  onUpdateServices
}: HierarchicalServiceSelectorProps) {
  const [viewMode, setViewMode] = useState<'enhanced' | 'compact'>('enhanced');

  // Debug logging
  console.log('HierarchicalServiceSelector render:', {
    viewMode,
    categoriesCount: categories.length,
    selectedServicesCount: selectedServices.length
  });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Select Services</h4>
        <ServiceViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={setViewMode} 
        />
      </div>

      {viewMode === 'enhanced' ? (
        <ServiceCategoryList
          categories={categories}
          selectedServices={selectedServices}
          onServiceSelect={onServiceSelect}
          onRemoveService={onRemoveService}
          onUpdateServices={onUpdateServices}
        />
      ) : (
        <ServiceCompactView
          categories={categories}
          selectedServices={selectedServices}
          onServiceSelect={onServiceSelect}
        />
      )}
    </div>
  );
}
