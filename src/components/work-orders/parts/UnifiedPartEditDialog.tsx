
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { EditService } from '@/services/workOrder/editService';

interface UnifiedPartEditDialogProps {
  part: WorkOrderPart | null;
  jobLines: WorkOrderJobLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (part: WorkOrderPart) => void;
}

export function UnifiedPartEditDialog({
  part,
  jobLines,
  open,
  onOpenChange,
  onSave
}: UnifiedPartEditDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPart>>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        name: part.name || '',
        part_number: part.part_number || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        job_line_id: part.job_line_id || '',
        status: part.status || 'pending',
        notes: part.notes || ''
      });
    }
  }, [part]);

  const handleSave = async () => {
    if (!part) return;

    setIsSaving(true);
    try {
      const updatedPart = await EditService.updatePart(part.id, formData);
      onSave(updatedPart);
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving part:', error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof WorkOrderPart, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatStatusLabel = (status: string) => {
    return status
      .split('-')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  if (!part) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="name">Part Name</Label>
            <Input
              id="name"
              value={formData.name || ''}
              onChange={(e) => handleInputChange('name', e.target.value)}
              placeholder="Part name"
            />
          </div>

          <div>
            <Label htmlFor="part_number">Part Number</Label>
            <Input
              id="part_number"
              value={formData.part_number || ''}
              onChange={(e) => handleInputChange('part_number', e.target.value)}
              placeholder="Part number"
            />
          </div>

          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description || ''}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Part description"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
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
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price || 0}
                onChange={(e) => handleInputChange('unit_price', parseFloat(e.target.value) || 0)}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="job_line">Job Line</Label>
            <Select 
              value={formData.job_line_id || ''} 
              onValueChange={(value) => handleInputChange('job_line_id', value || null)}
            >
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
            <Select 
              value={formData.status || 'pending'} 
              onValueChange={(value) => handleInputChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_PART_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {formatStatusLabel(status)}
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
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
