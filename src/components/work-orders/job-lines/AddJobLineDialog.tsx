
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ServicesSection } from '@/components/work-orders/fields/ServicesSection';
import { WorkOrderJobLine, JOB_LINE_STATUSES } from '@/types/jobLine';
import { SelectedService } from '@/types/selectedService';
import { ServiceJob } from '@/types/serviceHierarchy';
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
  const [jobLineName, setJobLineName] = useState('');
  const [description, setDescription] = useState('');
  const [category, setCategory] = useState('');
  const [subcategory, setSubcategory] = useState('');
  const [estimatedHours, setEstimatedHours] = useState<number>(0);
  const [laborRate, setLaborRate] = useState<number>(0);
  const [status, setStatus] = useState<'pending' | 'in-progress' | 'completed' | 'on-hold'>('pending');
  const [notes, setNotes] = useState('');
  const [selectedServices, setSelectedServices] = useState<SelectedService[]>([]);

  const handleServiceSelect = (service: ServiceJob, categoryName: string, subcategoryName: string) => {
    const newService: SelectedService = {
      id: `service-${Date.now()}`,
      serviceId: service.id,
      name: service.name,
      description: service.description,
      categoryName,
      subcategoryName,
      estimatedTime: service.estimatedTime,
      price: service.price,
      estimatedHours: service.estimatedTime ? service.estimatedTime / 60 : 0, // Convert minutes to hours
      laborRate: service.price || 0
    };
    setSelectedServices(prev => [...prev, newService]);
  };

  const handleRemoveService = (serviceId: string) => {
    setSelectedServices(prev => prev.filter(s => s.id !== serviceId));
  };

  const handleUpdateServices = (services: SelectedService[]) => {
    setSelectedServices(services);
  };

  const calculateTotalAmount = () => {
    return selectedServices.reduce((total, service) => {
      const hours = service.estimatedHours || 0;
      const rate = service.laborRate || 0;
      return total + (hours * rate);
    }, estimatedHours * laborRate);
  };

  const handleSubmit = () => {
    // Create job lines from selected services
    selectedServices.forEach(service => {
      const jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
        workOrderId,
        name: service.name,
        category: service.categoryName,
        subcategory: service.subcategoryName,
        description: service.description || '',
        estimatedHours: service.estimatedHours || 0,
        laborRate: service.laborRate || 0,
        totalAmount: (service.estimatedHours || 0) * (service.laborRate || 0),
        status: 'pending',
        notes: service.notes || ''
      };
      onAddJobLine(jobLine);
    });

    // Create manual job line if any manual data was entered
    if (jobLineName.trim()) {
      const manualJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
        workOrderId,
        name: jobLineName,
        category,
        subcategory,
        description,
        estimatedHours,
        laborRate,
        totalAmount: calculateTotalAmount(),
        status,
        notes
      };
      onAddJobLine(manualJobLine);
    }

    // Reset form
    setJobLineName('');
    setDescription('');
    setCategory('');
    setSubcategory('');
    setEstimatedHours(0);
    setLaborRate(0);
    setStatus('pending');
    setNotes('');
    setSelectedServices([]);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Service Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Services</CardTitle>
            </CardHeader>
            <CardContent>
              <ServicesSection
                onServiceSelect={handleServiceSelect}
                selectedServices={selectedServices}
                onUpdateServices={handleUpdateServices}
              />
            </CardContent>
          </Card>

          {/* Manual Job Line Entry */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Manual Entry</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="jobLineName">Job Line Name</Label>
                <Input
                  id="jobLineName"
                  value={jobLineName}
                  onChange={(e) => setJobLineName(e.target.value)}
                  placeholder="Enter job line name"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Input
                    id="category"
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    placeholder="Enter category"
                  />
                </div>
                <div>
                  <Label htmlFor="subcategory">Subcategory</Label>
                  <Input
                    id="subcategory"
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    placeholder="Enter subcategory"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter description"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="estimatedHours">Estimated Hours</Label>
                  <Input
                    id="estimatedHours"
                    type="number"
                    value={estimatedHours}
                    onChange={(e) => setEstimatedHours(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.25"
                  />
                </div>
                <div>
                  <Label htmlFor="laborRate">Labor Rate ($)</Label>
                  <Input
                    id="laborRate"
                    type="number"
                    value={laborRate}
                    onChange={(e) => setLaborRate(Number(e.target.value))}
                    placeholder="0"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={(value: any) => setStatus(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {JOB_LINE_STATUSES.map(statusOption => (
                        <SelectItem key={statusOption} value={statusOption}>
                          {statusOption.charAt(0).toUpperCase() + statusOption.slice(1).replace('-', ' ')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Additional notes"
                  rows={2}
                />
              </div>

              <div className="text-sm text-gray-600">
                <strong>Total Amount: ${calculateTotalAmount().toFixed(2)}</strong>
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleSubmit}
              disabled={selectedServices.length === 0 && !jobLineName.trim()}
            >
              Add Job Line(s)
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
