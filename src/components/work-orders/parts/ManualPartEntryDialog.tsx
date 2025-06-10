
import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { WorkOrderPart, PART_CATEGORIES, PART_STATUSES } from '@/types/workOrderPart';
import { toast } from 'sonner';

interface ManualPartEntryDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  workOrderId: string;
  jobLineId?: string;
  onPartAdd: (part: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function ManualPartEntryDialog({
  open,
  onOpenChange,
  workOrderId,
  jobLineId,
  onPartAdd
}: ManualPartEntryDialogProps) {
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: '',
    markupPercentage: '50',
    quantity: '1',
    category: '',
    notes: '',
    status: 'ordered' as const
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    const supplierCost = parseFloat(formData.supplierCost) || 0;
    const markupPercentage = parseFloat(formData.markupPercentage) || 0;
    const quantity = parseInt(formData.quantity) || 1;
    const retailPrice = supplierCost * (1 + markupPercentage / 100);

    const newPart: Omit<WorkOrderPart, 'id' | 'createdAt' | 'updatedAt'> = {
      workOrderId,
      jobLineId: jobLineId || '',
      partName: formData.partName.trim(),
      partNumber: formData.partNumber.trim(),
      supplierName: formData.supplierName.trim(),
      supplierCost,
      markupPercentage,
      retailPrice,
      customerPrice: retailPrice,
      quantity,
      partType: 'non-inventory',
      category: formData.category,
      notes: formData.notes.trim(),
      status: formData.status,
      isTaxable: true,
      coreChargeAmount: 0,
      coreChargeApplied: false,
      isStockItem: false,
      dateAdded: new Date().toISOString(),
      attachments: []
    };

    onPartAdd(newPart);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: '',
      markupPercentage: '50',
      quantity: '1',
      category: '',
      notes: '',
      status: 'ordered'
    });
    
    onOpenChange(false);
    toast.success('Part added successfully');
  };

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Manual Part Entry</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="partName">Part Name *</Label>
            <Input
              id="partName"
              value={formData.partName}
              onChange={(e) => updateField('partName', e.target.value)}
              placeholder="Enter part name"
            />
          </div>

          <div>
            <Label htmlFor="partNumber">Part Number</Label>
            <Input
              id="partNumber"
              value={formData.partNumber}
              onChange={(e) => updateField('partNumber', e.target.value)}
              placeholder="Enter part number"
            />
          </div>

          <div>
            <Label htmlFor="supplierName">Supplier</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => updateField('supplierName', e.target.value)}
              placeholder="Enter supplier name"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="supplierCost">Cost ($)</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                value={formData.supplierCost}
                onChange={(e) => updateField('supplierCost', e.target.value)}
                placeholder="0.00"
              />
            </div>
            
            <div>
              <Label htmlFor="markupPercentage">Markup (%)</Label>
              <Input
                id="markupPercentage"
                type="number"
                value={formData.markupPercentage}
                onChange={(e) => updateField('markupPercentage', e.target.value)}
                placeholder="50"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => updateField('quantity', e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => updateField('status', value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {PART_STATUSES.map((status) => (
                    <SelectItem key={status} value={status}>
                      {status.charAt(0).toUpperCase() + status.slice(1).replace('-', ' ')}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select value={formData.category} onValueChange={(value) => updateField('category', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {PART_CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
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
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes..."
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit">
              Add Part
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
