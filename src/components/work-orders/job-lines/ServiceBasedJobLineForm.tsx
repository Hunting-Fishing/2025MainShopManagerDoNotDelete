
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { IntegratedServiceSelector } from '@/components/work-orders/fields/services/IntegratedServiceSelector';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({
  workOrderId,
  onSave,
  onCancel
}: ServiceBasedJobLineFormProps) {
  const { sectors, loading, error } = useServiceSectors();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    // Service selection is handled by the IntegratedServiceSelector
    console.log('Service selected:', service.name, categoryName, subcategoryName);
  };

  const handleRemoveService = (serviceId: string) => {
    const updatedServices = selectedServices.filter(s => s.id !== serviceId);
    setSelectedServices(updatedServices);
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSave = () => {
    if (selectedServices.length === 0) {
      return;
    }

    const jobLines: WorkOrderJobLine[] = selectedServices.map((service, index) => ({
      id: `temp-${Date.now()}-${index}`,
      work_order_id: workOrderId,
      name: service.name,
      category: service.category,
      subcategory: service.subcategory,
      description: service.description,
      estimated_hours: service.estimated_hours,
      labor_rate: service.labor_rate,
      total_amount: service.total_amount,
      status: service.status,
      display_order: index,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));

    onSave(jobLines);
  };

  if (loading) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline" className="mt-2">
          Retry
        </Button>
      </div>
    );
  }

  if (sectors.length === 0) {
    return (
      <div className="text-center py-8 border rounded-md bg-gray-50">
        <p className="text-gray-500">No services available</p>
        <p className="text-sm text-gray-400">Contact your administrator to set up services</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Services for Job Lines</CardTitle>
        </CardHeader>
        <CardContent>
          <IntegratedServiceSelector
            sectors={sectors}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            onRemoveService={handleRemoveService}
            onUpdateServices={handleUpdateServices}
          />
        </CardContent>
      </Card>

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={selectedServices.length === 0}
        >
          Add {selectedServices.length} Job Line{selectedServices.length !== 1 ? 's' : ''}
        </Button>
      </div>
    </div>
  );
}
