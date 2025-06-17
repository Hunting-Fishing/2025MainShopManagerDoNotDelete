
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { WorkOrderJobLine, JobLineFormValues } from '@/types/jobLine';
import { useToast } from '@/hooks/use-toast';

interface AddJobLineDialogProps {
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (jobLine: WorkOrderJobLine) => void;
  onJobLineAdd?: (jobLines: WorkOrderJobLine[]) => void;
}

export function AddJobLineDialog({ 
  workOrderId, 
  open, 
  onOpenChange, 
  onAdd,
  onJobLineAdd 
}: AddJobLineDialogProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<JobLineFormValues>({
    name: '',
    category: '',
    subcategory: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    labor_rate_type: 'standard',
    status: 'pending',
    notes: ''
  });

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
      
      if (onAdd) {
        onAdd(newJobLine);
      }
      
      if (onJobLineAdd) {
        onJobLineAdd([newJobLine]);
      }

      toast({
        title: "Success",
        description: "Job line added successfully",
      });

      // Reset form
      setFormData({
        name: '',
        category: '',
        subcategory: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
        labor_rate_type: 'standard',
        status: 'pending',
        notes: ''
      });

      onOpenChange(false);
    } catch (error) {
      console.error('Error adding job line:', error);
      toast({
        title: "Error",
        description: "Failed to add job line",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter job line name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Input
                id="category"
                value={formData.category || ''}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                placeholder="Enter category"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="hours">Estimated Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={formData.estimated_hours || 0}
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="rate">Labor Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.labor_rate || 0}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter notes"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Job Line'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
