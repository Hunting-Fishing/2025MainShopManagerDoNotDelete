
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { SelectedService } from '@/types/selectedService';
import { IntegratedServiceSelector } from '@/components/work-orders/fields/services/IntegratedServiceSelector';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { v4 as uuidv4 } from 'uuid';

export interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workOrderId?: string;
  shopId?: string;
}

export function AddJobLineDialog({ 
  open, 
  onOpenChange, 
  onAddJobLine,
  workOrderId,
  shopId 
}: AddJobLineDialogProps) {
  const [serviceCategories, setServiceCategories] = useState<ServiceMainCategory[]>([]);
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Manual job line fields
  const [manualJobLine, setManualJobLine] = useState({
    name: '',
    description: '',
    estimatedHours: 0,
    laborRate: 0
  });

  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const categories = await fetchServiceCategories();
        setServiceCategories(categories);
      } catch (err) {
        console.error("Failed to load service categories:", err);
        setError("Failed to load service categories. Please try again.");
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadServiceCategories();
    }
  }, [open]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newSelectedService: SelectedService = {
      id: uuidv4(),
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

  const handleAddSelectedServices = () => {
    selectedServices.forEach(service => {
      const jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
        workOrderId: workOrderId,
        name: service.name,
        category: service.categoryName,
        subcategory: service.subcategoryName,
        description: service.description,
        estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : 1,
        laborRate: service.price || 0,
        totalAmount: service.price || 0,
        status: 'pending' as const,
        notes: ''
      };
      onAddJobLine(jobLine);
    });
    
    // Reset form
    setSelectedServices([]);
    onOpenChange(false);
  };

  const handleAddManualJobLine = () => {
    if (!manualJobLine.name.trim()) return;

    const jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId: workOrderId,
      name: manualJobLine.name,
      description: manualJobLine.description,
      estimatedHours: manualJobLine.estimatedHours,
      laborRate: manualJobLine.laborRate,
      totalAmount: manualJobLine.estimatedHours * manualJobLine.laborRate,
      status: 'pending' as const,
      notes: ''
    };

    onAddJobLine(jobLine);
    
    // Reset form
    setManualJobLine({
      name: '',
      description: '',
      estimatedHours: 0,
      laborRate: 0
    });
    onOpenChange(false);
  };

  const resetAndClose = () => {
    setSelectedServices([]);
    setManualJobLine({
      name: '',
      description: '',
      estimatedHours: 0,
      laborRate: 0
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={resetAndClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Selection */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Select from Service Catalog</h3>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading services...</p>
              </div>
            ) : error ? (
              <div className="text-center py-8">
                <p className="text-red-500">{error}</p>
              </div>
            ) : (
              <IntegratedServiceSelector
                categories={serviceCategories}
                onServiceSelect={handleServiceSelect}
                selectedServices={selectedServices}
                onRemoveService={handleRemoveService}
                onUpdateServices={handleUpdateServices}
                maxSelections={10}
              />
            )}
            
            {selectedServices.length > 0 && (
              <div className="mt-4 flex justify-end">
                <Button onClick={handleAddSelectedServices}>
                  Add Selected Services ({selectedServices.length})
                </Button>
              </div>
            )}
          </div>

          {/* Manual Job Line Entry */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Or Add Custom Job Line</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="manual-name">Job Name</Label>
                <Input
                  id="manual-name"
                  value={manualJobLine.name}
                  onChange={(e) => setManualJobLine(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="Enter job name"
                />
              </div>
              <div>
                <Label htmlFor="manual-hours">Estimated Hours</Label>
                <Input
                  id="manual-hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={manualJobLine.estimatedHours}
                  onChange={(e) => setManualJobLine(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                  placeholder="Hours"
                />
              </div>
              <div className="col-span-2">
                <Label htmlFor="manual-description">Description</Label>
                <Textarea
                  id="manual-description"
                  value={manualJobLine.description}
                  onChange={(e) => setManualJobLine(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Job description"
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor="manual-rate">Labor Rate ($/hour)</Label>
                <Input
                  id="manual-rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={manualJobLine.laborRate}
                  onChange={(e) => setManualJobLine(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                  placeholder="Rate"
                />
              </div>
              <div className="flex items-end">
                <Button 
                  onClick={handleAddManualJobLine}
                  disabled={!manualJobLine.name.trim()}
                  className="w-full"
                >
                  Add Custom Job Line
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
