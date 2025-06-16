
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine } from '@/types/jobLine';
import { upsertWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface JobLineEditDialogProps {
  jobLine: WorkOrderJobLine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => Promise<void>;
}

export function JobLineEditDialog({
  jobLine,
  open,
  onOpenChange,
  onSave
}: JobLineEditDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderJobLine>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (jobLine && open) {
      console.log('Loading job line data for editing:', jobLine);
      setFormData({
        ...jobLine,
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0,
        total_amount: jobLine.total_amount || 0
      });
    }
  }, [jobLine, open]);

  const handleSave = async () => {
    if (!jobLine || !formData.name) {
      toast.error('Job line name is required');
      return;
    }

    try {
      setIsSaving(true);
      console.log('Saving job line with data:', formData);
      
      // Calculate total if needed
      const calculatedTotal = (formData.estimated_hours || 0) * (formData.labor_rate || 0);
      
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        ...formData,
        total_amount: calculatedTotal,
        updated_at: new Date().toISOString()
      };

      console.log('Final job line data to save:', updatedJobLine);

      // Save to database
      const savedJobLine = await upsertWorkOrderJobLine(updatedJobLine);
      
      // Update parent component
      await onSave(savedJobLine);
      
      toast.success('Job line updated successfully');
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving job line:', error);
      toast.error('Failed to save job line');
    } finally {
      setIsSaving(false);
    }
  };

  const handleFieldChange = (field: keyof WorkOrderJobLine, value: any) => {
    console.log(`Updating field ${field} with value:`, value);
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
            <Label htmlFor="name">Name *</Label>
            <Input 
              id="name" 
              value={formData.name || ''} 
              onChange={e => handleFieldChange('name', e.target.value)}
              placeholder="Enter job line name"
            />
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status || 'pending'} 
              onValueChange={value => handleFieldChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="in-progress">In Progress</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="on-hold">On Hold</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description || ''} 
              onChange={e => handleFieldChange('description', e.target.value)}
              placeholder="Enter job description"
            />
          </div>

          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes || ''} 
              onChange={e => handleFieldChange('notes', e.target.value)}
              placeholder="Add internal notes for this job line..."
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input 
                id="estimatedHours" 
                type="number" 
                step="0.1" 
                value={formData.estimated_hours || ''} 
                onChange={e => handleFieldChange('estimated_hours', parseFloat(e.target.value) || 0)}
                placeholder="0.0"
              />
            </div>
            
            <div>
              <Label htmlFor="laborRate">Labor Rate ($)</Label>
              <Input 
                id="laborRate" 
                type="number" 
                step="0.01" 
                value={formData.labor_rate || ''} 
                onChange={e => handleFieldChange('labor_rate', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label>Calculated Total</Label>
            <div className="text-lg font-semibold text-green-600">
              ${((formData.estimated_hours || 0) * (formData.labor_rate || 0)).toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
