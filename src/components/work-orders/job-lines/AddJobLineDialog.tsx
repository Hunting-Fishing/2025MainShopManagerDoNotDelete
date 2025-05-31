
import React, { useState } from 'react';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useLaborRates } from '@/hooks/useLaborRates';
import { toast } from 'sonner';

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
  const { laborRates, getDefaultRate } = useLaborRates(shopId);
  const defaultRate = getDefaultRate();
  
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: 1,
    laborRate: defaultRate?.hourly_rate || 100,
    status: 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Service name is required');
      return;
    }

    const totalAmount = formData.estimatedHours * formData.laborRate;
    
    const newJobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: formData.name.trim(),
      category: formData.category.trim() || undefined,
      subcategory: formData.subcategory.trim() || undefined,
      description: formData.description.trim() || undefined,
      estimatedHours: formData.estimatedHours,
      laborRate: formData.laborRate,
      totalAmount,
      status: formData.status
    };

    onAddJobLine(newJobLine);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: 1,
      laborRate: defaultRate?.hourly_rate || 100,
      status: 'pending'
    });
    
    onOpenChange(false);
    toast.success('Job line added successfully');
  };

  const handleLaborRateChange = (rateType: string) => {
    const selectedRate = laborRates.find(rate => rate.rate_type === rateType);
    if (selectedRate) {
      setFormData(prev => ({
        ...prev,
        laborRate: selectedRate.hourly_rate
      }));
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="e.g., Oil Change, Brake Service"
              className="mt-1"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <Label htmlFor="category" className="text-sm font-medium">Category</Label>
              <Input
                id="category"
                value={formData.category}
                onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                placeholder="e.g., Service, Repair"
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="subcategory" className="text-sm font-medium">Subcategory</Label>
              <Input
                id="subcategory"
                value={formData.subcategory}
                onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                placeholder="e.g., Engine, Brakes"
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description" className="text-sm font-medium">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Detailed description of the service"
              className="mt-1"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <Label htmlFor="hours" className="text-sm font-medium">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimatedHours}
                onChange={(e) => setFormData(prev => ({ 
                  ...prev, 
                  estimatedHours: parseFloat(e.target.value) || 0 
                }))}
                className="mt-1"
              />
            </div>
            <div>
              <Label htmlFor="laborRate" className="text-sm font-medium">Labor Rate</Label>
              <Select
                value={laborRates.find(rate => rate.hourly_rate === formData.laborRate)?.rate_type || 'standard'}
                onValueChange={handleLaborRateChange}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select rate" />
                </SelectTrigger>
                <SelectContent>
                  {laborRates.map((rate) => (
                    <SelectItem key={rate.id} value={rate.rate_type}>
                      {rate.rate_type} - ${rate.hourly_rate}/hr
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-sm font-medium">Total</Label>
              <div className="mt-1 p-2 bg-gray-50 rounded border text-lg font-semibold">
                ${(formData.estimatedHours * formData.laborRate).toFixed(2)}
              </div>
            </div>
          </div>

          <div>
            <Label htmlFor="status" className="text-sm font-medium">Status</Label>
            <Select
              value={formData.status}
              onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
            >
              <SelectTrigger className="mt-1">
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

          <div className="flex justify-end gap-3 pt-4">
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
