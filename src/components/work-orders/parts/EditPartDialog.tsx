
import React, { useState, useEffect } from 'react';
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
  open: boolean;
  onClose: () => void;
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  onPartUpdated: () => void;
}

export function EditPartDialog({
  open,
  onClose,
  part,
  jobLines,
  onPartUpdated
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    job_line_id: undefined,
    status: 'pending',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Initialize form data when part changes
  useEffect(() => {
    if (part) {
      setFormData({
        part_number: part.part_number || '',
        name: part.name || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        job_line_id: part.job_line_id || undefined,
        status: part.status || 'pending',
        notes: part.notes || ''
      });
    }
  }, [part]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number.trim() || !formData.name.trim()) {
      toast({
        title: "Error",
        description: "Part number and name are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedPart: WorkOrderPart = {
        ...part,
        part_number: formData.part_number,
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        job_line_id: formData.job_line_id,
        status: formData.status,
        notes: formData.notes,
        updated_at: new Date().toISOString()
      };

      await updateWorkOrderPart(part.id, updatedPart);
      
      toast({
        title: "Success",
        description: "Part updated successfully",
      });
      
      onPartUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
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
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="Enter part number"
                required
              />
            </div>
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Part Name *</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="Enter part name"
              required
            />
          </div>

          <div>
            <Label htmlFor="unit_price">Unit Price *</Label>
            <Input
              id="unit_price"
              type="number"
              step="0.01"
              min="0"
              value={formData.unit_price}
              onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="job_line_id">Job Line</Label>
            <Select value={formData.job_line_id || ''} onValueChange={(value) => setFormData({ ...formData, job_line_id: value || undefined })}>
              <SelectTrigger>
                <SelectValue placeholder="Select job line (optional)" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No job line</SelectItem>
                {jobLines.map((jobLine) => (
                  <SelectItem key={jobLine.id} value={jobLine.id}>
                    {jobLine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status || 'pending'} onValueChange={(value) => setFormData({ ...formData, status: value })}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="ordered">Ordered</SelectItem>
                <SelectItem value="received">Received</SelectItem>
                <SelectItem value="installed">Installed</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="backordered">Backordered</SelectItem>
                <SelectItem value="defective">Defective</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter part description (optional)"
              rows={2}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Enter any additional notes (optional)"
              rows={2}
            />
          </div>

          <div className="flex gap-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              disabled={isSubmitting}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="flex-1"
            >
              {isSubmitting ? "Updating..." : "Update Part"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
