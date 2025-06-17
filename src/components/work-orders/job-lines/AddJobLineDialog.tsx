
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderJobLine } from '@/types/jobLine';
import { createWorkOrderJobLine } from '@/services/workOrder/jobLineService';
import { useToast } from '@/hooks/use-toast';

interface AddJobLineDialogProps {
  workOrderId: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd?: (jobLine: WorkOrderJobLine) => void;
  onJobLineAdd?: (jobLines: Omit<WorkOrderJobLine, 'id' | 'created_at' | 'updated_at'>[]) => void;
}

export function AddJobLineDialog({
  workOrderId,
  open,
  onOpenChange,
  onAdd,
  onJobLineAdd
}: AddJobLineDialogProps) {
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    estimated_hours: 0,
    labor_rate: 0,
    status: 'pending',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const jobLineData = {
        ...formData,
        work_order_id: workOrderId,
        total_amount: formData.estimated_hours * formData.labor_rate
      };

      if (onJobLineAdd) {
        // For components expecting array format
        onJobLineAdd([jobLineData]);
      } else if (onAdd) {
        // For components expecting single job line
        const newJobLine = await createWorkOrderJobLine(workOrderId, jobLineData);
        onAdd(newJobLine);
      }

      toast({
        title: "Success",
        description: "Job line added successfully",
      });

      // Reset form
      setFormData({
        name: '',
        description: '',
        estimated_hours: 0,
        labor_rate: 0,
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
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="hours">Hours</Label>
              <Input
                id="hours"
                type="number"
                step="0.25"
                value={formData.estimated_hours}
                onChange={(e) => setFormData(prev => ({ ...prev, estimated_hours: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate ($)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.labor_rate}
                onChange={(e) => setFormData(prev => ({ ...prev, labor_rate: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="total">Total Amount ($)</Label>
            <Input
              id="total"
              type="number"
              step="0.01"
              value={formData.estimated_hours * formData.labor_rate}
              readOnly
              className="bg-muted"
            />
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Job Line'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
