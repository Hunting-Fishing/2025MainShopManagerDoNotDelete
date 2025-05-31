
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { toast } from 'sonner';

interface AddJobLineDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAddJobLine: (jobLine: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workOrderId: string;
  shopId?: string;
}

const JOB_LINE_CATEGORIES = [
  'Maintenance',
  'Brake Service',
  'Tire Service',
  'Engine/Transmission',
  'Diagnostic',
  'Repair',
  'General Service'
];

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
    description: '',
    estimatedHours: 1.0,
    laborRate: 100.0,
    status: 'pending' as WorkOrderJobLine['status']
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Job line name is required');
      return;
    }

    const totalAmount = formData.estimatedHours * formData.laborRate;

    onAddJobLine({
      workOrderId,
      name: formData.name,
      category: formData.category || undefined,
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
      description: '',
      estimatedHours: 1.0,
      laborRate: 100.0,
      status: 'pending'
    });

    onOpenChange(false);
    toast.success('Job line added successfully');
  };

  const totalAmount = formData.estimatedHours * formData.laborRate;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter service name"
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {JOB_LINE_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="flex justify-end gap-2">
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
