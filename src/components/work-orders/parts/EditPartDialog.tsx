
import React, { useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';

export interface EditPartDialogProps {
  part: WorkOrderPart;
  open: boolean;
  onClose: () => void;
  onOpenChange?: (open: boolean) => void;
  jobLines?: WorkOrderJobLine[];
  onPartUpdated?: () => void;
  onUpdate?: (updatedPart: WorkOrderPart) => void;
}

export function EditPartDialog({
  part,
  open,
  onClose,
  onOpenChange,
  jobLines = [],
  onPartUpdated,
  onUpdate
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: part.part_number,
    name: part.name,
    description: part.description || '',
    quantity: part.quantity,
    unit_price: part.unit_price,
    job_line_id: part.job_line_id || '',
    notes: part.notes || '',
    status: part.status || 'pending'
  });
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number || !formData.name || formData.quantity <= 0 || formData.unit_price < 0) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields with valid values",
        variant: "destructive"
      });
      return;
    }

    setIsUpdating(true);
    try {
      const updatedPart: WorkOrderPart = {
        ...part,
        ...formData,
        total_price: formData.quantity * formData.unit_price,
        updated_at: new Date().toISOString()
      };

      await updateWorkOrderPart(part.id, updatedPart);
      
      toast({
        title: "Success",
        description: "Part updated successfully",
      });

      if (onUpdate) {
        onUpdate(updatedPart);
      }
      
      if (onPartUpdated) {
        onPartUpdated();
      }
      
      handleClose();
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive"
      });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleClose = () => {
    if (onOpenChange) {
      onOpenChange(false);
    }
    onClose();
  };

  const handleOpenChange = (newOpen: boolean) => {
    if (onOpenChange) {
      onOpenChange(newOpen);
    }
    if (!newOpen) {
      onClose();
    }
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData(prev => ({ ...prev, part_number: e.target.value }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 0 }))}
                required
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData(prev => ({ ...prev, unit_price: parseFloat(e.target.value) || 0 }))}
                required
              />
            </div>
          </div>

          {jobLines.length > 0 && (
            <div>
              <Label htmlFor="job_line_id">Job Line</Label>
              <Select 
                value={formData.job_line_id} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, job_line_id: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select job line..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Unassigned</SelectItem>
                  {jobLines.map((jobLine) => (
                    <SelectItem key={jobLine.id} value={jobLine.id}>
                      {jobLine.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isUpdating}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isUpdating}
              className="flex-1"
            >
              {isUpdating ? "Updating..." : "Update Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
