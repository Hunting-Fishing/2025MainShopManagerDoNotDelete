
import React, { useState, useMemo } from 'react';
import { ServiceSector, ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { SmartServiceSelector } from './SmartServiceSelector';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface IntegratedServiceSelectorProps {
  sectors: ServiceSector[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices?: SelectedService[];
  onRemoveService?: (serviceId: string) => void;
  onUpdateServices?: (services: SelectedService[]) => void;
}

export const IntegratedServiceSelector: React.FC<IntegratedServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices
}) => {
  // Convert sectors to categories for the existing components
  const categories = useMemo(() => {
    return sectors.flatMap(sector => sector.categories);
  }, [sectors]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Check if service is already selected
    const isAlreadySelected = selectedServices.some(s => s.serviceId === service.id);
    if (isAlreadySelected) return;

    // Create new selected service
    const newService: SelectedService = {
      id: `${service.id}-${Date.now()}`, // Unique ID for the selection
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
      laborRate: service.price
    };

    // Update services list
    if (onUpdateServices) {
      onUpdateServices([...selectedServices, newService]);
    }

    // Also call the original callback
    onServiceSelect(service, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    if (onUpdateServices) {
      const updatedServices = selectedServices.filter(s => s.id !== serviceId);
      onUpdateServices(updatedServices);
    }
    
    if (onRemoveService) {
      onRemoveService(serviceId);
    }
  };

  return (
    <div className="space-y-4">
      <SmartServiceSelector
        categories={categories}
        onServiceSelect={handleServiceSelect}
        selectedServices={selectedServices}
        onRemoveService={handleRemoveService}
        onUpdateServices={onUpdateServices}
      />

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-sm">Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {selectedServices.map((service) => (
                <div
                  key={service.id}
                  className="flex items-center justify-between p-2 border rounded-md bg-gray-50"
                >
                  <div className="flex-1">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-gray-500">
                      {service.categoryName} › {service.subcategoryName}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {service.estimatedTime && (
                        <span className="text-xs text-gray-500">
                          {service.estimatedTime} min
                        </span>
                      )}
                      {service.price && (
                        <span className="text-xs font-medium text-green-600">
                          ${service.price}
                        </span>
                      )}
                    </div>
                  </div>
                  <button
                    onClick={() => handleRemoveService(service.id)}
                    className="text-red-500 hover:text-red-700 text-sm px-2 py-1"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
