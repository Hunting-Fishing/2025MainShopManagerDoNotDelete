
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine, JobLineFormValues } from '@/types/jobLine';
import { StatusSelector } from '../shared/StatusSelector';
import { createWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from '@/hooks/use-toast';

interface AddJobLineDialogProps {
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (jobLine: WorkOrderJobLine) => void;
}

export function AddJobLineDialog({
  workOrderId,
  open,
  onOpenChange,
  onAdd
}: AddJobLineDialogProps) {
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    status: 'pending',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotal = () => {
    const hours = formData.estimated_hours || 0;
    const rate = formData.labor_rate || 0;
    return hours * rate;
  };

  const handleSave = async () => {
    if (!formData.name.trim()) {
      toast({
        title: "Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);
    try {
      const newJobLine = await createWorkOrderJobLine(workOrderId, formData);
      onAdd(newJobLine);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        status: 'pending',
        notes: ''
      });

      toast({
        title: "Success",
        description: "Job line created successfully",
      });
    } catch (error) {
      console.error('Error creating job line:', error);
      toast({
        title: "Error",
        description: "Failed to create job line",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof JobLineFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleFieldChange('name', e.target.value)}
              placeholder="Enter job line name"
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
              placeholder="Enter job description"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <StatusSelector
              currentStatus={formData.status || 'pending'}
              type="jobLine"
              onStatusChange={(status) => handleFieldChange('status', status)}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={formData.estimated_hours || 0}
                onChange={(e) => handleFieldChange('estimated_hours', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="rate">Labor Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.labor_rate || 0}
                onChange={(e) => handleFieldChange('labor_rate', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total">Total Amount ($)</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={calculateTotal()}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleFieldChange('notes', e.target.value)}
              placeholder="Additional notes"
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Creating...' : 'Create Job Line'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
