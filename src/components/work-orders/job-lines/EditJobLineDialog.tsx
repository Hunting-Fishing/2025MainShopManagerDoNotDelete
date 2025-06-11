
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JOB_LINE_STATUSES, JobLineStatus } from '@/types/jobLine';

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
  const [formData, setFormData] = React.useState<Partial<WorkOrderJobLine>>({});

  React.useEffect(() => {
    if (jobLine) {
      setFormData({
        ...jobLine,
        estimated_hours: jobLine.estimated_hours || 0,
        labor_rate: jobLine.labor_rate || 0
      });
    }
  }, [jobLine]);

  const handleSave = async () => {
    if (jobLine && formData) {
      const total = (formData.estimated_hours || 0) * (formData.labor_rate || 0);
      await onSave({
        ...jobLine,
        ...formData,
        total_amount: total
      } as WorkOrderJobLine);
      onOpenChange(false);
    }
  };

  const handleFieldChange = (field: keyof WorkOrderJobLine, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Recalculate total when hours or rate changes
      if (field === 'estimated_hours' || field === 'labor_rate') {
        const hours = field === 'estimated_hours' ? value : updated.estimated_hours || 0;
        const rate = field === 'labor_rate' ? value : updated.labor_rate || 0;
        updated.total_amount = hours * rate;
      }
      
      return updated;
    });
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
              onChange={e => handleFieldChange('name', e.target.value)} 
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description || ''} 
              onChange={e => handleFieldChange('description', e.target.value)} 
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
              <Label htmlFor="estimated_hours">Estimated Hours</Label>
              <Input 
                id="estimated_hours" 
                type="number" 
                step="0.1" 
                value={formData.estimated_hours || ''} 
                onChange={e => handleFieldChange('estimated_hours', parseFloat(e.target.value) || 0)} 
              />
            </div>
            
            <div>
              <Label htmlFor="labor_rate">Labor Rate</Label>
              <Input 
                id="labor_rate" 
                type="number" 
                step="0.01" 
                value={formData.labor_rate || ''} 
                onChange={e => handleFieldChange('labor_rate', parseFloat(e.target.value) || 0)} 
              />
            </div>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select 
              value={formData.status || 'pending'} 
              onValueChange={(value: JobLineStatus) => handleFieldChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {JOB_LINE_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Total Amount</Label>
            <div className="text-lg font-semibold">
              ${(formData.total_amount || 0).toFixed(2)}
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
