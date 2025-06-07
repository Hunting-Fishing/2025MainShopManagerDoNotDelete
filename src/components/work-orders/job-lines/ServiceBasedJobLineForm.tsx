
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceSelectorAdapter } from '../fields/services/ServiceSelectorAdapter';
import { ServiceJob } from '@/types/service';
import { SelectedService } from '@/types/selectedService';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { generateTempJobLineId } from '@/services/jobLineParserEnhanced';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({ workOrderId, onSubmit, onCancel }: ServiceBasedJobLineFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [notes, setNotes] = useState('');
  const { categories, loading, error } = useServiceCategories();

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const selectedService: SelectedService = {
      id: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      serviceId: service.id // Added missing serviceId property
    };

    setSelectedServices(prev => [...prev, selectedService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSubmit = () => {
    if (selectedServices.length === 0) return;

    // Create job lines from selected services
    selectedServices.forEach(service => {
      const jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
        workOrderId,
        name: service.name,
        category: service.categoryName,
        subcategory: service.subcategoryName,
        description: service.description || '',
        estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
        totalAmount: service.price || 0,
        status: 'pending',
        notes
      };

      onSubmit(jobLineData);
    });
  };

  if (loading) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Select Services</CardTitle>
        </CardHeader>
        <CardContent>
          <ServiceSelectorAdapter
            categories={categories}
            onServiceSelect={handleServiceSelect}
            selectedServices={selectedServices}
            onRemoveService={handleRemoveService}
            onUpdateServices={handleUpdateServices}
          />
        </CardContent>
      </Card>

      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes for these job lines..."
                  rows={3}
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedServices.length === 0}
        >
          Add Job Lines ({selectedServices.length})
        </Button>
      </div>
    </div>
  );
}
