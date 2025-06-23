
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderPart, WorkOrderPartFormValues, WORK_ORDER_PART_STATUSES, PART_TYPES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { PartsFormValidator } from '@/utils/partsErrorHandler';

export interface EditPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onClose?: () => void;
  part: WorkOrderPart;
  jobLines: WorkOrderJobLine[];
  onSave: (updatedPart: WorkOrderPartFormValues) => Promise<void>;
  onPartUpdated?: (formData: WorkOrderPartFormValues) => Promise<void>;
}

export function EditPartDialog({
  open,
  onOpenChange,
  onClose,
  part,
  jobLines,
  onSave,
  onPartUpdated
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: '',
    job_line_id: '',
    part_type: 'inventory'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        part_number: part.part_number || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        status: part.status || 'pending',
        notes: part.notes || '',
        job_line_id: part.job_line_id || '',
        part_type: part.part_type || 'inventory'
      });
    }
  }, [part]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else {
      onOpenChange(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    const errors = PartsFormValidator.validatePartForm(formData);
    if (errors.length > 0) {
      PartsFormValidator.showValidationErrors(errors);
      return;
    }

    setIsSubmitting(true);
    try {
      if (onPartUpdated) {
        await onPartUpdated(formData);
      } else {
        await onSave(formData);
      }
      PartsFormValidator.showSuccessToast('Part updated successfully');
      handleClose();
    } catch (error) {
      const errorMessage = PartsFormValidator.handleApiError(error);
      PartsFormValidator.showErrorToast(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({...formData, part_number: e.target.value})}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: parseInt(e.target.value) || 1})}
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
                onChange={(e) => setFormData({...formData, unit_price: parseFloat(e.target.value) || 0})}
                required
              />
            </div>

            <div>
              <Label htmlFor="part_type">Part Type *</Label>
              <Select
                value={formData.part_type}
                onValueChange={(value) => setFormData({...formData, part_type: value as any})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PART_TYPES.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type.charAt(0).toUpperCase() + type.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({...formData, status: value})}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {WORK_ORDER_PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="job_line_id">Assign to Job Line</Label>
              <Select
                value={formData.job_line_id}
                onValueChange={(value) => setFormData({...formData, job_line_id: value})}
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
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Updating...' : 'Update Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
