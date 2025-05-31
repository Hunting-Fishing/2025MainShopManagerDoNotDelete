
import React, { useState, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Plus, ShoppingCart } from 'lucide-react';
import { ServiceLineItem, ServiceLineItemData } from './ServiceLineItem';
import { ServiceCategoriesView } from './ServiceCategoriesView';
import { generateServiceCode } from '@/utils/serviceCodeGenerator';
import { ServiceJob } from '@/types/serviceHierarchy';

interface ServiceSelectionManagerProps {
  selectedServices: ServiceLineItemData[];
  onServicesChange: (services: ServiceLineItemData[]) => void;
  showSelectionMode?: boolean;
}

export const ServiceSelectionManager: React.FC<ServiceSelectionManagerProps> = ({
  selectedServices,
  onServicesChange,
  showSelectionMode = true
}) => {
  const [viewMode, setViewMode] = useState<'selection' | 'summary'>('selection');

  const handleServiceSelect = useCallback((
    service: ServiceJob,
    categoryName: string,
    subcategoryName: string,
    jobIndex: number
  ) => {
    const serviceCode = generateServiceCode(categoryName, subcategoryName, jobIndex);
    
    // Check if service already exists
    const existingServiceIndex = selectedServices.findIndex(s => s.id === service.id);
    
    if (existingServiceIndex >= 0) {
      // Increase quantity if already exists
      const updatedServices = [...selectedServices];
      updatedServices[existingServiceIndex].quantity += 1;
      updatedServices[existingServiceIndex].total = 
        updatedServices[existingServiceIndex].quantity * (service.price || 0);
      onServicesChange(updatedServices);
    } else {
      // Add new service
      const newService: ServiceLineItemData = {
        id: service.id,
        code: serviceCode,
        name: service.name,
        description: service.description,
        categoryName,
        subcategoryName,
        estimatedTime: service.estimatedTime,
        price: service.price || 0,
        quantity: 1,
        total: service.price || 0
      };
      
      onServicesChange([...selectedServices, newService]);
    }
  }, [selectedServices, onServicesChange]);

  const handleRemoveService = useCallback((serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    onServicesChange(updatedServices);
  }, [selectedServices, onServicesChange]);

  const handleQuantityChange = useCallback((serviceId: string, quantity: number) => {
    const updatedServices = selectedServices.map(service => {
      if (service.id === serviceId) {
        return {
          ...service,
          quantity,
          total: quantity * service.price
        };
      }
      return service;
    });
    onServicesChange(updatedServices);
  }, [selectedServices, onServicesChange]);

  const totalAmount = selectedServices.reduce((sum, service) => sum + service.total, 0);
  const totalTime = selectedServices.reduce((sum, service) => 
    sum + ((service.estimatedTime || 0) * service.quantity), 0
  );

  return (
    <div className="space-y-6">
      {/* Header with Mode Toggle */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-900">Service Selection</h3>
        
        {showSelectionMode && (
          <div className="flex space-x-2">
            <Button
              type="button"
              variant={viewMode === 'selection' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('selection')}
              className="flex items-center space-x-1"
            >
              <Plus className="h-4 w-4" />
              <span>Add Services</span>
            </Button>
            <Button
              type="button"
              variant={viewMode === 'summary' ? 'default' : 'outline'}
              size="sm"
              onClick={() => setViewMode('summary')}
              className="flex items-center space-x-1"
            >
              <ShoppingCart className="h-4 w-4" />
              <span>Summary ({selectedServices.length})</span>
            </Button>
          </div>
        )}
      </div>

      {/* Selected Services Summary (always visible when services exist) */}
      {selectedServices.length > 0 && (
        <Card className="p-4 bg-blue-50 border-blue-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Badge variant="secondary">
                {selectedServices.length} Service{selectedServices.length !== 1 ? 's' : ''} Selected
              </Badge>
              {totalTime > 0 && (
                <Badge variant="outline">
                  {Math.ceil(totalTime / 60)}h {totalTime % 60}m Estimated
                </Badge>
              )}
            </div>
            <div className="text-lg font-semibold text-blue-700">
              Total: ${totalAmount.toFixed(2)}
            </div>
          </div>
        </Card>
      )}

      {/* Content based on view mode */}
      {viewMode === 'selection' || !showSelectionMode ? (
        <ServiceCategoriesView 
          showSelectionMode={true}
          onServiceSelect={handleServiceSelect}
        />
      ) : (
        <div className="space-y-4">
          {selectedServices.length === 0 ? (
            <Card className="p-8 text-center">
              <div className="text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <h4 className="text-lg font-medium mb-2">No Services Selected</h4>
                <p className="text-sm">Add services to see them listed here as professional line items.</p>
                <Button
                  type="button"
                  variant="outline"
                  className="mt-4"
                  onClick={() => setViewMode('selection')}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Services
                </Button>
              </div>
            </Card>
          ) : (
            <div className="space-y-3">
              {selectedServices.map((service) => (
                <ServiceLineItem
                  key={service.id}
                  service={service}
                  onRemove={handleRemoveService}
                  onQuantityChange={handleQuantityChange}
                  showActions={true}
                />
              ))}
              
              <Separator />
              
              {/* Summary Row */}
              <div className="flex justify-between items-center p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-4">
                  <span className="font-medium">
                    {selectedServices.length} Item{selectedServices.length !== 1 ? 's' : ''}
                  </span>
                  {totalTime > 0 && (
                    <span className="text-sm text-gray-600">
                      Est. Time: {Math.ceil(totalTime / 60)}h {totalTime % 60}m
                    </span>
                  )}
                </div>
                <div className="text-xl font-bold text-gray-900">
                  ${totalAmount.toFixed(2)}
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
