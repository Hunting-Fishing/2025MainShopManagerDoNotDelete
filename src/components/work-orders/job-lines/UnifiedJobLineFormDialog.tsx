
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, LaborRateType, JobLineStatus } from '@/types/jobLine';
import { createJobLine, updateJobLine } from '@/services/workOrder/jobLinesService';
import { useToast } from '@/hooks/use-toast';

export interface UnifiedJobLineFormDialogProps {
  workOrderId: string;
  jobLine?: WorkOrderJobLine;
  mode?: 'add-service' | 'add-manual' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLines: WorkOrderJobLine[]) => void | Promise<void>;
}

export function UnifiedJobLineFormDialog({
  workOrderId,
  jobLine,
  mode = 'add-manual',
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineFormDialogProps) {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<Partial<WorkOrderJobLine>>({
    work_order_id: workOrderId,
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    status: 'pending' as JobLineStatus,
    display_order: 0,
    notes: ''
  });

  // Initialize form data when dialog opens or jobLine changes
  useEffect(() => {
    if (open) {
      if (jobLine && mode === 'edit') {
        // Editing existing job line
        setFormData({
          ...jobLine,
          work_order_id: workOrderId
        });
      } else {
        // Adding new job line
        setFormData({
          work_order_id: workOrderId,
          name: '',
          category: '',
          subcategory: '',
          description: '',
          estimated_hours: 0,
          labor_rate: 0,
          labor_rate_type: 'standard' as LaborRateType,
          status: 'pending' as JobLineStatus,
          display_order: 0,
          notes: ''
        });
      }
    }
  }, [open, jobLine, mode, workOrderId]);

  const handleInputChange = (field: keyof WorkOrderJobLine, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate total_amount when hours or rate changes
      if (field === 'estimated_hours' || field === 'labor_rate') {
        const hours = field === 'estimated_hours' ? Number(value) : Number(updated.estimated_hours) || 0;
        const rate = field === 'labor_rate' ? Number(value) : Number(updated.labor_rate) || 0;
        updated.total_amount = hours * rate;
      }
      
      return updated;
    });
  };

  const validateForm = (): boolean => {
    if (!formData.name?.trim()) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return false;
    }

    if (!formData.work_order_id) {
      toast({
        title: "Validation Error", 
        description: "Work order ID is required",
        variant: "destructive"
      });
      return false;
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      let result: WorkOrderJobLine;

      if (jobLine && mode === 'edit') {
        // Update existing job line
        console.log('🔄 Updating job line:', jobLine.id, formData);
        result = await updateJobLine(jobLine.id, formData);
        
        toast({
          title: "Success",
          description: "Job line updated successfully"
        });
      } else {
        // Create new job line
        console.log('🔄 Creating new job line for work order:', workOrderId, formData);
        
        // Ensure all required fields are present
        const jobLineData: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'> = {
          work_order_id: workOrderId,
          name: formData.name || '',
          category: formData.category || '',
          subcategory: formData.subcategory || '',
          description: formData.description || '',
          estimated_hours: Number(formData.estimated_hours) || 0,
          labor_rate: Number(formData.labor_rate) || 0,
          labor_rate_type: (formData.labor_rate_type as LaborRateType) || 'standard',
          total_amount: Number(formData.total_amount) || 0,
          status: (formData.status as JobLineStatus) || 'pending',
          display_order: Number(formData.display_order) || 0,
          notes: formData.notes || ''
        };
        
        result = await createJobLine(jobLineData);
        
        toast({
          title: "Success",
          description: "Job line created successfully"
        });
      }

      // Call onSave with the result
      await onSave([result]);
      onOpenChange(false);

    } catch (error) {
      console.error('❌ Error saving job line:', error);
      
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job line",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const getDialogTitle = () => {
    if (mode === 'edit') return 'Edit Job Line';
    if (mode === 'add-service') return 'Add Job Line from Service';
    return 'Add Manual Job Line';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => handleInputChange('category', e.target.value)}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.1"
                min="0"
                value={formData.estimated_hours || 0}
                onChange={(e) => handleInputChange('estimated_hours', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="labor_rate">Labor Rate</Label>
              <Input
                id="labor_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate || 0}
                onChange={(e) => handleInputChange('labor_rate', Number(e.target.value))}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="total_amount">Total Amount</Label>
              <Input
                id="total_amount"
                type="number"
                step="0.01"
                value={formData.total_amount || 0}
                readOnly
                className="bg-gray-50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="labor_rate_type">Labor Rate Type</Label>
              <Select
                value={formData.labor_rate_type || 'standard'}
                onValueChange={(value) => handleInputChange('labor_rate_type', value as LaborRateType)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="standard">Standard</SelectItem>
                  <SelectItem value="overtime">Overtime</SelectItem>
                  <SelectItem value="premium">Premium</SelectItem>
                  <SelectItem value="flat_rate">Flat Rate</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(value) => handleInputChange('status', value as JobLineStatus)}
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

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : (mode === 'edit' ? 'Update' : 'Create')} Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
