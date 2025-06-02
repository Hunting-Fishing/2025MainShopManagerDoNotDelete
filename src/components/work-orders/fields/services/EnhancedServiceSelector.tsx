
import React, { useState, useEffect, useRef } from 'react';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService, ServiceSelectionSummary } from '@/types/selectedService';
import { HierarchicalServiceSelector } from './HierarchicalServiceSelector';
import { SelectedServiceCard } from './SelectedServiceCard';
import { ServiceSelectionSummary as SummaryComponent } from './ServiceSelectionSummary';
import { CollapsedServiceSelector } from './CollapsedServiceSelector';
import { ResponsiveGrid } from '@/components/ui/responsive-grid';

interface EnhancedServiceSelectorProps {
  categories: ServiceMainCategory[];
  onServiceSelect: (service: ServiceJob, categoryName: string, subcategoryName: string) => void;
  selectedServices: SelectedService[];
  onRemoveService: (serviceId: string) => void;
  onUpdateServices: (services: SelectedService[]) => void;
}

export function EnhancedServiceSelector({
  categories,
  onServiceSelect,
  selectedServices,
  onRemoveService,
  onUpdateServices
}: EnhancedServiceSelectorProps) {
  const [isExpanded, setIsExpanded] = useState(selectedServices.length === 0);
  const [lastAddedServiceId, setLastAddedServiceId] = useState<string | null>(null);
  const selectedServicesRef = useRef<HTMLDivElement>(null);

  // Calculate summary
  const summary: ServiceSelectionSummary = {
    totalServices: selectedServices.length,
    totalEstimatedTime: selectedServices.reduce((total, service) => 
      total + (service.estimatedTime || 0), 0),
    totalEstimatedCost: selectedServices.reduce((total, service) => 
      total + (service.price || 0), 0)
  };

  // Handle service selection with enhanced functionality
  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newSelectedService: SelectedService = {
      id: `selected-${Date.now()}-${service.id}`,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    const updatedServices = [...selectedServices, newSelectedService];
    onUpdateServices(updatedServices);
    
    // Call the original handler for backward compatibility
    onServiceSelect(service, categoryName, subcategoryName);

    // Set as last added for animation
    setLastAddedServiceId(newSelectedService.id);

    // Collapse the selector after selection if it's not the first service
    if (selectedServices.length > 0) {
      setIsExpanded(false);
    }

    // Scroll to selected services after a brief delay
    setTimeout(() => {
      selectedServicesRef.current?.scrollIntoView({ 
        behavior: 'smooth', 
        block: 'nearest' 
      });
    }, 100);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(service => service.id !== serviceId);
    onUpdateServices(updatedServices);
    onRemoveService(serviceId);

    // If no services left, expand the selector
    if (updatedServices.length === 0) {
      setIsExpanded(true);
    }
  };

  const handleExpand = () => {
    setIsExpanded(true);
  };

  // Clear the last added service animation after it's been shown
  useEffect(() => {
    if (lastAddedServiceId) {
      const timer = setTimeout(() => {
        setLastAddedServiceId(null);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [lastAddedServiceId]);

  return (
    <div className="space-y-4">
      {/* Selected Services Section */}
      {selectedServices.length > 0 && (
        <div ref={selectedServicesRef} className="space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-slate-700">Selected Services</h4>
            <span className="text-xs text-slate-500">
              {selectedServices.length} service{selectedServices.length !== 1 ? 's' : ''}
            </span>
          </div>

          <ResponsiveGrid cols={{ default: 1, md: 2 }} gap="sm">
            {selectedServices.map((service) => (
              <SelectedServiceCard
                key={service.id}
                service={service}
                onRemove={handleRemoveService}
                isNew={service.id === lastAddedServiceId}
              />
            ))}
          </ResponsiveGrid>

          <SummaryComponent summary={summary} />
        </div>
      )}

      {/* Service Selector Section */}
      {isExpanded ? (
        <div className="space-y-4">
          {selectedServices.length > 0 && (
            <div className="flex items-center justify-between border-t pt-4">
              <h4 className="text-sm font-medium text-slate-700">Add More Services</h4>
            </div>
          )}
          
          <HierarchicalServiceSelector
            categories={categories}
            selectedServices={selectedServices}
            onServiceSelect={handleServiceSelect}
            onRemoveService={handleRemoveService}
            onUpdateServices={onUpdateServices}
          />
        </div>
      ) : (
        <CollapsedServiceSelector
          onExpand={handleExpand}
          serviceCount={selectedServices.length}
        />
      )}
    </div>
  );
}
