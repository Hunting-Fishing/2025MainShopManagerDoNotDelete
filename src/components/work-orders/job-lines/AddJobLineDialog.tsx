
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { toast } from 'sonner';

interface AddJobLineDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAddJobLine: (jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'>) => void;
  workOrderId: string;
  shopId?: string;
}

export function AddJobLineDialog({
  isOpen,
  onClose,
  onAddJobLine,
  workOrderId,
  shopId
}: AddJobLineDialogProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimatedHours: '',
    laborRate: '',
    status: 'pending' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast.error('Job line name is required');
      return;
    }

    const estimatedHours = formData.estimatedHours ? parseFloat(formData.estimatedHours) : undefined;
    const laborRate = formData.laborRate ? parseFloat(formData.laborRate) : undefined;
    const totalAmount = estimatedHours && laborRate ? estimatedHours * laborRate : undefined;

    const jobLineData: Omit<WorkOrderJobLine, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      name: formData.name.trim(),
      category: formData.category || undefined,
      subcategory: formData.subcategory || undefined,
      description: formData.description || undefined,
      estimatedHours,
      laborRate,
      totalAmount,
      status: formData.status,
      notes: undefined
    };

    onAddJobLine(jobLineData);
    
    // Reset form
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: '',
      laborRate: '',
      status: 'pending'
    });
    
    onClose();
    toast.success('Job line added successfully');
  };

  const handleCancel = () => {
    setFormData({
      name: '',
      category: '',
      subcategory: '',
      description: '',
      estimatedHours: '',
      laborRate: '',
      status: 'pending'
    });
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Job Line Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter job line name"
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
                  placeholder="e.g., Repair, Maintenance"
                />
              </div>
              <div>
                <Label htmlFor="subcategory">Subcategory</Label>
                <Input
                  id="subcategory"
                  value={formData.subcategory}
                  onChange={(e) => setFormData(prev => ({ ...prev, subcategory: e.target.value }))}
                  placeholder="e.g., Engine, Brakes"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the work"
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="estimatedHours">Estimated Hours</Label>
                <Input
                  id="estimatedHours"
                  type="number"
                  step="0.1"
                  min="0"
                  value={formData.estimatedHours}
                  onChange={(e) => setFormData(prev => ({ ...prev, estimatedHours: e.target.value }))}
                  placeholder="0.0"
                />
              </div>
              <div>
                <Label htmlFor="laborRate">Labor Rate ($/hr)</Label>
                <Input
                  id="laborRate"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.laborRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, laborRate: e.target.value }))}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value: any) => setFormData(prev => ({ ...prev, status: value }))}
              >
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
          </div>

          <DialogFooter className="mt-6">
            <Button type="button" variant="outline" onClick={handleCancel}>
              Cancel
            </Button>
            <Button type="submit">Add Job Line</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
