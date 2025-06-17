
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine } from '@/types/jobLine';
import { StatusSelector } from '../shared/StatusSelector';
import { EditService } from '@/services/workOrder/editService';
import { toast } from '@/hooks/use-toast';

interface UnifiedJobLineEditDialogProps {
  jobLine: WorkOrderJobLine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => Promise<void>;
}

export function UnifiedJobLineEditDialog({
  jobLine,
  open,
  onOpenChange,
  onSave
}: UnifiedJobLineEditDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderJobLine>>({
    name: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    total_amount: 0,
    status: 'pending',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (jobLine) {
      setFormData({
        name: jobLine.name || '',
        description: jobLine.description || '',
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        total_amount: jobLine.total_amount || 0,
        status: jobLine.status || 'pending',
        notes: jobLine.notes || ''
      });
    }
  }, [jobLine]);

  const calculateTotal = () => {
    const hours = formData.estimated_hours || 0;
    const rate = formData.labor_rate || 0;
    return hours * rate;
  };

  const handleSave = async () => {
    if (!jobLine) return;

    setIsLoading(true);
    try {
      const calculatedTotal = calculateTotal();
      const updatedJobLine = await EditService.updateJobLine(jobLine.id, {
        ...formData,
        total_amount: calculatedTotal
      });
      
      await onSave(updatedJobLine);
      toast({
        title: "Success",
        description: "Job line updated successfully",
      });
    } catch (error) {
      console.error('Error saving job line:', error);
      toast({
        title: "Error", 
        description: "Failed to update job line",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (field: keyof WorkOrderJobLine, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleFieldChange('name', e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleFieldChange('description', e.target.value)}
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
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={formData.estimated_hours || 0}
                onChange={(e) => handleFieldChange('estimated_hours', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate ($)</Label>
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
              {isLoading ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
