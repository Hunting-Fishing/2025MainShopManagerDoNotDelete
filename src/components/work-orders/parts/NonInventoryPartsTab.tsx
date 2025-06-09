
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({
  workOrderId,
  jobLineId,
  onAddPart
}: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState<Partial<WorkOrderPartFormValues>>({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 50,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    notes: '',
    partType: 'non-inventory'
  });

  const updateField = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : updated.supplierCost || 0;
        const markup = field === 'markupPercentage' ? value : updated.markupPercentage || 0;
        const retailPrice = cost * (1 + markup / 100);
        updated.retailPrice = Number(retailPrice.toFixed(2));
        updated.customerPrice = Number(retailPrice.toFixed(2));
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.partName || !formData.supplierCost || !formData.quantity) {
      return;
    }

    const part: WorkOrderPartFormValues = {
      partName: formData.partName!,
      partNumber: formData.partNumber || '',
      supplierName: formData.supplierName || '',
      supplierCost: formData.supplierCost!,
      markupPercentage: formData.markupPercentage || 50,
      retailPrice: formData.retailPrice || 0,
      customerPrice: formData.customerPrice || 0,
      quantity: formData.quantity!,
      notes: formData.notes || '',
      partType: 'non-inventory'
    };

    onAddPart(part);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 50,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      notes: '',
      partType: 'non-inventory'
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="part-name">Part Name *</Label>
            <Input
              id="part-name"
              value={formData.partName || ''}
              onChange={(e) => updateField('partName', e.target.value)}
              placeholder="Enter part name"
            />
          </div>
          
          <div>
            <Label htmlFor="part-number">Part Number</Label>
            <Input
              id="part-number"
              value={formData.partNumber || ''}
              onChange={(e) => updateField('partNumber', e.target.value)}
              placeholder="Enter part number"
            />
          </div>
        </div>

        {/* Enhanced Supplier Selector */}
        <SupplierSelector
          value={formData.supplierName || ''}
          onValueChange={(value) => updateField('supplierName', value)}
          placeholder="Select or enter supplier"
        />

        <div className="grid grid-cols-3 gap-4">
          <div>
            <Label htmlFor="supplier-cost">Supplier Cost *</Label>
            <Input
              id="supplier-cost"
              type="number"
              step="0.01"
              value={formData.supplierCost || ''}
              onChange={(e) => updateField('supplierCost', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
          
          <div>
            <Label htmlFor="markup">Markup %</Label>
            <Input
              id="markup"
              type="number"
              value={formData.markupPercentage || ''}
              onChange={(e) => updateField('markupPercentage', Number(e.target.value))}
              placeholder="50"
            />
          </div>
          
          <div>
            <Label htmlFor="customer-price">Customer Price</Label>
            <Input
              id="customer-price"
              type="number"
              step="0.01"
              value={formData.customerPrice || ''}
              onChange={(e) => updateField('customerPrice', Number(e.target.value))}
              placeholder="0.00"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity || ''}
            onChange={(e) => updateField('quantity', Number(e.target.value))}
            placeholder="1"
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes || ''}
            onChange={(e) => updateField('notes', e.target.value)}
            placeholder="Additional notes about this part"
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleSubmit}
            disabled={!formData.partName || !formData.supplierCost || !formData.quantity}
          >
            Add Part
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
