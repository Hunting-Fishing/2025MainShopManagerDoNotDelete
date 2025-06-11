
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderJobLine, JOB_LINE_STATUSES } from '@/types/jobLine';
import { upsertWorkOrderJobLine } from '@/services/workOrder/jobLinesService';
import { toast } from '@/hooks/use-toast';

interface EditJobLineDialogProps {
  jobLine: WorkOrderJobLine;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJobLineUpdated: (jobLine: WorkOrderJobLine) => void;
}

export function EditJobLineDialog({
  jobLine,
  open,
  onOpenChange,
  onJobLineUpdated
}: EditJobLineDialogProps) {
  const [formData, setFormData] = useState({
    name: jobLine.name,
    description: jobLine.description || '',
    estimated_hours: jobLine.estimated_hours || 0,
    labor_rate: jobLine.labor_rate || 0,
    status: jobLine.status || 'pending',
    notes: jobLine.notes || ''
  });
  const [isLoading, setIsLoading] = useState(false);

  const calculateTotal = () => {
    return (formData.estimated_hours * formData.labor_rate).toFixed(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const updatedJobLine = await upsertWorkOrderJobLine({
        ...jobLine,
        ...formData,
        total_amount: parseFloat(calculateTotal())
      });

      onJobLineUpdated(updatedJobLine);
      onOpenChange(false);
      
      toast({
        title: "Success",
        description: "Job line updated successfully"
      });
    } catch (error) {
      console.error('Error updating job line:', error);
      toast({
        title: "Error",
        description: "Failed to update job line",
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
          <DialogTitle>Edit Job Line</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Service Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              required
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, estimated_hours: parseFloat(e.target.value) || 0 })}
              />
            </div>
            <div>
              <Label htmlFor="rate">Rate ($/hr)</Label>
              <Input
                id="rate"
                type="number"
                step="0.01"
                value={formData.labor_rate}
                onChange={(e) => setFormData({ ...formData, labor_rate: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>

          <div>
            <Label>Total: ${calculateTotal()}</Label>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>

          <div className="flex justify-end space-x-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
