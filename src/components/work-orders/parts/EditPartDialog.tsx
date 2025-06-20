
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';

export interface EditPartDialogProps {
  part: WorkOrderPart | null;
  open: boolean;
  onClose?: () => void;
  onOpenChange?: (open: boolean) => void;
  onSave: (part: WorkOrderPart) => Promise<void>;
  jobLines?: WorkOrderJobLine[];
}

export function EditPartDialog({
  part,
  open,
  onClose,
  onOpenChange,
  onSave,
  jobLines = []
}: EditPartDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPart>>({
    name: '',
    part_number: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    status: 'pending',
    notes: ''
  });

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
        job_line_id: part.job_line_id || ''
      });
    }
  }, [part]);

  const handleClose = () => {
    if (onClose) {
      onClose();
    } else if (onOpenChange) {
      onOpenChange(false);
    }
  };

  const handleSave = async () => {
    if (!part) return;

    const updatedPart: WorkOrderPart = {
      ...part,
      ...formData,
      total_price: (formData.quantity || 0) * (formData.unit_price || 0),
      updated_at: new Date().toISOString()
    };

    await onSave(updatedPart);
  };

  const handleInputChange = (field: keyof WorkOrderPart, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange || handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>
            {part?.id?.startsWith('temp-') ? 'Add Part' : 'Edit Part'}
          </DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Part Name</Label>
              <Input
                id="name"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter part name"
              />
            </div>
            <div>
              <Label htmlFor="part_number">Part Number</Label>
              <Input
                id="part_number"
                value={formData.part_number || ''}
                onChange={(e) => handleInputChange('part_number', e.target.value)}
                placeholder="Enter part number"
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
              rows={3}
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || 1}
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
                value={formData.unit_price || 0}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
            <div>
              <Label htmlFor="total">Total</Label>
              <Input
                id="total"
                type="number"
                value={((formData.quantity || 0) * (formData.unit_price || 0)).toFixed(2)}
                disabled
                className="bg-muted"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'pending'}
                onValueChange={(value) => handleInputChange('status', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="ordered">Ordered</SelectItem>
                  <SelectItem value="received">Received</SelectItem>
                  <SelectItem value="installed">Installed</SelectItem>
                  <SelectItem value="returned">Returned</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {jobLines.length > 0 && (
              <div>
                <Label htmlFor="job_line">Assign to Job Line</Label>
                <Select
                  value={formData.job_line_id || ''}
                  onValueChange={(value) => handleInputChange('job_line_id', value)}
                >
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
            )}
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => handleInputChange('notes', e.target.value)}
              placeholder="Additional notes about this part"
              rows={2}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Part
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
