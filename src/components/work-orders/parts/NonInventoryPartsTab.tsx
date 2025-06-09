
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { WorkOrderPartFormValues } from '@/types/workOrderPart';
import { SupplierSelector } from './SupplierSelector';
import { toast } from 'sonner';

interface NonInventoryPartsTabProps {
  workOrderId: string;
  jobLineId?: string;
  onAddPart: (part: WorkOrderPartFormValues) => void;
}

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: '',
    markupPercentage: '',
    retailPrice: '',
    customerPrice: '',
    quantity: '',
    notes: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      
      // Auto-calculate prices when supplier cost or markup changes
      if (field === 'supplierCost' || field === 'markupPercentage') {
        const supplierCost = parseFloat(field === 'supplierCost' ? value : updated.supplierCost) || 0;
        const markupPercentage = parseFloat(field === 'markupPercentage' ? value : updated.markupPercentage) || 0;
        
        if (supplierCost > 0 && markupPercentage >= 0) {
          const retailPrice = supplierCost * (1 + markupPercentage / 100);
          updated.retailPrice = retailPrice.toFixed(2);
          updated.customerPrice = retailPrice.toFixed(2);
        }
      }
      
      return updated;
    });
  };

  const handleSubmit = () => {
    // Validate required fields
    if (!formData.partName.trim()) {
      toast.error('Part name is required');
      return;
    }

    if (!formData.quantity || parseFloat(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (!formData.customerPrice || parseFloat(formData.customerPrice) <= 0) {
      toast.error('Customer price must be greater than 0');
      return;
    }

    // Create part object
    const partData: WorkOrderPartFormValues = {
      partName: formData.partName.trim(),
      partNumber: formData.partNumber.trim() || undefined,
      supplierName: formData.supplierName.trim() || undefined,
      supplierCost: parseFloat(formData.supplierCost) || 0,
      markupPercentage: parseFloat(formData.markupPercentage) || 0,
      retailPrice: parseFloat(formData.retailPrice) || parseFloat(formData.customerPrice) || 0,
      customerPrice: parseFloat(formData.customerPrice) || 0,
      quantity: parseFloat(formData.quantity) || 1,
      partType: 'non-inventory',
      notes: formData.notes.trim() || undefined
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: '',
      markupPercentage: '',
      retailPrice: '',
      customerPrice: '',
      quantity: '',
      notes: ''
    });

    toast.success('Part added successfully');
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="partName">Part Name *</Label>
          <Input
            id="partName"
            value={formData.partName}
            onChange={(e) => handleInputChange('partName', e.target.value)}
            placeholder="Enter part name"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="partNumber">Part Number</Label>
          <Input
            id="partNumber"
            value={formData.partNumber}
            onChange={(e) => handleInputChange('partNumber', e.target.value)}
            placeholder="Enter part number"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplier">Supplier</Label>
          <SupplierSelector
            value={formData.supplierName}
            onChange={(value) => handleInputChange('supplierName', value)}
            placeholder="Select or add supplier"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity *</Label>
          <Input
            id="quantity"
            type="number"
            min="1"
            step="1"
            value={formData.quantity}
            onChange={(e) => handleInputChange('quantity', e.target.value)}
            placeholder="Enter quantity"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="supplierCost">Supplier Cost</Label>
          <Input
            id="supplierCost"
            type="number"
            min="0"
            step="0.01"
            value={formData.supplierCost}
            onChange={(e) => handleInputChange('supplierCost', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="markupPercentage">Markup %</Label>
          <Input
            id="markupPercentage"
            type="number"
            min="0"
            step="1"
            value={formData.markupPercentage}
            onChange={(e) => handleInputChange('markupPercentage', e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="retailPrice">Retail Price</Label>
          <Input
            id="retailPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.retailPrice}
            onChange={(e) => handleInputChange('retailPrice', e.target.value)}
            placeholder="0.00"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="customerPrice">Customer Price *</Label>
          <Input
            id="customerPrice"
            type="number"
            min="0"
            step="0.01"
            value={formData.customerPrice}
            onChange={(e) => handleInputChange('customerPrice', e.target.value)}
            placeholder="0.00"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="notes">Notes</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => handleInputChange('notes', e.target.value)}
          placeholder="Additional notes about this part"
          rows={3}
        />
      </div>

      <div className="flex justify-end">
        <Button onClick={handleSubmit} className="w-full md:w-auto">
          Add Non-Inventory Part
        </Button>
      </div>
    </div>
  );
}
