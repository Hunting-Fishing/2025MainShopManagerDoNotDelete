
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EnhancedServiceSelector } from '@/components/work-orders/fields/services/EnhancedServiceSelector';
import { SelectedService } from '@/types/selectedService';
import { ServiceJob } from '@/types/service';
import { useServiceSectors } from '@/hooks/useServiceCategories';

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

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">Select Services</h3>
          <p className="text-sm text-muted-foreground">
            Choose from our service catalog to add job lines to this work order
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <div className="border-b pb-4">
          <h3 className="text-lg font-semibold">Select Services</h3>
          <p className="text-sm text-muted-foreground">
            Choose from our service catalog to add job lines to this work order
          </p>
        </div>
        <div className="text-center py-8">
          <p className="text-red-500">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="border-b pb-4">
        <h3 className="text-lg font-semibold">Select Services</h3>
        <p className="text-sm text-muted-foreground">
          Search and choose from our service catalog to add job lines to this work order
        </p>
      </div>

      <div className="max-h-96 overflow-y-auto">
        <EnhancedServiceSelector
          sectors={sectors}
          onServiceSelect={handleServiceSelect}
          selectedServices={selectedServices}
          onRemoveService={handleRemoveService}
          onUpdateServices={handleUpdateServices}
        />
      </div>

      <div className="flex justify-end gap-2 pt-4 border-t">
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedServices.length === 0}
        >
          Add {selectedServices.length} Job Line{selectedServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
