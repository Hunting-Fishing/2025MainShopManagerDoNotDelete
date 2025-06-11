
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { WorkOrderPart, PART_CATEGORIES, PART_STATUSES, WARRANTY_DURATIONS } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface EditPartDialogProps {
  part: WorkOrderPart | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updatedPart: WorkOrderPart) => void;
}

export function EditPartDialog({ part, open, onOpenChange, onSave }: EditPartDialogProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPart>>({});

  useEffect(() => {
    if (part) {
      setFormData(part);
    }
  }, [part]);

  const handleSave = () => {
    if (!part || !formData.partName) {
      toast.error('Part name is required');
      return;
    }

    const updatedPart: WorkOrderPart = {
      ...part,
      ...formData,
      updatedAt: new Date().toISOString()
    };

    onSave(updatedPart);
    onOpenChange(false);
    toast.success('Part updated successfully');
  };

  if (!part) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Edit Part</DialogTitle>
        </DialogHeader>

        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partName: e.target.value }))}
                placeholder="Enter part name"
              />
            </div>
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, partNumber: e.target.value }))}
                placeholder="Enter part number"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierName">Supplier</Label>
              <Input
                id="supplierName"
                value={formData.supplierName || ''}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierName: e.target.value }))}
                placeholder="Enter supplier name"
              />
            </div>
            <div>
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {PART_CATEGORIES.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity *</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity || 1}
                onChange={(e) => setFormData(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
              />
            </div>
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, supplierCost: parseFloat(e.target.value) || 0 }))}
              />
            </div>
            <div>
              <Label htmlFor="customerPrice">Customer Price *</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice || 0}
                onChange={(e) => setFormData(prev => ({ ...prev, customerPrice: parseFloat(e.target.value) || 0 }))}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status || 'ordered'}
                onValueChange={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map(status => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="warrantyDuration">Warranty</Label>
              <Select
                value={formData.warrantyDuration || ''}
                onValueChange={(value) => setFormData(prev => ({ ...prev, warrantyDuration: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select warranty" />
                </SelectTrigger>
                <SelectContent>
                  {WARRANTY_DURATIONS.map(duration => (
                    <SelectItem key={duration} value={duration}>
                      {duration}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="isTaxable"
              checked={formData.isTaxable || false}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isTaxable: checked }))}
            />
            <Label htmlFor="isTaxable">Taxable</Label>
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes || ''}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Enter any notes about this part"
              rows={3}
            />
          </div>
        </div>

        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
