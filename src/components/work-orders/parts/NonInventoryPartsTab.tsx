
import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<WorkOrderPartFormValues>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 25,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    notes: ''
  });

  const updateField = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate customer price when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage;
        updated.customerPrice = cost * (1 + markup / 100);
        updated.retailPrice = cost;
      }
      
      return updated;
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.partName.trim()) {
      alert('Part name is required');
      return;
    }

    onAddPart(formData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 25,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      partType: 'non-inventory',
      notes: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="partName">Part Name *</Label>
              <Input
                id="partName"
                value={formData.partName}
                onChange={(e) => updateField('partName', e.target.value)}
                placeholder="e.g., Radiator"
                required
              />
            </div>
            <div>
              <Label htmlFor="partNumber">Part Number</Label>
              <Input
                id="partNumber"
                value={formData.partNumber}
                onChange={(e) => updateField('partNumber', e.target.value)}
                placeholder="e.g., RAD-123456"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="supplierName">Supplier Name</Label>
            <Input
              id="supplierName"
              value={formData.supplierName}
              onChange={(e) => updateField('supplierName', e.target.value)}
              placeholder="e.g., AutoParts Supply Co."
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="supplierCost">Supplier Cost</Label>
              <Input
                id="supplierCost"
                type="number"
                step="0.01"
                min="0"
                value={formData.supplierCost}
                onChange={(e) => updateField('supplierCost', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
            <div>
              <Label htmlFor="markupPercentage">Markup %</Label>
              <Input
                id="markupPercentage"
                type="number"
                step="0.1"
                min="0"
                value={formData.markupPercentage}
                onChange={(e) => updateField('markupPercentage', parseFloat(e.target.value) || 0)}
                placeholder="25.0"
              />
            </div>
            <div>
              <Label htmlFor="customerPrice">Customer Price</Label>
              <Input
                id="customerPrice"
                type="number"
                step="0.01"
                min="0"
                value={formData.customerPrice.toFixed(2)}
                onChange={(e) => updateField('customerPrice', parseFloat(e.target.value) || 0)}
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="quantity">Quantity</Label>
            <Input
              id="quantity"
              type="number"
              min="1"
              value={formData.quantity}
              onChange={(e) => updateField('quantity', parseInt(e.target.value) || 1)}
              className="w-24"
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => updateField('notes', e.target.value)}
              placeholder="Additional notes about this part..."
              rows={3}
            />
          </div>

          <div className="flex justify-end">
            <Button type="submit" disabled={!formData.partName.trim()}>
              Add Part
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
