
import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { IntegratedServiceSelector } from '@/components/work-orders/fields/services/IntegratedServiceSelector';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { useServiceCategories } from '@/hooks/useServiceCategories';
import { toast } from 'sonner';
import { Clock, DollarSign, Wrench } from 'lucide-react';

interface ServiceBasedJobLineFormProps {
  workOrderId: string;
  onSubmit: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  onCancel: () => void;
}

export function ServiceBasedJobLineForm({ workOrderId, onSubmit, onCancel }: ServiceBasedJobLineFormProps) {
  const { categories, loading, error } = useServiceCategories();
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [laborRate, setLaborRate] = useState<number>(95); // Default rate
  const [isSubmitting, setIsSubmitting] = useState(false);

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

    setSelectedServices(prev => [...prev, newSelectedService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const calculateJobLineTotal = (service: SelectedService) => {
    const hours = (service.estimatedTime || 0) / 60; // Convert minutes to hours
    const laborCost = hours * laborRate;
    const partsCost = service.price || 0;
    return laborCost + partsCost;
  };

  const handleSubmitServices = async () => {
    if (selectedServices.length === 0) {
      toast.error('Please select at least one service');
      return;
    }

    setIsSubmitting(true);

    try {
      // Convert each selected service to a job line
      for (const service of selectedServices) {
        const hours = (service.estimatedTime || 0) / 60; // Convert minutes to hours
        const totalAmount = calculateJobLineTotal(service);

        const jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
          workOrderId,
          name: service.name,
          category: service.categoryName,
          subcategory: service.subcategoryName,
          description: service.description || '',
          estimatedHours: hours,
          laborRate,
          totalAmount,
          status: 'pending',
          notes: ''
        };

        // Submit each job line
        onSubmit(jobLineData);
      }

      toast.success(`Added ${selectedServices.length} job line(s) to work order`);
    } catch (error) {
      console.error('Error adding job lines:', error);
      toast.error('Failed to add job lines');
    } finally {
      setIsSubmitting(false);
    }
  };

  const totalEstimatedTime = selectedServices.reduce((total, service) => 
    total + (service.estimatedTime || 0), 0
  );

  const totalEstimatedCost = selectedServices.reduce((total, service) => 
    total + calculateJobLineTotal(service), 0
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-500">Loading services...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-500 mb-4">{error}</p>
        <Button onClick={() => window.location.reload()} variant="outline">
          Retry
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Service Selection */}
      <div className="space-y-4">
        <IntegratedServiceSelector
          categories={categories}
          onServiceSelect={handleServiceSelect}
          selectedServices={selectedServices}
          onRemoveService={handleRemoveService}
          onUpdateServices={handleUpdateServices}
        />
      </div>

      {/* Labor Rate Configuration */}
      {selectedServices.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Labor Rate Configuration
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="laborRate">Hourly Labor Rate ($)</Label>
              <Input
                id="laborRate"
                type="number"
                value={laborRate}
                onChange={(e) => setLaborRate(Number(e.target.value))}
                min="0"
                step="0.01"
                className="mt-1"
              />
            </div>

            {/* Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-blue-700 mb-1">
                  <Wrench className="h-4 w-4" />
                  <span className="font-medium">Services</span>
                </div>
                <p className="text-2xl font-bold text-blue-900">{selectedServices.length}</p>
              </div>

              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-green-700 mb-1">
                  <Clock className="h-4 w-4" />
                  <span className="font-medium">Est. Time</span>
                </div>
                <p className="text-2xl font-bold text-green-900">
                  {Math.round(totalEstimatedTime / 60 * 10) / 10}h
                </p>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                <div className="flex items-center gap-2 text-purple-700 mb-1">
                  <DollarSign className="h-4 w-4" />
                  <span className="font-medium">Est. Total</span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  ${totalEstimatedCost.toFixed(2)}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Action Buttons */}
      <div className="flex items-center justify-end gap-3 pt-4 border-t">
        <Button variant="outline" onClick={onCancel} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button 
          onClick={handleSubmitServices}
          disabled={selectedServices.length === 0 || isSubmitting}
          className="bg-blue-600 hover:bg-blue-700"
        >
          {isSubmitting ? 'Adding...' : `Add ${selectedServices.length} Job Line${selectedServices.length !== 1 ? 's' : ''}`}
        </Button>
      </div>
    </div>
  );
}
