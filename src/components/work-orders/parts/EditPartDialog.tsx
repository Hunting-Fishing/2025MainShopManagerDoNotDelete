
import React, { useState, useEffect } from 'react';
import { WorkOrderPart, WorkOrderPartFormValues } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';
import { Edit } from 'lucide-react';

interface EditPartDialogProps {
  isOpen: boolean;
  onClose: () => void;
  part: WorkOrderPart | null;
  jobLines: WorkOrderJobLine[];
  onPartUpdated: () => void;
}

export function EditPartDialog({
  isOpen,
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
    job_line_id: '',
    status: 'pending',
    notes: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        part_number: part.part_number,
        name: part.name,
        description: part.description || '',
        quantity: part.quantity,
        unit_price: part.unit_price,
        job_line_id: part.job_line_id || '',
        status: part.status || 'pending',
        notes: part.notes || ''
      });
    }
  }, [part]);

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!part || !formData.part_number || !formData.name) {
      toast({
        title: "Validation Error",
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
        description: formData.description || '',
        quantity: formData.quantity,
        unit_price: formData.unit_price,
        total_price: formData.quantity * formData.unit_price,
        job_line_id: formData.job_line_id || undefined,
        status: formData.status || 'pending',
        notes: formData.notes || '',
        updated_at: new Date().toISOString()
      };

      await updateWorkOrderPart(part.id, updatedPart);
      
      toast({
        title: "Part Updated",
        description: `${formData.name} has been updated successfully`,
      });

      onPartUpdated();
      onClose();
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!part) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Edit className="h-5 w-5" />
            Edit Part
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
                required
              />
            </div>
            <div>
              <Label htmlFor="name">Part Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
                required
              />
            </div>
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter part description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
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
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => handleInputChange('status', value)}>
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
          </div>

          <div>
            <Label htmlFor="job_line_id">Assign to Job Line</Label>
            <Select value={formData.job_line_id || ''} onValueChange={(value) => handleInputChange('job_line_id', value || undefined)}>
              <SelectTrigger>
                <SelectValue placeholder="Select job line or leave unassigned" />
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

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Add any additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
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
