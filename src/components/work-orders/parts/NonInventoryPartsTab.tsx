
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

export function NonInventoryPartsTab({ workOrderId, jobLineId, onAddPart }: NonInventoryPartsTabProps) {
  const [formData, setFormData] = useState({
    partName: '',
    partNumber: '',
    supplierName: '',
    supplierCost: 0,
    markupPercentage: 20,
    retailPrice: 0,
    customerPrice: 0,
    quantity: 1,
    notes: ''
  });

  const handleInputChange = (field: string, value: string | number) => {
    const updatedData = { ...formData, [field]: value };
    
    // Auto-calculate prices when supplier cost or markup changes
    if (field === 'supplierCost' || field === 'markupPercentage') {
      const cost = field === 'supplierCost' ? Number(value) : updatedData.supplierCost;
      const markup = field === 'markupPercentage' ? Number(value) : updatedData.markupPercentage;
      
      const retailPrice = cost * (1 + markup / 100);
      updatedData.retailPrice = retailPrice;
      updatedData.customerPrice = retailPrice;
    }
    
    setFormData(updatedData);
  };

  const handleAddToWorkOrder = () => {
    if (!formData.partName) {
      return;
    }

    const partData: WorkOrderPartFormValues = {
      partName: formData.partName,
      partNumber: formData.partNumber || undefined,
      supplierName: formData.supplierName || undefined,
      supplierCost: formData.supplierCost,
      markupPercentage: formData.markupPercentage,
      retailPrice: formData.retailPrice,
      customerPrice: formData.customerPrice,
      quantity: formData.quantity,
      partType: 'non-inventory',
      notes: formData.notes || undefined
    };

    onAddPart(partData);
    
    // Reset form
    setFormData({
      partName: '',
      partNumber: '',
      supplierName: '',
      supplierCost: 0,
      markupPercentage: 20,
      retailPrice: 0,
      customerPrice: 0,
      quantity: 1,
      notes: ''
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Non-Inventory Part</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="part-name">Part Name *</Label>
            <Input
              id="part-name"
              value={formData.partName}
              onChange={(e) => handleInputChange('partName', e.target.value)}
              placeholder="Enter part name..."
            />
          </div>
          
          <div>
            <Label htmlFor="part-number">Part Number</Label>
            <Input
              id="part-number"
              value={formData.partNumber}
              onChange={(e) => handleInputChange('partNumber', e.target.value)}
              placeholder="Enter part number..."
            />
          </div>
        </div>

        <SupplierSelector
          value={formData.supplierName}
          onValueChange={(value) => handleInputChange('supplierName', value)}
          placeholder="Select or enter supplier..."
        />

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="supplier-cost">Supplier Cost ($)</Label>
            <Input
              id="supplier-cost"
              type="number"
              step="0.01"
              min="0"
              value={formData.supplierCost}
              onChange={(e) => handleInputChange('supplierCost', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="markup">Markup (%)</Label>
            <Input
              id="markup"
              type="number"
              step="1"
              min="0"
              value={formData.markupPercentage}
              onChange={(e) => handleInputChange('markupPercentage', parseFloat(e.target.value) || 0)}
            />
          </div>
          
          <div>
            <Label htmlFor="customer-price">Customer Price ($)</Label>
            <Input
              id="customer-price"
              type="number"
              step="0.01"
              min="0"
              value={formData.customerPrice}
              onChange={(e) => handleInputChange('customerPrice', parseFloat(e.target.value) || 0)}
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
            onChange={(e) => handleInputChange('quantity', parseInt(e.target.value) || 1)}
          />
        </div>

        <div>
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            value={formData.notes}
            onChange={(e) => handleInputChange('notes', e.target.value)}
            placeholder="Additional notes..."
            rows={3}
          />
        </div>

        <div className="flex justify-end">
          <Button 
            onClick={handleAddToWorkOrder}
            disabled={!formData.partName}
          >
            Add Part to Work Order
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
