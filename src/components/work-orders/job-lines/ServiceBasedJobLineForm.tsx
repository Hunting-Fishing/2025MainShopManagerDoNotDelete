
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EnhancedServiceSelector } from '@/components/work-orders/fields/services/EnhancedServiceSelector';
import { SelectedService } from '@/types/selectedService';
import { ServiceJob } from '@/types/service';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { LoadingSpinner } from '@/components/ui/loading-spinner';
import { AlertCircle, Plus, X, Clock, DollarSign } from 'lucide-react';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSubmit,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const { sectors, loading, error } = useServiceSectors();

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: service.id,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      estimated_hours: service.estimatedTime ? service.estimatedTime / 60 : 0,
      labor_rate: service.price || 0,
      total_amount: service.price || 0,
      category: categoryName,
      subcategory: subcategoryName,
      categoryName: categoryName,
      subcategoryName: subcategoryName,
      status: 'pending',
      estimatedTime: service.estimatedTime,
      price: service.price
    };

    setSelectedServices(prev => [...prev, newService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(service => service.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) {
      alert('Please select at least one service');
      return;
    }

    const jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[] = selectedServices.map((service, index) => ({
      work_order_id: workOrderId,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory,
      description: service.description,
      estimated_hours: service.estimated_hours,
      labor_rate: service.labor_rate,
      labor_rate_type: 'standard',
      total_amount: service.total_amount,
      status: 'pending',
      display_order: index,
      notes: ''
    }));

    onSubmit(jobLines);
  };

  const calculateTotals = () => {
    const totalTime = selectedServices.reduce((sum, service) => sum + (service.estimatedTime || 0), 0);
    const totalCost = selectedServices.reduce((sum, service) => sum + (service.price || 0), 0);
    return { totalTime, totalCost };
  };

  const { totalTime, totalCost } = calculateTotals();

  if (loading) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose from our service catalog to add job lines to this work order
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center">
          <LoadingSpinner size="lg" text="Loading services..." />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col h-full">
        <div className="p-6 border-b bg-white">
          <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
          <p className="text-sm text-gray-600 mt-1">
            Choose from our service catalog to add job lines to this work order
          </p>
        </div>
        
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="text-center">
            <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Error Loading Services</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()} variant="outline">
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-gray-50">
      {/* Header */}
      <div className="p-6 bg-white border-b shadow-sm">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Select Services</h2>
            <p className="text-sm text-gray-600 mt-1">
              Search and choose from our service catalog to add job lines to this work order
            </p>
          </div>
          {selectedServices.length > 0 && (
            <Badge variant="secondary" className="ml-4">
              {selectedServices.length} selected
            </Badge>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Service Selector */}
        <div className="flex-1 p-6">
          <Card className="h-full">
            <CardHeader className="pb-4">
              <CardTitle className="text-lg">Available Services</CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <ScrollArea className="h-[500px]">
                <div className="px-6 pb-6">
                  <EnhancedServiceSelector
                    sectors={sectors}
                    onServiceSelect={handleServiceSelect}
                    selectedServices={selectedServices}
                    onRemoveService={handleRemoveService}
                    onUpdateServices={handleUpdateServices}
                  />
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Selected Services Panel */}
        {selectedServices.length > 0 && (
          <div className="w-80 border-l bg-white">
            <div className="p-6 border-b">
              <h3 className="text-lg font-semibold text-gray-900">Selected Services</h3>
              <p className="text-sm text-gray-600 mt-1">
                Review your selections before adding to work order
              </p>
            </div>

            <ScrollArea className="h-[400px]">
              <div className="p-6 space-y-4">
                {selectedServices.map((service) => (
                  <Card key={service.id} className="relative">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1 min-w-0">
                          <h4 className="font-medium text-gray-900 truncate">
                            {service.name}
                          </h4>
                          <p className="text-xs text-gray-500 mt-1">
                            {service.category} › {service.subcategory}
                          </p>
                          {service.description && (
                            <p className="text-sm text-gray-600 mt-2 line-clamp-2">
                              {service.description}
                            </p>
                          )}
                          <div className="flex items-center gap-4 mt-3 text-xs text-gray-500">
                            {service.estimatedTime && (
                              <div className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                <span>{service.estimatedTime} min</span>
                              </div>
                            )}
                            {service.price && (
                              <div className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                <span>${service.price}</span>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveService(service.id)}
                          className="ml-2 h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </ScrollArea>

            {/* Summary */}
            <div className="p-6 border-t bg-gray-50">
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Total Services:</span>
                  <span className="font-medium">{selectedServices.length}</span>
                </div>
                {totalTime > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Time:</span>
                    <span className="font-medium">{totalTime} min</span>
                  </div>
                )}
                {totalCost > 0 && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Cost:</span>
                    <span className="font-medium">${totalCost.toFixed(2)}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="p-6 bg-white border-t shadow-sm">
        <div className="flex items-center justify-between">
          <div className="text-sm text-gray-600">
            {selectedServices.length === 0 
              ? "No services selected" 
              : `${selectedServices.length} service${selectedServices.length !== 1 ? 's' : ''} ready to add`
            }
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={onCancel}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedServices.length === 0}
              className="min-w-[140px]"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add {selectedServices.length > 0 ? selectedServices.length : ''} Job Line{selectedServices.length !== 1 ? 's' : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
