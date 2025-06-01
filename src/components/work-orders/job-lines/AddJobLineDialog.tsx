
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { ServicesSection } from '../fields/ServicesSection';
import { SelectedService } from '@/types/selectedService';
import { Plus, X } from 'lucide-react';

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
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
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: 0,
    laborRate: 0,
    status: 'pending' as const
  });

  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const handleServiceSelect = (service: any, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: `service-${Date.now()}`,
      name: service.name,
      categoryName,
      subcategoryName,
      estimatedHours: service.estimatedHours || 1,
      laborRate: service.laborRate || 0
    };
    setSelectedServices(prev => [...prev, newService]);
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedServices.length > 0) {
      // Create job lines from selected services
      selectedServices.forEach(service => {
        onAddJobLine({
          workOrderId,
          name: service.name,
          category: service.categoryName,
          subcategory: service.subcategoryName,
          description: formData.description,
          estimatedHours: service.estimatedHours,
          laborRate: service.laborRate,
          totalAmount: (service.estimatedHours || 0) * (service.laborRate || 0),
          status: formData.status,
          notes: ''
        });
      });
    } else if (formData.name) {
      // Create job line from manual form data
      onAddJobLine({
        workOrderId,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        estimatedHours: formData.estimatedHours,
        laborRate: formData.laborRate,
        totalAmount: formData.estimatedHours * formData.laborRate,
        status: formData.status,
        notes: ''
      });
    }

    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: 0,
      laborRate: 0,
      status: 'pending'
    });
    setSelectedServices([]);
    onOpenChange(false);
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Service Selection Section */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Select Services</h3>
            <ServicesSection
              onServiceSelect={handleServiceSelect}
              selectedServices={selectedServices}
              onUpdateServices={handleUpdateServices}
            />
          </div>

          {/* Manual Entry Section */}
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold mb-4">Or Add Manual Job Line</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">Job Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="Enter job name"
                />
              </div>
              
              <div>
                <Label htmlFor="category">Category</Label>
                <Input
                  id="category"
                  value={formData.category}
                  onChange={(e) => handleInputChange('category', e.target.value)}
                  placeholder="Enter category"
                />
              </div>

              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => handleInputChange('subcategory', e.target.value)}
                  placeholder="Enter subcategory"
                />
              </div>

              <div>
                <Label htmlFor="status">Status</Label>
                <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="completed">Completed</SelectItem>
                    <SelectItem value="on-hold">On Hold</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.5"
                  value={formData.estimatedHours}
                  onChange={(e) => handleInputChange('estimatedHours', parseFloat(e.target.value) || 0)}
                />
              </div>

              <div>
                <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  step="0.01"
                  value={formData.laborRate}
                  onChange={(e) => handleInputChange('laborRate', parseFloat(e.target.value) || 0)}
                />
              </div>
            </div>

            <div className="mt-4">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Enter job description"
                rows={3}
              />
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={selectedServices.length === 0 && !formData.name}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
