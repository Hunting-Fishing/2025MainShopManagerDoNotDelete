
import React from 'react';
import { ServiceSector, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { EnhancedServiceSelector } from './EnhancedServiceSelector';

interface IntegratedServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function IntegratedServiceSelector({
  sectors,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: IntegratedServiceSelectorProps) {
  console.log('IntegratedServiceSelector render:', {
    sectorsCount: sectors.length,
    selectedServicesCount: selectedServices.length
  });

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">Services</h3>
        <p className="text-sm text-blue-700 mb-4">
          Select services for this work order. You can choose multiple services and customize them as needed.
        </p>
        
        <EnhancedServiceSelector
          sectors={sectors}
          onServiceSelect={onServiceSelect}
          selectedServices={selectedServices}
          onRemoveService={onRemoveService}
          onUpdateServices={onUpdateServices}
        />
      </div>
    </div>
  );
}
