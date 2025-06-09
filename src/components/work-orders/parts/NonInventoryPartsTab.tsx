
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
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
    markupPercentage: 25,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    partType: 'non-inventory',
    notes: ''
  });

  const handleInputChange = (field: keyof WorkOrderPartFormValues, value: any) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const cost = field === 'supplierCost' ? value : (updated.supplierCost || 0);
        const markup = field === 'markupPercentage' ? value : (updated.markupPercentage || 25);
        
        const retailPrice = cost * (1 + markup / 100);
        updated.retailPrice = retailPrice;
        updated.customerPrice = retailPrice; // Default customer price to retail price
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    if (!formData.partName?.trim()) {
      return;
    }

    const part: WorkOrderPartFormValues = {
      partName: formData.partName!,
      partNumber: formData.partNumber || '',
      supplierName: formData.supplierName || '',
      supplierCost: Number(formData.supplierCost) || 0,
      markupPercentage: Number(formData.markupPercentage) || 25,
      retailPrice: Number(formData.retailPrice) || 0,
      customerPrice: Number(formData.customerPrice) || 0,
      quantity: Number(formData.quantity) || 1,
      partType: 'non-inventory',
      notes: formData.notes || ''
    };

    onAddPart(part);
    
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

  const isValid = formData.partName?.trim();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName || ''}
            onChange={(e) => handleInputChange('partName', e.target.value)}
            placeholder="Enter part name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber || ''}
            onChange={(e) => handleInputChange('partNumber', e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName || ''}
            onChange={(value) => handleInputChange('supplierName', value)}
            placeholder="Select or add supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            value={formData.quantity || 1}
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost ($)</Label>
          <Input
            id="supplierCost"
            type="number"
            min="0"
            step="0.01"
            value={formData.supplierCost || ''}
            onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="markupPercentage">Markup (%)</Label>
          <Input
            id="markupPercentage"
            type="number"
            min="0"
            step="1"
            value={formData.markupPercentage || 25}
            onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 25)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail Price ($)</Label>
          <Input
            id="retailPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.retailPrice || ''}
            onChange={(e) => handleInputChange('retailPrice', parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPrice">Customer Price ($)</Label>
          <Input
            id="customerPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.customerPrice || ''}
            onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes || ''}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this part"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button 
          onClick={handleSubmit}
          disabled={!isValid}
          className="bg-blue-600 hover:bg-blue-700"
        >
          Add Part
        </Button>
      </div>
    </div>
  );
}
