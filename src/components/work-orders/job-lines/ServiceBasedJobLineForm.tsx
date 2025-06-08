
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

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[]) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({ workOrderId, onSubmit, onCancel }: ServiceBasedJobLineFormProps) {
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [notes, setNotes] = useState('');
  const { categories, loading, error } = useServiceCategories();

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const selectedService: SelectedService = {
      id: `selected-${Date.now()}-${Math.random()}`, // Ensure unique ID
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      serviceId: service.id
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

    // Create job lines from selected services - submit all at once
    const jobLines: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>[] = selectedServices.map(service => ({
      workOrderId,
      name: service.name,
      category: service.categoryName,
      subcategory: service.subcategoryName,
      description: service.description || '',
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : undefined,
      totalAmount: service.price || 0,
      status: 'pending',
      notes
    }));

    // Submit all job lines at once
    onSubmit(jobLines);
  };

  if (loading) {
    return (
      <div className="p-6 text-center bg-background">
        <p className="text-muted-foreground">Loading services...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center bg-background">
        <p className="text-destructive">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 bg-background">
      <Card className="bg-card border shadow-sm">
        <CardHeader className="bg-card border-b">
          <CardTitle>Select Services</CardTitle>
        </CardHeader>
        <CardContent className="bg-card p-6">
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
        <Card className="bg-card border shadow-sm">
          <CardHeader className="bg-card border-b">
            <CardTitle>Additional Notes</CardTitle>
          </CardHeader>
          <CardContent className="bg-card p-6">
            <div className="space-y-4">
              <div>
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes for these job lines..."
                  rows={3}
                  className="bg-background border"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="flex justify-end gap-2 bg-background p-4 border-t">
        <Button variant="outline" onClick={onCancel}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          disabled={selectedServices.length === 0}
          className="bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Add Job Lines ({selectedServices.length})
        </Button>
      </div>
    </div>
  );
}
