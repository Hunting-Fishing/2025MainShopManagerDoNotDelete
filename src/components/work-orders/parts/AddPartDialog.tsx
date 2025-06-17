
import React, { useState } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { createWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface AddPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  workOrderId: string;
  jobLines: WorkOrderJobLine[];
  onPartAdded: () => void;
}

export function AddPartDialog({
  isOpen,
  onClose,
  workOrderId,
  jobLines,
  onPartAdded
}: AddPartDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    job_line_id: '',
    notes: '',
    status: 'pending'
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.part_number || !formData.name) {
      toast({
        title: "Error",
        description: "Part number and name are required",
        variant: "destructive"
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const newPartData = {
        ...formData,
        work_order_id: workOrderId,
        total_price: formData.quantity * formData.unit_price
      };

      await createWorkOrderPart(newPartData);
      
      toast({
        title: "Success",
        description: "Part added successfully",
      });
      
      onPartAdded();
      onClose();
      
      // Reset form
      setFormData({
        part_number: '',
        name: '',
        description: '',
        quantity: 1,
        unit_price: 0,
        job_line_id: '',
        notes: '',
        status: 'pending'
      });
    } catch (error) {
      console.error('Error adding part:', error);
      toast({
        title: "Error",
        description: "Failed to add part",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add New Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="part_number">Part Number *</Label>
            <Input
              id="part_number"
              value={formData.part_number}
              onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
              required
            />
          </div>
          
          <div>
            <Label htmlFor="name">Part Name *</Label>
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
              value={formData.description || ''}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            
            <div>
              <Label htmlFor="unit_price">Unit Price</Label>
              <Input
                id="unit_price"
                type="number"
                min="0"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="job_line_id">Assign to Job Line (Optional)</Label>
            <Select
              value={formData.job_line_id || ''}
              onValueChange={(value) => setFormData({ ...formData, job_line_id: value || undefined })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select job line..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">No assignment</SelectItem>
                {jobLines.map((jobLine) => (
                  <SelectItem key={jobLine.id} value={jobLine.id}>
                    {jobLine.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting ? 'Adding...' : 'Add Part'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
