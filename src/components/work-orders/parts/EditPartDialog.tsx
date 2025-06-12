
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, WORK_ORDER_PART_STATUSES } from '@/types/workOrderPart';

interface EditPartDialogProps {
  part: WorkOrderPart;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: (updatedPart: WorkOrderPart) => void;
}

export function EditPartDialog({
  part,
  open,
  onOpenChange,
  onUpdate
}: EditPartDialogProps) {
  const [formData, setFormData] = useState({
    part_number: part.part_number || '',
    name: part.name || '',
    description: part.description || '',
    quantity: part.quantity || 1,
    unit_price: part.unit_price || 0,
    status: part.status || 'pending',
    notes: part.notes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const updatedPart: WorkOrderPart = {
      ...part,
      ...formData,
      total_price: formData.quantity * formData.unit_price,
      updated_at: new Date().toISOString()
    };
    
    onUpdate(updatedPart);
    onOpenChange(false);
  };

  const handleChange = (field: string, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Part Number *</label>
            <Input
              value={formData.part_number}
              onChange={(e) => handleChange('part_number', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Name *</label>
            <Input
              value={formData.name}
              onChange={(e) => handleChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <Textarea
              value={formData.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Quantity</label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleChange('quantity', parseInt(e.target.value) || 1)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Unit Price</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => handleChange('unit_price', parseFloat(e.target.value) || 0)}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Status</label>
            <Select 
              value={formData.status} 
              onValueChange={(value) => handleChange('status', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {WORK_ORDER_PART_STATUSES.map(status => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Notes</label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange('notes', e.target.value)}
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">Update Part</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
