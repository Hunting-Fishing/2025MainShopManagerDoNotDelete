
import React, { useMemo } from 'react';
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
  searchQuery?: string;
}

export const IntegratedServiceSelector: React.FC<IntegratedServiceSelectorProps> = ({
  sectors,
  onServiceSelect,
  selectedServices = [],
  onRemoveService,
  onUpdateServices,
  searchQuery = ""
}) => {
  // Convert sectors to categories for the existing components and filter by search
  const categories = useMemo(() => {
    const allCategories = sectors.flatMap(sector => sector.categories);
    
    if (!searchQuery.trim()) {
      return allCategories;
    }

    const query = searchQuery.toLowerCase();
    
    return allCategories.map(category => ({
      ...category,
      subcategories: category.subcategories.map(subcategory => ({
        ...subcategory,
        jobs: subcategory.jobs.filter(job => 
          job.name.toLowerCase().includes(query) ||
          (job.description && job.description.toLowerCase().includes(query)) ||
          category.name.toLowerCase().includes(query) ||
          subcategory.name.toLowerCase().includes(query)
        )
      })).filter(subcategory => subcategory.jobs.length > 0)
    })).filter(category => category.subcategories.length > 0);
  }, [sectors, searchQuery]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Check if service is already selected
    const isAlreadySelected = selectedServices.some(s => s.serviceId === service.id || s.id === service.id);
    if (isAlreadySelected) return;

    // Create new selected service
    const newService: SelectedService = {
      id: `${service.id}-${Date.now()}`, // Unique ID for the selection
      serviceId: service.id,
      name: service.name,
      description: service.description,
      category: categoryName,
      subcategory: subcategoryName,
      categoryName: categoryName,
      subcategoryName: subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      estimated_hours: service.estimatedTime ? service.estimatedTime / 60 : 0,
      labor_rate: service.price || 0,
      total_amount: service.price || 0,
      status: 'pending'
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
    <div className="space-y-4 bg-background">
      <SmartServiceSelector
        categories={categories}
        onServiceSelect={handleServiceSelect}
        selectedServices={selectedServices}
        onRemoveService={handleRemoveService}
        onUpdateServices={onUpdateServices}
      />

      {/* Selected Services Summary */}
      {selectedServices.length > 0 && (
        <Card className="border shadow-sm bg-card rounded">
          <CardHeader className="bg-card border-b">
            <CardTitle className="text-sm">Selected Services ({selectedServices.length})</CardTitle>
          </CardHeader>
          <CardContent className="bg-card">
            <div className="space-y-2">
              {selectedServices.map(service => (
                <div key={service.id} className="flex items-center justify-between p-2 border rounded-md bg-muted/50">
                  <div className="flex-1">
                    <div className="font-medium text-sm">{service.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {service.category} › {service.subcategory}
                    </div>
                    <div className="flex items-center gap-4 mt-1">
                      {service.estimatedTime && (
                        <span className="text-xs text-muted-foreground">
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
                    className="text-destructive hover:text-destructive/80 text-sm px-2 py-1"
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
