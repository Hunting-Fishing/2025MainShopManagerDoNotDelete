
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { partStatusMap } from '@/types/workOrderPart';

interface AddPartDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: (part: WorkOrderPart) => void;
}

export function AddPartDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    job_line_id: '',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const partData: Omit<WorkOrderPart, 'id' | 'created_at' | 'updated_at'> = {
        work_order_id: workOrderId,
        job_line_id: formData.job_line_id || undefined,
        part_number: formData.part_number,
        name: formData.name,
        description: formData.description,
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        status: formData.status,
        notes: formData.notes
      };

      // Import the service dynamically to avoid circular dependencies
      const { createWorkOrderPart } = await import('@/services/workOrder/workOrderPartsService');
      const newPart = await createWorkOrderPart(partData);
      
      onPartAdded(newPart);
      onOpenChange(false);
      
      // Reset form
      setFormData({
        part_number: '',
        name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        status: 'pending',
        job_line_id: '',
        notes: ''
      });
    } catch (error) {
      console.error('Error adding part:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
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
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
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
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(partStatusMap).map(([value, { label }]) => (
                    <SelectItem key={value} value={value}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="job_line_id">Assign to Job Line</Label>
              <Select value={formData.job_line_id} onValueChange={(value) => handleInputChange('job_line_id', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job line" />
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
              onChange={(e) => handleInputChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Total: ${(formData.quantity * formData.unit_price).toFixed(2)}
          </div>
        </form>

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            onClick={handleSubmit}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Adding...' : 'Add Part'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
