import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, LaborRateType, JobLineStatus } from '@/types/jobLine';
import { createWorkOrderJobLine, updateWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { useToast } from '@/hooks/use-toast';
import { Loader2 } from 'lucide-react';

interface UnifiedJobLineFormDialogProps {
  workOrderId: string;
  jobLine?: WorkOrderJobLine | null;
  mode: 'add-service' | 'add-manual' | 'edit';
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLines: WorkOrderJobLine[]) => void;
}

export function UnifiedJobLineFormDialog({
  workOrderId,
  jobLine,
  mode,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineFormDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard' as LaborRateType,
    status: 'pending' as JobLineStatus,
    notes: '',
    display_order: 0
  });

  useEffect(() => {
    if (jobLine && mode === 'edit') {
      setFormData({
        name: jobLine.name || '',
        category: jobLine.category || '',
        subcategory: jobLine.subcategory || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        labor_rate_type: (jobLine.labor_rate_type as LaborRateType) || 'standard',
        status: (jobLine.status as JobLineStatus) || 'pending',
        notes: jobLine.notes || '',
        display_order: jobLine.display_order || 0
      });
    } else {
      // Reset form for new job lines
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        labor_rate_type: 'standard',
        status: 'pending',
        notes: '',
        display_order: 0
      });
    }
  }, [jobLine, mode, open]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formData.name.trim()) {
      toast({
        title: "Validation Error",
        description: "Job line name is required",
        variant: "destructive"
      });
      return;
    }

    if (formData.estimated_hours <= 0) {
      toast({
        title: "Validation Error", 
        description: "Estimated hours must be greater than 0",
        variant: "destructive"
      });
      return;
    }

    if (formData.labor_rate < 0) {
      toast({
        title: "Validation Error",
        description: "Labor rate cannot be negative", 
        variant: "destructive"
      });
      return;
    }

    setIsLoading(true);

    try {
      console.log('🔧 UnifiedJobLineFormDialog: Starting save operation', {
        mode,
        workOrderId,
        formData,
        jobLineId: jobLine?.id
      });

      const totalAmount = formData.estimated_hours * formData.labor_rate;

      const jobLineData: Partial<WorkOrderJobLine> = {
        work_order_id: workOrderId,
        name: formData.name,
        category: formData.category,
        subcategory: formData.subcategory,
        description: formData.description,
        estimated_hours: formData.estimated_hours,
        labor_rate: formData.labor_rate,
        labor_rate_type: formData.labor_rate_type,
        total_amount: totalAmount,
        status: formData.status,
        notes: formData.notes,
        display_order: formData.display_order
      };

      let savedJobLine: WorkOrderJobLine;

      if (mode === 'edit' && jobLine?.id) {
        console.log('🔧 UnifiedJobLineFormDialog: Updating existing job line', jobLine.id);
        savedJobLine = await updateWorkOrderJobLine(jobLine.id, jobLineData);
        toast({
          title: "Success",
          description: "Job line updated successfully"
        });
      } else {
        console.log('🔧 UnifiedJobLineFormDialog: Creating new job line');
        savedJobLine = await createWorkOrderJobLine(jobLineData);
        toast({
          title: "Success", 
          description: "Job line created successfully"
        });
      }

      console.log('🔧 UnifiedJobLineFormDialog: Save operation completed', savedJobLine);

      // Call onSave with the saved job line
      onSave([savedJobLine]);
      onOpenChange(false);

    } catch (error) {
      console.error('🔧 UnifiedJobLineFormDialog: Save operation failed', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save job line. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const getDialogTitle = () => {
    switch (mode) {
      case 'edit':
        return 'Edit Job Line';
      case 'add-service':
        return 'Add Job Line from Service';
      case 'add-manual':
        return 'Add Manual Job Line';
      default:
        return 'Job Line';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{getDialogTitle()}</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter job line name"
                required
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
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="estimated_hours">Estimated Hours *</Label>
              <Input
                id="estimated_hours"
                type="number"
                step="0.25"
                min="0"
                value={formData.estimated_hours}
                onChange={(e) => handleInputChange('estimated_hours', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="labor_rate">Labor Rate</Label>
              <Input
                id="labor_rate"
                type="number"
                step="0.01"
                min="0"
                value={formData.labor_rate}
                onChange={(e) => handleInputChange('labor_rate', parseFloat(e.target.value) || 0)}
              />
            </div>

            <div>
              <Label htmlFor="labor_rate_type">Rate Type</Label>
              <Select 
                value={formData.labor_rate_type} 
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

            <div>
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status} 
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

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter job line description"
              rows={3}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Enter any additional notes"
              rows={2}
            />
          </div>

          <div className="bg-gray-50 p-3 rounded">
            <div className="text-sm text-gray-600">
              <strong>Total Amount: </strong>
              ${(formData.estimated_hours * formData.labor_rate).toFixed(2)}
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {mode === 'edit' ? 'Update' : 'Create'} Job Line
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
