
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine } from '@/types/jobLine';

interface JobLineEditDialogProps {
  jobLine: WorkOrderJobLine | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (jobLine: WorkOrderJobLine) => void;
}

export function JobLineEditDialog({ jobLine, open, onOpenChange, onSave }: JobLineEditDialogProps) {
  const [formData, setFormData] = React.useState<Partial<WorkOrderJobLine>>({});

  React.useEffect(() => {
    if (jobLine) {
      setFormData(jobLine);
    }
  }, [jobLine]);

  const handleSave = () => {
    if (jobLine && formData) {
      onSave({ ...jobLine, ...formData } as WorkOrderJobLine);
      onOpenChange(false);
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
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="estimatedHours">Estimated Hours</Label>
              <Input
                id="estimatedHours"
                type="number"
                step="0.1"
                value={formData.estimatedHours || ''}
                onChange={(e) => setFormData({ ...formData, estimatedHours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            
            <div>
              <Label htmlFor="laborRate">Labor Rate</Label>
              <Input
                id="laborRate"
                type="number"
                step="0.01"
                value={formData.laborRate || ''}
                onChange={(e) => setFormData({ ...formData, laborRate: parseFloat(e.target.value) || 0 })}
              />
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
