
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServiceMainCategory, ServiceJob } from '@/types/serviceHierarchy';
import { HierarchicalServiceSelector } from '@/components/work-orders/fields/services/HierarchicalServiceSelector';
import { fetchServiceCategories } from '@/lib/services/serviceApi';
import { toast } from 'sonner';

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workOrderId: string;
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
  const [isLoading, setIsLoading] = useState(true);
  const [selectedService, setSelectedService] = useState<{
    service: ServiceJob;
    categoryName: string;
    subcategoryName: string;
  } | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: 1.0,
    laborRate: 100.0,
    status: 'pending' as WorkOrderJobLine['status']
  });

  // Load service categories on mount
  useEffect(() => {
    const loadServiceCategories = async () => {
      try {
        setIsLoading(true);
        const categories = await fetchServiceCategories();
        setServiceCategories(categories);
      } catch (error) {
        console.error('Failed to load service categories:', error);
        toast.error('Failed to load services');
      } finally {
        setIsLoading(false);
      }
    };

    if (open) {
      loadServiceCategories();
    }
  }, [open]);

  // Handle service selection from hierarchical selector
  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    setSelectedService({ service, categoryName, subcategoryName });
    
    // Auto-populate form fields from selected service
    setFormData(prev => ({
      ...prev,
      name: service.name,
      category: categoryName,
      subcategory: subcategoryName,
      description: service.description || '',
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : prev.estimatedHours, // Convert minutes to hours
      laborRate: prev.laborRate // Keep existing labor rate
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    const totalAmount = formData.estimatedHours * formData.laborRate;

    onAddJobLine({
      workOrderId,
      name: formData.name,
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      estimatedHours: formData.estimatedHours,
      laborRate: formData.laborRate,
      totalAmount,
      status: formData.status
    });

    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: 1.0,
      laborRate: 100.0,
      status: 'pending'
    });
    setSelectedService(null);

    onOpenChange(false);
    toast.success('Job line added successfully');
  };

  const totalAmount = formData.estimatedHours * formData.laborRate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selector Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Select Service</Label>
            {isLoading ? (
              <div className="text-center py-8">
                <p className="text-gray-500">Loading services...</p>
              </div>
            ) : serviceCategories.length > 0 ? (
              <div className="border rounded-md p-4 bg-gray-50">
                <HierarchicalServiceSelector
                  categories={serviceCategories}
                  onServiceSelect={handleServiceSelect}
                />
              </div>
            ) : (
              <div className="text-center py-8 border rounded-md bg-gray-50">
                <p className="text-gray-500">No services available</p>
              </div>
            )}

            {selectedService && (
              <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
                <div className="text-sm text-blue-800">
                  <strong>Selected:</strong> {selectedService.categoryName} → {selectedService.subcategoryName} → {selectedService.service.name}
                </div>
              </div>
            )}
          </div>

          {/* Manual Entry Section */}
          <div className="space-y-4">
            <Label className="text-base font-semibold">Service Details</Label>
            
            <div>
              <Label htmlFor="name">Service Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter service name or select from above"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                  placeholder="Service category"
                />
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="Service subcategory"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Enter detailed description"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="hours">Estimated Hours</Label>
                <Input
                  id="hours"
                  type="number"
                  min="0"
                  step="0.25"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: parseFloat(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="rate">Labor Rate ($)</Label>
                <Input
                  id="rate"
                  type="number"
                  min="0"
                  step="0.01"
                  value={formData.laborRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, laborRate: parseFloat(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div className="bg-gray-50 p-3 rounded-md">
              <div className="text-sm text-gray-600">Total Amount</div>
              <div className="text-lg font-semibold">${totalAmount.toFixed(2)}</div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
