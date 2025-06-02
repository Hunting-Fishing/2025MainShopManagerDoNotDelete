
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

  // Enhanced debug logging
  console.log('HierarchicalServiceSelector render:', {
    viewMode,
    categoriesCount: categories.length,
    selectedServicesCount: selectedServices.length,
    component: 'HierarchicalServiceSelector'
  });

  const handleViewModeChange = (mode: 'enhanced' | 'compact') => {
    console.log('HierarchicalServiceSelector viewMode changing:', { from: viewMode, to: mode });
    setViewMode(mode);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-medium text-slate-700">Select Services</h4>
        <ServiceViewModeToggle 
          viewMode={viewMode} 
          onViewModeChange={handleViewModeChange} 
        />
      </div>

      {/* Debug indicator to see which view is actually rendering */}
      <div className="text-xs text-gray-500 bg-yellow-100 p-1 rounded">
        Current view mode: {viewMode}
      </div>

      {viewMode === 'enhanced' ? (
        <div>
          <div className="text-xs text-green-600 mb-2">Rendering: ServiceCategoryList (Enhanced)</div>
          <ServiceCategoryList
            categories={categories}
            selectedServices={selectedServices}
            onServiceSelect={onServiceSelect}
            onRemoveService={onRemoveService}
            onUpdateServices={onUpdateServices}
          />
        </div>
      ) : (
        <div>
          <div className="text-xs text-blue-600 mb-2">Rendering: ServiceCompactView (Compact)</div>
          <ServiceCompactView
            categories={categories}
            selectedServices={selectedServices}
            onServiceSelect={onServiceSelect}
          />
        </div>
      )}
    </div>
  );
}
