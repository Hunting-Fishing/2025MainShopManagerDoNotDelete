
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { IntegratedServiceSelector } from '@/components/work-orders/fields/services/IntegratedServiceSelector';
import { useServiceSectors } from '@/hooks/useServiceCategories';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isSaving, setIsSaving] = useState(false);

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

  const handleSave = async () => {
    if (selectedServices.length === 0) {
      return;
    }

    setIsSaving(true);
    try {
      // Create job lines in the database first
      const savedJobLines: WorkOrderJobLine[] = [];
      
      for (let index = 0; index < selectedServices.length; index++) {
        const service = selectedServices[index];
        
        const jobLineData = {
          work_order_id: workOrderId,
          name: service.name,
          category: service.category,
          subcategory: service.subcategory,
          description: service.description || 'automotive service',
          estimated_hours: service.estimated_hours || 1,
          labor_rate: service.labor_rate || 100,
          total_amount: service.total_amount || (service.labor_rate || 100),
          status: service.status || 'pending',
          display_order: index
        };

        // Save to database
        const savedJobLine = await createWorkOrderJobLine(jobLineData);
        savedJobLines.push(savedJobLine);
      }

      toast({
        title: "Success",
        description: `Added ${savedJobLines.length} job line${savedJobLines.length !== 1 ? 's' : ''} successfully`,
      });

      // Call onSave with the actual saved job lines
      onSave(savedJobLines);
    } catch (error) {
      console.error('Error saving job lines:', error);
      toast({
        title: "Error",
        description: "Failed to save job lines",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
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
        <Button variant="outline" onClick={onCancel} disabled={isSaving}>
          Cancel
        </Button>
        <Button 
          onClick={handleSave}
          disabled={selectedServices.length === 0 || isSaving}
        >
          {isSaving ? 'Saving...' : `Add ${selectedServices.length} Job Line${selectedServices.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
