
import React from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { EnhancedServiceSelector } from './EnhancedServiceSelector';

interface IntegratedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function IntegratedServiceSelector({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: IntegratedServiceSelectorProps) {
  // Debug logging to trace component hierarchy
  console.log('🔍 IntegratedServiceSelector render:', {
    categoriesCount: categories.length,
    selectedServicesCount: selectedServices.length,
    totalSubcategories: categories.reduce((sum, cat) => sum + cat.subcategories.length, 0),
    totalJobs: categories.reduce((sum, cat) => 
      sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
    )
  });

  if (categories.length === 0) {
    return (
      <div className="space-y-4">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <h3 className="text-lg font-semibold text-yellow-900 mb-2">No Services Available</h3>
          <p className="text-sm text-yellow-700 mb-4">
            No service categories were found. This could indicate a data loading issue or an empty database.
          </p>
          <div className="text-xs text-yellow-600">
            <p>Debug: Check the service management section to verify services exist.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-lg font-semibold text-blue-900">Services</h3>
          <div className="text-sm text-blue-700">
            {categories.length} categories • {' '}
            {categories.reduce((sum, cat) => 
              sum + cat.subcategories.reduce((subSum, sub) => subSum + sub.jobs.length, 0), 0
            )} total services
          </div>
        </div>
        <p className="text-sm text-blue-700 mb-4">
          Select services for this work order. You can choose multiple services and customize them as needed.
        </p>
        
        <EnhancedServiceSelector
          categories={categories}
          onServiceSelect={onServiceSelect}
          selectedServices={selectedServices}
          onRemoveService={onRemoveService}
          onUpdateServices={onUpdateServices}
        />
      </div>
    </div>
  );
}
