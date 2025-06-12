
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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

  React.useEffect(() => {
    if (jobLine) {
      setFormData(jobLine);
    }
  }, [jobLine]);

  const handleSave = async () => {
    if (!jobLine || !formData) return;

    try {
      setIsSaving(true);
      
      const updatedJobLine: WorkOrderJobLine = {
        ...jobLine,
        ...formData,
        // Calculate total if needed
        total_amount: formData.estimated_hours && formData.labor_rate 
          ? (formData.estimated_hours * formData.labor_rate) 
          : formData.total_amount || 0
      };

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
              onChange={e => setFormData({
                ...formData,
                name: e.target.value
              })} 
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea 
              id="description" 
              value={formData.description || ''} 
              onChange={e => setFormData({
                ...formData,
                description: e.target.value
              })} 
            />
          </div>

          <div>
            <Label htmlFor="notes">Internal Notes</Label>
            <Textarea 
              id="notes" 
              value={formData.notes || ''} 
              onChange={e => setFormData({
                ...formData,
                notes: e.target.value
              })} 
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
                onChange={e => setFormData({
                  ...formData,
                  estimated_hours: parseFloat(e.target.value) || 0
                })} 
              />
            </div>
            
            <div>
              <Label htmlFor="laborRate">Labor Rate</Label>
              <Input 
                id="laborRate" 
                type="number" 
                step="0.01" 
                value={formData.labor_rate || ''} 
                onChange={e => setFormData({
                  ...formData,
                  labor_rate: parseFloat(e.target.value) || 0
                })} 
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-2">
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
