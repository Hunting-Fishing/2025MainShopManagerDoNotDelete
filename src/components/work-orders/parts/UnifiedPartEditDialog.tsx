
import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';
import { WorkOrderJobLine } from '@/types/jobLine';
import { updateWorkOrderPart } from '@/services/workOrder/workOrderPartsService';
import { toast } from '@/hooks/use-toast';

interface UnifiedPartEditDialogProps {
  part: WorkOrderPart | null;
  jobLines?: WorkOrderJobLine[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (part: WorkOrderPart) => Promise<void>;
}

export function UnifiedPartEditDialog({
  part,
  jobLines = [],
  open,
  onOpenChange,
  onSave
}: UnifiedPartEditDialogProps) {
  const [formData, setFormData] = useState({
    part_number: '',
    name: '',
    description: '',
    quantity: 1,
    unit_price: 0,
    job_line_id: '',
    status: 'pending',
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (part) {
      setFormData({
        part_number: part.part_number || '',
        name: part.name || '',
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

    setIsLoading(true);
    try {
      const totalPrice = formData.quantity * formData.unit_price;
      const updatedPart = await updateWorkOrderPart(part.id, {
        ...formData,
        total_price: totalPrice
      });
      
      await onSave(updatedPart);
      onOpenChange(false);
      
      toast({
        title: "Part Updated",
        description: "Part has been successfully updated.",
      });
    } catch (error) {
      console.error('Error updating part:', error);
      toast({
        title: "Error",
        description: "Failed to update part. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    onOpenChange(false);
    if (part) {
      setFormData({
        part_number: part.part_number || '',
        name: part.name || '',
        description: part.description || '',
        quantity: part.quantity || 1,
        unit_price: part.unit_price || 0,
        job_line_id: part.job_line_id || '',
        status: part.status || 'pending',
        notes: part.notes || ''
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="part_number">Part Number *</Label>
              <Input
                id="part_number"
                value={formData.part_number}
                onChange={(e) => setFormData({ ...formData, part_number: e.target.value })}
                placeholder="Enter part number"
              />
            </div>
            <div>
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Enter part name"
              />
            </div>
          </div>
          
          <div>
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Enter description"
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
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: parseInt(e.target.value) || 1 })}
              />
            </div>
            <div>
              <Label htmlFor="unit_price">Unit Price ($)</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: parseFloat(e.target.value) || 0 })}
                placeholder="0.00"
              />
            </div>
          </div>

          {jobLines.length > 0 && (
            <div>
              <Label htmlFor="job_line">Assigned Job Line</Label>
              <Select value={formData.job_line_id} onValueChange={(value) => setFormData({ ...formData, job_line_id: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select job line" />
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
          )}

          <div>
            <Label htmlFor="status">Status</Label>
            <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
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
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Additional notes"
              rows={2}
            />
          </div>

          <div className="text-sm text-muted-foreground">
            Total Price: ${(formData.quantity * formData.unit_price).toFixed(2)}
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSave} 
              disabled={isLoading || !formData.part_number.trim() || !formData.name.trim()}
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
